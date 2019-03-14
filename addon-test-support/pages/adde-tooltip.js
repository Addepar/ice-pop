import { triggerable } from 'ember-classy-page-object';

import BasePopMenuPage from './-private/base-pop-menu';

export default BasePopMenuPage.extend({
  trigger: {
    open: triggerable('mouseenter'),
    close: triggerable('mouseleave'),
  },
});
