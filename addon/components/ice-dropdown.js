import Ember from 'ember';
import { property } from '@addepar/ice-box/utils/class';

import layout from '../templates/components/ice-dropdown';


const {
  run,
  generateGuid,
  Component
} = Ember;

/**
 * Super simple dropdown component that uses popper.js. By default it targets its
 * parent element for placement and warps itself to the root of the DOM, but it
 * can also take a target selector as an option.
 *
 * ```hbs
 * <button class="button-default">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown}}
 *     Menu
 *   {{/ice-dropdown}}
 * </button>
 * ```
 *
 */
export default class IceDropdown extends Component {
  @property layout = layout

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the tooltip
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @property placement = 'bottom-start'

  /**
   * Selector or Element
   */
  @property target = null

  /**
   * Determines whether this dropdown should be triggered by hover on the target
   */
  @property isTriggeredOnHover = false

  /**
   * By default a dropdown will add the [data-dropdown-close] attribute to all items
   * in the dropdown list. If you instead need to do it manually for finer control, set to false.
   */
  @property closeItems = true

  // ----- Private Variables -----

  /**
   * Used to track if the tooltip is open and appended to the DOM
   */
  @property isOpen = false

  /**
   * Used to track whether fade in/out animation should trigger
   */
  @property isShowing = false

  /**
   * Used to store the popper element for adding/removing event listeners
   */
  @property _popperElement = null

  /**
   * Used to target/select the popper element after it's been inserted
   */
  @property _popperId = ''

  init() {
    this._popperClass = this.class || '';
    this._popperClass += this.classNames.join(' ');
    this.classNames = [];
    this._popperId = generateGuid();

    super.init(...arguments);
  }

  didInsertElement() {
    let target = this.get('target') || this.element.parentNode;

    if (typeof target === 'string') {
      const nodes = document.querySelectorAll(target);

      // TODO: Add an assertion that throws if more than one node exists
      target = nodes[0];
    }

    this._target = target;

    // Add initial dropdown placement to the target element so that it can apply
    // any special styling based on the dropdown's direction.
    this._target.setAttribute('dropdown-placement', this.placement);
    // Add toggle class to target element, for open/closed or any styling needs.
    this._target.classList.add('ice-dropdown-toggle');

    // Click handler is used by default, when isTriggeredOnHover is false
    this._clickHandler = (event) => {
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

      if (this.closeItems) {
        // This makes the assumption that actions are placed on anchor elements, not on the li
        let dropdownItems = this._popperElement.querySelectorAll('.ice-dropdown-menu li a');
        dropdownItems.forEach(function(item) {
          item.setAttribute('data-dropdown-close', '');
        });
      }
    };

    this._removeDropdown = () => {
      run(() => this.set('isShowing', false));
    };

    if (this.isTriggeredOnHover) {
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
