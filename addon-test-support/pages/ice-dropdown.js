import { clickable } from 'ember-cli-page-object';

import BasePopoverPage from './utils/base-popover';

export default BasePopoverPage.extend({
  trigger: {
    open: clickable(),
    close: clickable()
  }
});
