import Ember from 'ember';

const {
  Component,
  run,
  generateGuid
} = Ember;

export default Component.extend({
  // ----- Public Settings ------

  // Used to determine the placement of the tooltip
  placement: 'auto',

  // ----- Private Variables -----

  // Used to track whether fade in/out animation should trigger
  isVisible: false,

  // Used to target/select the popper element after it's been inserted
  _popperId: null,

  // Used to store the popper element for adding/removing event listeners
  _popperElement: null,

  // ----- Lifecycle Hooks -----

  init() {
    this._super(...arguments);
    this._popperId = generateGuid();
  },

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
      run(() => this.set('isShowing', true));
      run(() => this.set('isVisible', true));

      this._popperElement = document.getElementById(this._popperId);

      // Adds the same mouseenter/mouseleave handlers as the target object. If
      // the tooltip is entered before the transition has completed, `isVisible` will
      // be reset to true and when `transitionend` fires it will do nothing.
      this._popperElement.addEventListener('mouseenter', this._mouseEnterHandler);
      this._popperElement.addEventListener('mouseleave', this._mouseLeaveHandler);
      this._popperElement.addEventListener('transitionend', this._transitionEndHandler);
    };

    this._mouseLeaveHandler = () => {
      run(() => this.set('isVisible', false));
    };

    this._transitionEndHandler = () => {
      if (this.get('isVisible') === false) {
        run(() => this.set('isShowing', false));

        this._popperElement.removeEventListener('mouseenter', this._mouseEnterHandler);
        this._popperElement.removeEventListener('mouseleave', this._mouseLeaveHandler);
        this._popperElement.removeEventListener('transitionend', this._transitionEndHandler);

        this._popperElement = null;
      }
    };

    this._target.addEventListener('mouseenter', this._mouseEnterHandler);
    this._target.addEventListener('mouseleave', this._mouseLeaveHandler);
  },

  willDestroyElement() {
    this._target.removeEventListener('mouseenter', this._mouseEnterHandler);
    this._target.removeEventListener('mouseleave', this._mouseLeaveHandler);
  }
});
