import Ember from 'ember';
import { find } from 'ember-native-dom-helpers';

const { RSVP: { Promise } } = Ember;

export default function(target) {
  return new Promise((resolve) => {
    const targetElement = find(target);

    const waiter = function() {
      targetElement.removeEventListener('transitionend', waiter);
      resolve();
    };

    targetElement.addEventListener('transitionend', waiter);
  });
}
