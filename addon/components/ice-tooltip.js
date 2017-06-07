import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({

  popperClass: 'ice-tooltip',

  placement: 'auto',

  // Used to track whether fade in/out animation should trigger
  isVisible: false,

  didInsertElement() {
    let target = this.get('target') || this.element.parentNode;

    if (typeof target === 'string') {
      const nodes = document.querySelectorAll(target);

      // TODO: Add an assertion that throws if more than one node exists
      target = nodes[0];
    }

    this._target = target;

    this._mouseEnterHandler = () => {
      this.set('isShowing', true);
      // Hack to delay fade in animation after popper is rendered
      Ember.run.debounce(this, function() {
        this.set('isVisible', true);
      }, 20);
    };

    this._mouseLeaveHandler = () => {
      this.set('isVisible', false);
      // Delay hiding of popper until fade out animation is done
      Ember.run.debounce(this, function() {
        this.set('isShowing', false);
      }, 200);
    };

    this._target.addEventListener('mouseenter', this._mouseEnterHandler);
    this._target.addEventListener('mouseleave', this._mouseLeaveHandler);
  },

  willDestroyElement() {
    this._target.removeEventListener('mouseenter', this._mouseEnterHandler);
    this._target.removeEventListener('mouseleave', this._mouseLeaveHandler);
  }
});
