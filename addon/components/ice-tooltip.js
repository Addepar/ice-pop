import Ember from 'ember';
import layout from '../templates/components/ice-tooltip';

const {
  Component,
  run,
  generateGuid
} = Ember;

/**
 * @module Ice Pop
 * @main ice-pop
 */

/**
 * Super simple tooltip component that uses popper.js. By default it targets its
 * parent element for placement and warps itself to the root of the DOM, but it
 * can also take a target selector as an option.
 *
 * ```hbs
 * <div class="target">
 *   \{{#ice-tooltip placement="bottom"}}
 *     Some text
 *   {{/ice-tooltip}}
 * </div>
 * ```
 *
 * @class IceTooltip
 * @extends Ember.Component
 */
export default class IceTooltip extends Component {
  init() {
    super.init(...arguments);

    // ----- Public Settings ------

    /**
     * Used to determine the placement of the tooltip
     *
     * @public
     * @property placement
     * @type String
     * @default 'auto'
     */
    this.placement = this.placement || 'auto';

    /**
     * Selector or Element
     *
     * @public
     * @property target
     * @type String|HTMLElement
     * @default null
     */
    this.target = this.target || null;

    // ----- Private Variables -----

    this.layout = layout;

    /**
     * Used to track if the tooltip is open and appended to the DOM
     *
     * @private
     * @property isOpen
     * @type Boolean
     */
    this.isOpen = false;

    /**
     * Used to track whether fade in/out animation should trigger
     *
     * @private
     * @property isShowing
     * @type Boolean
     */
    this.isShowing = false;

    /**
     * Used to store the popper element for adding/removing event listeners
     *
     * @private
     * @property _popperElement
     * @type HTMLElement
     */
    this._popperElement = null;

    /**
     * Used to target/select the popper element after it's been inserted
     *
     * @private
     * @property _popperId
     * @type String
     */
    this._popperId = generateGuid();
  }

  didInsertElement() {
    let target = this.get('target') || this.element.parentNode;

    if (typeof target === 'string') {
      const nodes = document.querySelectorAll(target);

      // TODO: Add an assertion that throws if more than one node exists
      target = nodes[0];
    }

    this._target = target;

    this._mouseEnterHandler = () => {
      // Schedule these separately so that the element gets fully attached by setting
      // `isShowing` to true, and only _then_ setting `isVisible` to true, triggering the
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
