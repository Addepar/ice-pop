import Component from '@ember/component';
import { run } from '@ember/runloop';
import { addObserver, removeObserver } from '@ember/object/observers';

import { action } from 'ember-decorators/object';
import { tagName } from 'ember-decorators/component';

import { argument, type } from 'ember-argument-decorators';
import { unionOf } from 'ember-argument-decorators/types';

import { scheduler as raf, Token } from 'ember-raf-scheduler';

import layout from '../templates/components/animated-popper';

function hasTransition(element) {
  const { transitionDuration } = window.getComputedStyle(element);

  return parseFloat(transitionDuration) > 0;
}

/**
 * Private component used by ice-pop internally. This component handles the logic
 * surrounding animation, including determining if animations should happen at all.
 */
@tagName('')
export default class AnimatedPopperComponent extends Component {
  layout = layout;

  // ----- Arguments ------

  /**
   * Whether or not the popper is open
   */
  @argument
  @type('boolean')
  isOpen = false;

  /**
   * Action sent when the popper has been added to the DOM, before animations
   */
  @argument
  @type(unionOf(null, 'action'))
  onOpen = null;

  /**
   * Action sent when the popper has been removed from the DOM, after animations
   */
  @argument
  @type(unionOf(null, 'action'))
  onClose = null;

  /**
   * Whether or not the popper should render in place or at the root level
   */
  @argument
  @type('boolean')
  renderInPlace = false;

  /**
   * The popper elment's class
   */
  @argument
  @type('string')
  popperClass = '';

  /**
   * The placement for the popper element
   */
  @argument
  @type('string')
  placement = 'auto';

  // ----- Private Variables -----

  /**
   * Whether or not the popper should be rendered in the DOM
   */
  @type('boolean')
  renderInDOM = false;

  /**
   * Wether or not the popper should have the `is-visible` class, which will trigger animations
   */
  @type('boolean')
  makeVisible = false;

  /**
   * RAF scheduler token, used to cancel all active jobs
   */
  _token = new Token();

  /**
   * Empty text node used to find the true parent element for this component
   */
  _parentFinder = document.createTextNode('');

  /**
   * The target element that the popper will position itself based on
   */
  _target = null;

  /**
   * The popper element, stored in order to add and remove event handlers for transitions
   */
  _animatedElement = null;

  /**
   * Whether or not the current popper has a transition duration > 0
   */
  _hasTransition = false;

  constructor() {
    super(...arguments);

    this.isOpenDidChange();
  }

  didInsertElement() {
    this._target = this._parentFinder.parentNode.parentNode;

    addObserver(this, 'isOpen', this, this.isOpenDidChange);
  }

  willDestroy() {
    raf.forget(this._token);

    removeObserver(this, 'isOpen', this, this.isOpenDidChange);
  }

  /**
   * Observer for whenever isOpen changes, toggling the state of the popper. Because
   * animations can take some time to finalize, this toggle can happen many times between
   * states, which is why this must be an observer in 1.11 (it is not tied directly to the DOM)
   */
  isOpenDidChange() {
    if (this.get('isOpen') === true) {
      this.set('renderInDOM', true);

      raf.schedule('sync', () => {
        this.set('makeVisible', true);
      }, this._token);
    } else {
      this.set('makeVisible', false);

      if (this._animatedElement && !this._hasTransition) {
        // Use RAF to ensure that if the isOpen has change multiple times, removal
        // will happen _after_ state has completely settled. This is particularly
        // important in tests
        raf.schedule('affect', () => {
          if (this.get('makeVisible') === false) {
            run(() => this.finalizeClose());
          }
        }, this._token);
      }
    }
  }

  /**
   * Triggers when the popper has been inserted. Grabs the popper element to add animation event
   * handlers if needed, and propogates the API to the external context.
   *
   * @param {PopperAPI} api - The API received from the underlying popper
   */
  @action
  registerAPI(api) {
    this._animatedElement = api.popperElement;
    this._hasTransition = hasTransition(this._animatedElement);

    if (this._hasTransition) {
      this._animatedElement.addEventListener('transitionend', this._transitionEndHandler);
    }

    this.sendAction('onOpen', api);
  }

  /**
   * Triggers on finalizing the close, after all animations (if any) have settled. Tears down handlers
   * and notifies the parent context that animations have finished.
   */
  finalizeClose() {
    this.set('renderInDOM', false);

    if (this._hasTransition) {
      this._animatedElement.removeEventListener('transitionend', this._transitionEndHandler);
    }

    this._animatedElement = null;

    this.sendAction('onClose');
  }

  // ----- Event Handlers -----

  /**
   * Handler for finalizing close on transitions ending
   */
  _transitionEndHandler = () => {
    if (this.get('makeVisible') === false) {
      this.finalizeClose();
    }
  }
}
