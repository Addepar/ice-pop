import { triggerable } from 'ember-cli-page-object';

import BasePopoverPage from './utils/base-popover';

export default BasePopoverPage.extend({
  trigger: {
    open: triggerable('mouseenter'),
    close: triggerable('mouseleave')
  }
});
