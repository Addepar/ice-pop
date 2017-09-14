import Ember from 'ember';
import { property } from '@addepar/ice-box/utils/class';

import layout from '../templates/components/ice-sub-dropdown';

const {
  Component
} = Ember;

/**
 * Super simple dropdown component that uses popper.js. By default it targets its
 * parent element for placement and warps itself to the root of the DOM, but it
 * can also take a target selector as an option.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   {{#ice-dropdown}}
 *     Menu
 *   {{/ice-dropdown}}
 * </div>
 * ```
 *
 */
export default class IceSubDropdown extends Component {
  @property layout = layout

  @property tagName =''

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the tooltip.
   * Should only use right-start, left-start, right-end, left-end.
   * Popper will auto move it if needed.
   */
  @property placement = 'right-start'
}
