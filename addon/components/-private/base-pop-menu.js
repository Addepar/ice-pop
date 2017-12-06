import Component from '@ember/component';
import { guidFor } from '@ember/object/internals';
import { run } from '@ember/runloop';
import { assert } from '@ember/debug';

import { action } from 'ember-decorators/object';

import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { immutable } from '@ember-decorators/argument/validation';

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
export default class BasePopMenuComponent extends Component {
  // ----- Arguments ------

  /**
   * Used to determine the placement of the pop menu
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

  /**
   * Selector for the root element of the application which will have body listeners
   * attached to close on click
   */
  @immutable
  @argument
  @type('string')
  rootElementSelector = '.ember-application';

  // ----- Private Variables -----

  /**
   * Tracks if the pop menu is open
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

  /**
   * Modifiers to the popper to set it's default behavior
   */
  _popperModifiers = {
    flip: {
      boundariesElement: 'viewport'
    },

    preventOverflow: {
      boundariesElement: 'window'
    }
  };

  /**
   * Root element that has attached event listeners for body close action
   */
  _rootElement = null;

  constructor() {
    super();

    this._popperClass = `ice-base-pop-menu ${this.class || ''} ${this.classNames.join(' ')}`;

    for (const binding of this.classNameBindings) {
      if (binding.value) {
        this._popperClass += ` ${binding.value()}`;
      }
    }
  }

  didInsertElement() {
    const rootElementSelector = this.get('rootElementSelector');
    const possibleRootElements = self.document.querySelectorAll(rootElementSelector);

    assert(
      `ember-popper with popperContainer selector "${rootElementSelector}" found ${possibleRootElements.length} possible containers when there should be exactly 1`,
      possibleRootElements.length === 1
    );

    this._rootElement = possibleRootElements[0];

    this._triggerElement = this.element.parentNode;
    this._triggerElement.setAttribute('data-popover-trigger', guidFor(this));
    this._triggerElement.setAttribute('aria-haspopup', 'true');
    this._triggerElement.setAttribute('aria-expanded', 'false');

    if (this.get('triggerEvent') === 'click') {
      this._triggerElement.addEventListener('mousedown', this._openPopoverHandler);
    } else {
      this._triggerElement.addEventListener('mouseenter', this._openPopoverHandler);
      this._triggerElement.addEventListener('mouseleave', this._closePopoverHandler);
    }
    this._triggerElement.addEventListener('keydown', this._popperKeyHandler);
  }

  willDestroyElement() {
    raf.forget(this._insertFrame);

    if (this.get('triggerEvent') === 'click') {
      this._triggerElement.removeEventListener('mousedown', this._openPopoverHandler);
    } else {
      this._triggerElement.removeEventListener('mouseenter', this._openPopoverHandler);
      this._triggerElement.removeEventListener('mouseleave', this._closePopoverHandler);
    }
    this._triggerElement.removeEventListener('keydown', this._popperKeyHandler);

    this._triggerElement.removeAttribute('data-popover-trigger');

    this._rootElement.removeEventListener('mouseup', this._handleBodyClick);
  }

  /**
   * Inserts the popover and sets up the body click listener
   */
  _insertPopover() {
    // Schedule these separately so that the element gets fully attached by setting
    // `isOpen` to true, and only _then_ setting `isShowing` to true, triggering the
    // CSS transition
    run(() => this.set('isOpen', true));

    this._rootElement.addEventListener('mouseup', this._handleBodyClick);
  }

  /**
   * Removes the popover and tears down the body click listener
   */
  _removePopover() {
    run(() => this.set('isOpen', false));

    this._rootElement.removeEventListener('mouseup', this._handleBodyClick);
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
    this._triggerElement.setAttribute('aria-expanded', 'true');
    this._popperElement.addEventListener('keydown', this._popperKeyHandler);

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

    this._popperElement.removeEventListener('keydown', this._popperKeyHandler);
    this._triggerElement.classList.remove('is-active');
    this._triggerElement.setAttribute('aria-expanded', 'false');
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
  };

  /**
   * Closes the popover
   */
  _closePopoverHandler = () => {
    if (this.get('isOpen')) {
      this._isOpening = false;
      this._removePopover();
    }
  };

  /**
   * Handles a click on the body in general when a popover is open. If the clicked element is not
   * a child of the popover, or is marked with `data-close`, closes the popover.
   */
  _handleBodyClick = ({ target }) => {
    if (this._isOpening) {
      this._isOpening = false;
    } else if (closest(target, '.ice-base-pop-menu') === null) {
      // We do not want _removePopover to trigger when clicking inside of the popover.
      // Here we check whether the body click event was also a popover container click event.
      // We are comparing the click events because tracking the click element itself can
      // be buggy if the content within the popover ever changes while its still open.

      this._removePopover();

    } else if (closest(target, '[data-close]:not([disabled])')) {
      // We still want to allow purposeful closing of the popover from within,
      // so this closes the popover if the click target has [data-close] attribute

      this._removePopover();
    }
  };

  /**
   * Determines if a keypress should open/close the popper, or focus popper items
   */
  _popperKeyHandler = (event) => {
    const keyCode = event.code;

    // When focus is on a trigger, Enter or Space should open it's popper
    if (
      (keyCode == 'Enter' || keyCode == 'Space')
      && event.target.hasAttribute('data-popover-trigger')
      ) {
      this._openPopoverHandler();
    }

    // When focus is on a data-close element, Enter should close the popper
    // (todo: make sure it executes the action too)
    // Escape provides a way to close the popper early from any point.
    // Also assumes a trigger (such as a submenu trigger) will not have data-close
    if (
      (keyCode == 'Enter' && event.target.hasAttribute('data-close'))
      || keyCode == 'Escape'
      ) {
      // The focus should probably go to whatever
      // area the action triggers. But there is no way for this generic component
      // to know that, so the best guess is back to the trigger
      // (otherwise it goes out of the page bc its at the bottom of the body).
      this._triggerElement.focus();
      this._closePopoverHandler();
    }

    // Move focus inside the popper if it is open and you hit Tab
    if (keyCode == 'Tab' && this.get('isOpen')) {
      this._focusNextTabbableItem();
    }
  };

  /**
   * Determines where to focus when tabbing to/in an opened popper
   */
  _focusNextTabbableItem = () => {
    const currentActiveElement = document.activeElement;
    // Reasonable guess for our use cases, we may need to update this list
    const tabbableSelectors = 'a[href], input, button, select, textarea, [tabindex]:not([disabled])';
    // We want to query the tabbable elements each time because it is possible to
    // have dynamic content in a popper, and we dont want to get stuck in a loop
    // or exit too early
    const tabbableElements = this._popperElement.querySelectorAll(tabbableSelectors);

    // If focus isn't in the popper yet and we are still focused on the trigger,
    // enter into the popper container by focusing on the first tabbable element,
    // which is the popper container itself.
    // Primary browser tab action will then tab to the next naturally tabbable
    // item within the popper.
    // Also need to check if there are even any elements to tab through
    // (outside of just the popper container itself, hence length > 1),
    // otherwise there is no point in entering.
    if (
      (currentActiveElement == this._triggerElement)
      && (tabbableElements.length > 1)
      ) {
      tabbableElements[0].focus(); // the popper container itself
    }
    // If focus is on the last tabbable item, we need to close the popper and
    // focus back to the trigger.
    // Primary browser tab action will then tab to the next tabbable item in the dom.
    else if (
      (currentActiveElement == tabbableElements[tabbableElements.length - 1])
      || (tabbableElements.length <= 1)
      ){
      this._triggerElement.focus();
      this._closePopoverHandler();
    }
  };
}
