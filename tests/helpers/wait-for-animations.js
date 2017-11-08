import { Promise } from 'rsvp';
import { find } from 'ember-native-dom-helpers';

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
