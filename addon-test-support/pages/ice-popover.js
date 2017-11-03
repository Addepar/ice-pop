import { clickable } from 'ember-cli-page-object';

import BasePopoverPage from './utils/base-popover';

export default BasePopoverPage.extend({
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
