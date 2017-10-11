import Ember from 'ember';
import { property } from '@addepar/ice-box/utils/class';

import layout from '../templates/components/ice-sub-dropdown';

const {
  Component
} = Ember;

/**
 * Subdropdown component that is used inside a dropdown menu item.
 *
 * ```hbs
 * {{#ice-dropdown}}
 *   <ul class="ice-dropdown-menu">
 *     <li>
 *       <a>Foo bar baz</a>
 *       <div class="ice-dropdown-caret"></div>
 *       {{#ice-sub-dropdown}}
 *         <ul class="ice-dropdown-menu">
 *           <li><a>Foo bar baz</a></li>
 *           <li><a>I'm Mr. Meseeks</a></li>
 *           <li><a>Lorem ipsum</a></li>
 *         </ul>
 *       {{/ice-sub-dropdown}}
 *     </li>
 *   </ul>
 * {{/ice-dropdown}}
 * ```
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
