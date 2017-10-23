import { DEBUG } from '@glimmer/env';

import Component from '@ember/component';
import { run } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';

import { argument, type, immutable } from 'ember-argument-decorators';
import { unionOf } from 'ember-argument-decorators/types';

import layout from '../templates/components/ice-tooltip';

/**
 * Super simple tooltip component that uses popper.js. By default it targets its
 * parent element for placement and warps itself to the root of the DOM, but it
 * can also take a target selector as an option.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   {{#ice-tooltip}}
 *     Tootip with defaults
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-tooltip placement="bottom"}}
 *     Tooltip with custom placement
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-tooltip class="error-tooltip"}}
 *     Tooltip with custom class
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div data-tooltip-target>
 *   Target text
 * </div>
 * {{#ice-tooltip target="[data-tooltip-target]"}}
 *   Tooltip with external target, should be a unique id or attribute
 * {{/ice-tooltip}}
 * ```
 */
export default class IceTooltip extends Component {
  layout = layout

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the tooltip;
   * Can choose between auto, top, right, bottom, left;
   * Can also add -start or -end modifier
   */
  @argument
  @type('string')
  placement = 'auto';

  /**
   * Selector or Element
   */
  @immutable
  @argument
  @type(unionOf(null, 'string', Element))
  target = null;

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
  _popperElement = null

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

    this._popperClass = this.class || '';
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

    this._mouseEnterHandler = () => {
      // Schedule these separately so that the element gets fully attached by setting
      // `isOpen` to true, and only _then_ setting `isShowing` to true, triggering the
      // CSS transition
      run(() => this.set('isOpen', true));

      this._insertFrame = requestAnimationFrame(() => {
        run(() => this.set('isShowing', true));
      });

      this._popperElement = document.getElementById(this._popperId);

      // Adds the same mouseenter/mouseleave handlers as the target object. If
      // the tooltip is entered before the transition has completed, `isVisible` will
      // be reset to true and when `transitionend` fires it will do nothing.
      this._popperElement.addEventListener('mouseenter', this._mouseEnterHandler);
      this._popperElement.addEventListener('mouseleave', this._mouseLeaveHandler);
      this._popperElement.addEventListener('transitionend', this._transitionEndHandler);

      // Add attribute used for tests, is not used in prod
      if (DEBUG) {
        this._popperElement.setAttribute('data-test-tooltip', '');
      }
    };

    this._mouseLeaveHandler = () => {
      run(() => this.set('isShowing', false));
    };

    this._transitionEndHandler = () => {
      if (this.get('isShowing') === false) {
        run(() => this.set('isOpen', false));

        this._popperElement.removeEventListener('mouseenter', this._mouseEnterHandler);
        this._popperElement.removeEventListener('mouseleave', this._mouseLeaveHandler);
        this._popperElement.removeEventListener('transitionend', this._transitionEndHandler);

        this._popperElement = null;
      }
    };

    this._target.addEventListener('mouseenter', this._mouseEnterHandler);
    this._target.addEventListener('mouseleave', this._mouseLeaveHandler);
  }

  willDestroyElement() {
    cancelAnimationFrame(this._insertFrame);
    this._target.removeEventListener('mouseenter', this._mouseEnterHandler);
    this._target.removeEventListener('mouseleave', this._mouseLeaveHandler);
  }
}
