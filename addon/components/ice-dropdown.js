import { DEBUG } from '@glimmer/env';

import Component from '@ember/component';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';

import { argument, type, immutable } from 'ember-argument-decorators';
import { unionOf } from 'ember-argument-decorators/types';

import layout from '../templates/components/ice-dropdown';

/**
 * Super simple dropdown component that uses popper.js. By default it targets its
 * parent element for placement and warps itself to the root of the DOM, but it
 * can also take a target selector as an option.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown}}
 *     Dropdown with defaults
 *   {{/ice-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown placement="bottom"}}
 *     Dropdown with custom placement
 *   {{/ice-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown class="custom-class"}}
 *     Dropdown with custom class
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown closeItems="false"}}
 *     By default, clicking any dropdown menu link will close the dropdown,
 *     but you can turn this off via closeItems="false" if you need to handle closing manually
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div data-dropdown-target>
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 * </div>
 * {{#ice-dropdown target="[data-dropdown-target]"}}
 *   Dropdown with external target, should be a unique id or attribute
 * {{/ice-dropdown}}
 * ```
 */
export default class IceDropdown extends Component {
  layout = layout

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the tooltip
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @argument
  @type('string')
  placement = 'bottom-start';

  /**
   * Selector or Element
   */
  @immutable
  @argument
  @type(unionOf(null, 'string', Element))
  target = null;

  @argument
  @type('boolean')
  renderInPlace = false;

  /**
   * Determines whether this dropdown should be triggered by hover on the target
   */
  @argument
  @type('boolean')
  isTriggeredOnHover = false;

  /**
   * By default a dropdown will add the [data-dropdown-close] attribute to all items
   * in the dropdown list. If you instead need to do it manually for finer control, set to false.
   */
  @argument
  @type('boolean')
  closeItems = true;

  // ----- Private Variables -----

  /**
   * Used to track if the tooltip is open and appended to the DOM
   */
  @type('boolean')
  isOpen = false;

  /**
   * Used to track whether fade in/out animation should trigger
   */
  @type('boolean')
  isShowing = false;

  /**
   * Used to store the popper element for adding/removing event listeners
   */
  _popperElement = null;

  /**
   * Used to target/select the popper element after it's been inserted
   */
  _popperId = `${guidFor(this)}_popper`;

  /**
   * Used to as a proxy to pass along the class of this component to the actual popper
   */
  _popperClass = '';

  constructor() {
    super();

    this._popperClass = this.class;
    this._popperClass += ` ${this.classNames.join(' ')}`;

    for (const binding of this.classNameBindings) {
      if (binding.value) {
        this._popperClass += ` ${binding.value()}`;
      }
    }
  }

  didInsertElement() {
    this.element.className = '';

    let target = this.get('target') || this.element.parentNode;

    if (typeof target === 'string') {
      const nodes = document.querySelectorAll(target);

      // TODO: Add an assertion that throws if more than one node exists
      target = nodes[0];
    }

    this._target = target;

    // Add initial dropdown placement to the target element so that it can apply
    // any special styling based on the dropdown's direction.
    this._target.setAttribute('dropdown-placement', this.get('placement'));
    // Add toggle class to target element, for open/closed or any styling needs.
    this._target.classList.add('ice-dropdown-toggle');

    // Click handler is used by default, when isTriggeredOnHover is false
    this._clickHandler = () => {
      if (this.get('isOpen') === false) {
        this._insertDropdown();
      }
    };

    // Hover is used when isTriggeredOnHover is true
    this._mouseEnterHandler = () => {
      this._insertDropdown();

      this._popperElement.addEventListener('mouseenter', this._mouseEnterHandler);
      this._popperElement.addEventListener('mouseleave', this._mouseLeaveHandler);
    };

    this._mouseLeaveHandler = () => {
      this._removeDropdown();
    };

    this._transitionEndHandler = () => {
      if (this.get('isShowing') === false) {
        run(() => this.set('isOpen', false));

        this._popperElement.removeEventListener('transitionend', this._transitionEndHandler);

        this._popperElement = null;

        // remove body listener here instead of _removeDropdown, so we are sure
        // the dropdown is actually closed first, otherwise a dropdown can be left
        // open with no way to close
        document.body.removeEventListener('click', this._handleBodyClick);

        // Similarly, we don't want the active styling to change until the dropdown
        // is actually closed
        this._target.classList.remove('is-active');
      }
    };

    this._handleBodyClick = (event) => {
      // We do not want _removeDropdown to trigger yet when clicking inside of the dropdown.
      // Here we check whether the body click event was also a dropdown container click event.
      // We are comparing the click events because tracking the click element itself can
      // be buggy if the content within the dropdown ever changes while its still open.
      if (event !== this.eventClick) {
        this._removeDropdown();
      }
      // We still want to allow purposeful closing of the dropdown from within,
      // so this closes the dropdown if the click target has [data-dropdown-close]
      // attribute, regardless of where it is in the dom.
      // (This could be problematic in the future if we ever have the use case for
      // multiple dropdowns open. This would close all of them at the same time.)
      if (event.target.attributes['data-dropdown-close']) {
        this._removeDropdown();
      }
    };

    this._insertDropdown = () => {
      // Schedule these separately so that the element gets fully attached by setting
      // `isOpen` to true, and only _then_ setting `isShowing` to true, triggering the
      // CSS transition
      run(() => this.set('isOpen', true));

      this._insertFrame = requestAnimationFrame(() => {
        run(() => this.set('isShowing', true));
      });

      this._popperElement = document.getElementById(this._popperId);

      this._popperElement.addEventListener('transitionend', this._transitionEndHandler);

      // We are storing the click event that happens directly on the dropdown container
      // so that we can later compare it to the body click for closing logistics
      this._popperElement.addEventListener('click', (event) => {
        this.eventClick = event;
      });

      document.body.addEventListener('click', this._handleBodyClick);

      // Add is-active class to target element, for styling needs based on whether
      // the dropdown is currently open
      this._target.classList.add('is-active');

      if (this.get('closeItems')) {
        // This makes the assumption that actions are placed on anchor elements, not on the li
        const dropdownItems = this._popperElement.querySelectorAll('.ice-dropdown-menu li a');
        dropdownItems.forEach(function(item) {
          item.setAttribute('data-dropdown-close', '');
        });
      }

      // Add attribute used for tests, is not used in prod
      if (DEBUG & this.get('isTriggeredOnHover')) {
        this._popperElement.setAttribute('data-test-sub-dropdown', '');
      } else if (DEBUG) {
        this._popperElement.setAttribute('data-test-dropdown', '');
      }
    };

    this._removeDropdown = () => {
      run(() => this.set('isShowing', false));
    };

    if (this.get('isTriggeredOnHover')) {
      this._target.addEventListener('mouseenter', this._mouseEnterHandler);
      this._target.addEventListener('mouseleave', this._mouseLeaveHandler);
    } else {
      this._target.addEventListener('click', this._clickHandler);
    }
  }

  willDestroyElement() {
    cancelAnimationFrame(this._insertFrame);
    if (!this.isTriggeredOnHover) {
      this._target.removeEventListener('click', this._clickHandler);
    } else {
      this._target.removeEventListener('mouseenter', this._mouseEnterHandler);
      this._target.removeEventListener('mouseleave', this._mouseLeaveHandler);
    }
    document.body.removeEventListener('click', this._handleBodyClick);
  }
}
