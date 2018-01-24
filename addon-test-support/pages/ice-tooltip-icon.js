import PageObject from 'ember-classy-page-object';
import { findElement } from 'ember-classy-page-object/extend';
import { hasClass } from 'ember-classy-page-object';

import TooltipPage from './ice-tooltip';

export default PageObject.extend({
  /**
   * Returns if this tooltip-icon is the specified icon
   */
  isIcon(icon) {
    return findElement(this).classList.contains(icon);
  },

  /**
   * Scope tooltip associated with this tooltip-icon
   */
  tooltip: TooltipPage.extend({
    scope: '[data-test-icon-tooltip]',
    content: {
      hasClass(className) {
        return hasClass(className);
      }
    }
  })
});
