import PageObject from 'ember-classy-page-object';

import TooltipPage from './ice-tooltip';

import { find } from 'ember-native-dom-helpers';

export default new PageObject({
  /**
   * Returns if this tooltip-icon is the specified icon
   */
  isIcon(icon) {
    return find(this.scope).classList.contains(icon);
  },

  /**
   * Scope tooltip associated with this tooltip-icon
   */
  tooltip: TooltipPage.extend({
    scope: '[data-test-icon-tooltip]'
  })
});
