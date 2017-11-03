import Component from '@ember/component';
import { guidFor } from '@ember/object/internals';
import { run } from '@ember/runloop';

import { action } from 'ember-decorators/object';

import { argument, type, immutable } from 'ember-argument-decorators';

import { scheduler as raf } from 'ember-raf-scheduler';

function closest(node, selector) {
  let currentNode = node;

  while (currentNode !== document.body && currentNode !== null) {
    if (currentNode.matches(selector)) {
      return currentNode;
    }

    currentNode = currentNode.parentNode;
  }

  return null;
}

/**
 * Base class which ice-popover, ice-tooltip, and ice-dropdown all inherit from.
 * Adds the event listeners and data attributes that are common to all of the popover-like
 * components, and wraps all of their functionality.
 */
export default class BasePopoverComponent extends Component {
  // ----- Arguments ------

  /**
   * Used to determine the placement of the popover
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @argument
  @type('string')
  placement = 'auto';

  /**
   * Determines whether or not the popover should render in place
   */
  @argument
  @type('boolean')
  renderInPlace = false;

  /**
   * The event that triggers the popover, can be `click` or `hover`,
   * should be provided by the subclass
   */
  @immutable
  @argument
  @type('string')
  triggerEvent = null;

  // ----- Private Variables -----

  /**
   * Tracks if the tooltip is open
   */
  @type('boolean')
  isOpen = false;

  /**
   * Stores the trigger element for adding/removing event listeners and data attributes
   */
  _triggerElement = null;

  /**
   * Stores the popper element for adding/removing event listeners and data attributes
   */
  _popperElement = null;

  /**
   * Used as proxy to pass along the class of this component to the actual popper
   */
  _popperClass = '';

  constructor() {
    super();

    this._popperClass = `ice-base-popover ${this.class || ''} ${this.classNames.join(' ')}`;

    for (const binding of this.classNameBindings) {
      if (binding.value) {
        this._popperClass += ` ${binding.value()}`;
      }
    }
  }

  didInsertElement() {
    this._triggerElement = this.element.parentNode;
    this._triggerElement.setAttribute('data-popover-trigger', guidFor(this));

    if (this.get('triggerEvent') === 'click') {
      this._triggerElement.addEventListener('mousedown', this._openPopoverHandler);
    } else {
      this._triggerElement.addEventListener('mouseenter', this._openPopoverHandler);
      this._triggerElement.addEventListener('mouseleave', this._closePopoverHandler);
    }
  }

  willDestroyElement() {
    raf.forget(this._insertFrame);

    if (this.get('triggerEvent') === 'click') {
      this._triggerElement.removeEventListener('mousedown', this._openPopoverHandler);
    } else {
      this._triggerElement.removeEventListener('mouseenter', this._openPopoverHandler);
      this._triggerElement.removeEventListener('mouseleave', this._closePopoverHandler);
    }

    this._triggerElement.removeAttribute('data-popover-trigger');

    document.body.removeEventListener('mouseup', this._handleBodyClick);
  }

  /**
   * Inserts the popover and sets up the body click listener
   */
  _insertPopover() {
    // Schedule these separately so that the element gets fully attached by setting
    // `isOpen` to true, and only _then_ setting `isShowing` to true, triggering the
    // CSS transition
    run(() => this.set('isOpen', true));

    document.body.addEventListener('mouseup', this._handleBodyClick);
  }

  /**
   * Removes the popover and tears down the body click listener
   */
  _removePopover() {
    run(() => this.set('isOpen', false));

    document.body.removeEventListener('mouseup', this._handleBodyClick);
  }

  /**
   * Triggers when the popover has entered the DOM and the API has been established,
   * allowing us to add data attributes and event handlers and mark the trigger as active
   *
   * @param {PopperAPI} api - The API received from the underlying popper
   */
  @action
  popoverOpened({ popperElement }) {
    this._popperElement = popperElement;
    this._popperElement.setAttribute('data-popover-content', guidFor(this));
    this._triggerElement.classList.add('is-active');

    if (this.get('triggerEvent') === 'hover') {
      this._popperElement.addEventListener('mouseenter', this._openPopoverHandler);
      this._popperElement.addEventListener('mouseleave', this._closePopoverHandler);
    }
  }

  /**
   * Triggers when the popover has been fully removed from the DOM (e.g. after animations)
   * allowing us to teardown event handlers and mark the trigger element as inactive
   */
  @action
  popoverClosed() {
    if (this.get('triggerEvent') === 'hover') {
      this._popperElement.removeEventListener('mouseenter', this._openPopoverHandler);
      this._popperElement.removeEventListener('mouseleave', this._closePopoverHandler);
    }

    this._triggerElement.classList.remove('is-active');
    this._popperElement.removeAttribute('data-popover-content');
    this._popperElement = null;
  }

  // ----- Event Handlers -----

  /**
   * Opens the popover
   */
  _openPopoverHandler = () => {
    if (!this.get('isOpen')) {
      this._isOpening = true;
      this._insertPopover();
    }
  }

  /**
   * Closes the popover
   */
  _closePopoverHandler = () => {
    if (this.get('isOpen')) {
      this._isOpening = false;
      this._removePopover();
    }
  }

  /**
   * Handles a click on the body in general when a popover is open. If the clicked element is not
   * a child of the popover, or is marked with `data-close`, closes the popover.
   */
  _handleBodyClick = ({ target }) => {
    if (this._isOpening) {
      this._isOpening = false;
    } else if (closest(target, '.ice-base-popover') === null) {
      // We do not want _removePopover to trigger when clicking inside of the popover.
      // Here we check whether the body click event was also a popover container click event.
      // We are comparing the click events because tracking the click element itself can
      // be buggy if the content within the popover ever changes while its still open.

      this._removePopover();

    } else if (closest(target, '[data-close]:not([disabled])')) {
      // We still want to allow purposeful closing of the popover from within,
      // so this closes the popover if the click target has [data-popover-close] attribute

      this._removePopover();
    }
  }
}
