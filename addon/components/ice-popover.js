import Ember from 'ember';
import { property } from '@addepar/ice-box/utils/class';
import { DEBUG } from '@glimmer/env';

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
   * An optional class to pass to the popover itself.
   */
  @property popoverClass = null

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
    this._popperClass = this.class || '';
    this._popperClass += this.classNames.join(' ');
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

    this._clickHandler = () => {
      if (this.get('isOpen') === false) {
        this._insertPopover();
      }
    };

    // Determines whether or not a body click should close the currently open popover
    this._handleBodyClick = (event) => {
      // We do not want _removePopover to trigger when clicking inside of the popover.
      // Here we check whether the body click event was also a popover container click event.
      // We are comparing the click events because tracking the click element itself can
      // be buggy if the content within the popover ever changes while its still open.
      if (event !== this.eventClick) {
        this._removePopover();
      }
      // We still want to allow purposeful closing of the popover from within,
      // so this closes the popover if the click target has [data-popover-close]
      // attribute, regardless of where it is in the dom.
      // (This could be problematic in the future if we ever have the use case for
      // multiple popovers open. This would close all of them at the same time.)
      if (event.target.attributes['data-popover-close']) {
        this._removePopover();
      }
    };

    this._transitionEndHandler = () => {
      if (this.get('isShowing') === false) {
        run(() => this.set('isOpen', false));

        this._popperElement.removeEventListener('transitionend', this._transitionEndHandler);

        this._popperElement = null;

        // remove body listener here instead of _removePopover, so we are sure
        // the popover is actually closed first, otherwise a popover can be left
        // open with no way to close
        document.body.removeEventListener('click', this._handleBodyClick);
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

      // We are storing the click event that happens directly on the popover container
      // so that we can later compare it to the body click for closing logistics
      this._popperElement.addEventListener('click', (event) => {
        this.eventClick = event;
      });

      document.body.addEventListener('click', this._handleBodyClick);

      // Add attribute used for tests, is not used in prod
      if (DEBUG) {
        this._popperElement.setAttribute('data-test-popover', '');
      }
    };

    this._removePopover = () => {
      run(() => this.set('isShowing', false));
    };

    this._target.addEventListener('click', this._clickHandler);
  }

  willDestroyElement() {
    cancelAnimationFrame(this._insertFrame);
    this._target.removeEventListener('click', this._clickHandler);
    document.body.removeEventListener('click', this._handleBodyClick);
  }
}
