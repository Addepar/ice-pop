import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';

import AddeDropdownComponent from './adde-dropdown';

/**
 * Subdropdown component that is used inside a dropdown menu item. It targets
 * its immediate parent element, and will open whenever that element is hovered.
 *
 * ```hbs
 * {{#adde-dropdown}}
 *   <ul class="adde-dropdown-menu">
 *     <li>
 *       <button>Foo bar baz</button>
 *       <i class="fas fa-caret-down adde-dropdown-caret" aria-hidden="true"></i>
 *       {{#adde-sub-dropdown}}
 *         <ul class="adde-dropdown-menu">
 *           <li><button>Foo bar baz</button></li>
 *           <li><button>I'm Mr. Meseeks</button></li>
 *           <li><button>Lorem ipsum</button></li>
 *         </ul>
 *       {{/adde-sub-dropdown}}
 *     </li>
 *   </ul>
 * {{/adde-dropdown}}
 * ```
 */
export default class AddeSubDropdownComponent extends AddeDropdownComponent {

  triggerEvent = 'hover';

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the sub-dropdown.
   * Should only use right-start, left-start, right-end, left-end.
   * Popper will auto move it if needed.
   */
  @argument
  @type('string')
  placement = 'right-start';

}
