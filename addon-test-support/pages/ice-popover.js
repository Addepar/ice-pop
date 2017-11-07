import { clickable } from 'ember-cli-page-object';

import BasePopMenuPage from './-private/base-pop-menu';

export default BasePopMenuPage.extend({
  trigger: {
    open: clickable(),
    close: clickable()
  },

  content: {
    /**
     * Scope for the header of the popover if it exists
     */
    header: {
      scope: 'header'
    }
  }
});
