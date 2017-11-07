import { clickable } from 'ember-cli-page-object';

import BasePopMenuPage from './-private/base-pop-menu';

export default BasePopMenuPage.extend({
  trigger: {
    open: clickable(),
    close: clickable()
  }
});
