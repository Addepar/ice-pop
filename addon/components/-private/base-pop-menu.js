import Component from '@ember/component';
import { guidFor } from '@ember/object/internals';
import { run } from '@ember/runloop';
import { assert } from '@ember/debug';

import { action } from 'ember-decorators/object';
import { computed } from 'ember-decorators/object';

import { argument } from '@ember-decorators/argument';
import { type, unionOf } from '@ember-decorators/argument/type';
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
 * Modifiers to the popper to set it's default behavior
 */
const DEFAULT_POPPER_MODIFIERS = {
  flip: {
    boundariesElement: 'viewport'
  },

  preventOverflow: {
    boundariesElement: 'window'
  }
};

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

  /**
   * User-provided modifiers to the popper.
   * Documentation for popper modifiers can be found at https://popper.js.org/popper-documentation.html#modifiers
   */
  @argument
  @type(unionOf(null, 'object'))
  popperModifiers = null;

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
   * Root element that has attached event listeners for body close action
   */
  _rootElement = null;

  /**
   * Combined set of default modifiers and user-provided modifiers. Overwrites default
   * modifiers with user-provided ones if there is overlap.
   */
  @computed('popperModifiers')
  get _popperModifiers() {
    return Object.assign({}, DEFAULT_POPPER_MODIFIERS, this.get('popperModifiers'));
  }

  constructor() {
    super();

    this._popperClass = `ice-base-pop-menu ${this.class || ''} ${this.classNames.join(' ')}`;

    for (let binding of this.classNameBindings) {
      if (binding.value) {
        this._popperClass += ` ${binding.value()}`;
      }
    }
  }

  didInsertElement() {
    let rootElementSelector = this.get('rootElementSelector');
    let possibleRootElements = self.document.querySelectorAll(rootElementSelector);

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
      // When in click trigger mode, we also want to enable open/close with key events
      this._triggerElement.addEventListener('keydown', this._triggerKeyHandler);
    } else {
      this._triggerElement.addEventListener('mouseenter', this._openPopoverHandler);
      this._triggerElement.addEventListener('mouseleave', this._closePopoverHandler);
      // When in hover trigger mode, we also want to enable open/close with focus
      this._triggerElement.addEventListener('focus', this._openPopoverHandler);
      this._triggerElement.addEventListener('blur', this._closePopoverBlurHandler);
    }
  }

  willDestroyElement() {
    raf.forget(this._insertFrame);

    if (this.get('triggerEvent') === 'click') {
      this._triggerElement.removeEventListener('mousedown', this._openPopoverHandler);
      this._triggerElement.removeEventListener('keydown', this._triggerKeyHandler);
    } else {
      this._triggerElement.removeEventListener('mouseenter', this._openPopoverHandler);
      this._triggerElement.removeEventListener('mouseleave', this._closePopoverHandler);
      this._triggerElement.removeEventListener('focus', this._openPopoverHandler);
      this._triggerElement.removeEventListener('blur', this._closePopoverBlurHandler);
    }

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
   * Closes the popover and focuses back on the trigger
   */
  _closePopoverAndFocusTrigger() {
    this._triggerElement.focus();
    this._closePopoverHandler();
  }

  /**
   * Maintains a determinable list of elements that are focusable.
   * Makes a query for elements that match that list
   * TODO: Make this a global helper?
   * @return {Array} list of focusable elements
   */
  _getFocusableElementsInPopper() {
    let focusableSelectors = 'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
    let focusableElements = this._popperElement.querySelectorAll(focusableSelectors);
    return focusableElements;
  }

  /**
   * Gets the list of focusable elements in the popper, focuses on the first one.
   * Makes sure there is actually something to focus on.
   * TODO: Make this a global helper?
   */
  _focusOnFirstFocusableElement() {
    let focusableElements = this._getFocusableElementsInPopper();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
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
      this._popperElement.addEventListener('focus', this._openPopoverHandler);
      this._popperElement.addEventListener('blur', this._closePopoverBlurHandler);
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
      this._popperElement.removeEventListener('focus', this._openPopoverHandler);
      this._popperElement.removeEventListener('blur', this._closePopoverBlurHandler);
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
   * Handler for closing the popper on target blur
   */
  _closePopoverBlurHandler = () => {
    // Check if the popper has focusable elements. If it does, this means when the
    // popper finishes rendering, it will move the focus to the first focusable item,
    // and as a side effect trigger the blur event, but in this case we don't want
    // the popper to close while we are still inside it. Once the user tabs off
    // of the last focusable item in the popper, it will close anyway.
    let focusableElements = this._getFocusableElementsInPopper();
    if (focusableElements.length === 0) {
      this._closePopoverHandler();
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
   * When focus is on the trigger, determine specific key actions.
   * Since the popper element is rendered at the bottom of the DOM far away from
   * its trigger, we have to manually tell focus to where to go.
   */
  _triggerKeyHandler = (event) => {
    let keyCode = event.key;

    // Pressing Enter or Space opens the popper
    if ((keyCode === 'Enter' || keyCode === ' ') && !this.get('isOpen')) {
      this._openPopoverHandler();
      // Wait until popper layout has finished computing, otherwise mischief will happen
      raf.schedule('layout', () => {
        // Automatically focus on first focusable item in the popper
        this._focusOnFirstFocusableElement();
      }, this._token);
    } else if ((keyCode === 'Escape' || keyCode === 'Enter') && this.get('isOpen')) {
      // Close on esc if we never entered the popper
      // (Enter is the same as re-clicking the button)
      this._closePopoverAndFocusTrigger();
    }
  };

  /**
   * When focus is inside the popper, determine specific key actions.
   * Since the popper element is rendered at the bottom of the DOM far away from
   * its trigger, we have to manually tell focus to where to go.
   */
  _popperKeyHandler = (event) => {
    let keyCode = event.key;
    let focusableElements = this._getFocusableElementsInPopper();
    let activeItem = document.activeElement;

    if (keyCode === 'Escape') {
    // Escape provides a way to close the popper while the user is focused anywhere
    // inside the popper. We assume upon closing in this way, the user wants to
    // be focused where they were before (which would be the trigger).
      this._closePopoverAndFocusTrigger();
    } else if (keyCode === 'Enter' && event.target.hasAttribute('data-close')) {
      // When focus is on a data-close element, pressing Enter should close the popper.
      // We don't want to make any assumptions about where the focus should go from
      // here because the app instead should determine where it goes depending on the action.
      // TODO Ember 1.13: this needs to close both subdropdown and parent dropdown
      this._closePopoverHandler();
    } else if (keyCode === 'Tab' && activeItem === focusableElements[focusableElements.length - 1]) {
      // Since the user has hit the Tab key on the last item in the popper, their
      // intent is to continue on in the DOM. So we manually focus back to where
      // they were before opening the popper (which would be the trigger).
      // The browser will execute the focus on the trigger first, then the tab event
      // will execute, thus naturally landing on the next tabbable item in the DOM after the trigger.
      this._closePopoverAndFocusTrigger();
    } else if (event.shiftKey && keyCode === 'Tab' && activeItem === focusableElements[0]) {
      // Since the user has hit the shift+Tab key on the first item in the popper, their
      // intent is to go backwards in the DOM. So we manually focus back to where
      // they were before opening the popper (which would be the trigger).
      // The browser will execute the focus on the trigger first, then the shift+tab event
      // will execute, thus naturally landing on the previous tabbable item in the DOM before the trigger.
      this._closePopoverAndFocusTrigger();
    }
  };
}
