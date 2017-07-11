import Ember from 'ember';
import { property } from '@addepar/ice-box/utils/class';

import layout from '../templates/components/ice-popover';

const {
  run,
  generateGuid,
  Component
} = Ember;

/**
 * Super simple popover component that uses popper.js. By default it targets its
 * parent element for placement and warps itself to the root of the DOM, but it
 * can also take a target selector as an option.
 *
 * ```hbs
 * <div class="target">
 *   Some text
 *   \{{#ice-popover placement="bottom"}}
 *     Some text
 *   {{/ice-popover}}
 * </div>
 * ```
 *
 */
export default class IcePopover extends Component {
  @property layout = layout

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the tooltip
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @property placement = 'right-start'

  /**
   * Selector or Element
   */
  @property target = null

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
    super.init(...arguments);

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

    this._clickHandler = () => {
      if (this.get('isOpen') === false) {
        this._insertPopover();
      } else {
        this._removePopover();
      }
    };

    this._transitionEndHandler = () => {
      if (this.get('isShowing') === false) {
        run(() => this.set('isOpen', false));

        this._popperElement.removeEventListener('transitionend', this._transitionEndHandler);

        this._popperElement = null;
      }
    };

    this._insertPopover = () => {
      // Schedule these separately so that the element gets fully attached by setting
      // `isOpen` to true, and only _then_ setting `isShowing` to true, triggering the
      // CSS transition
      run(() => this.set('isOpen', true));

      this._insertFrame = requestAnimationFrame(() => {
        run(() => this.set('isShowing', true));
      });

      this._popperElement = document.getElementById(this._popperId);

      this._popperElement.addEventListener('transitionend', this._transitionEndHandler);
      document.body.addEventListener('click', this._removePopover);

      // Temporarily prevent the popover from closing if you click inside it
      // (This is a bad hack we need to replace)
      this._popperElement.addEventListener('click', this._insertPopover);
    };

    this._removePopover = () => {
      run(() => this.set('isShowing', false));
    };

    this._target.addEventListener('click', this._clickHandler);
  }

  willDestroyElement() {
    cancelAnimationFrame(this._insertFrame);
    this._target.removeEventListener('click', this._clickHandler);
    document.body.removeEventListener('click', this._removePopover);
  }
}
