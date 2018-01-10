import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';

import IceDropdownComponent from './ice-dropdown';

/**
 * Subdropdown component that is used inside a dropdown menu item. It targets
 * its immediate parent element, and will open whenever that element is hovered.
 *
 * ```hbs
 * {{#ice-dropdown}}
 *   <ul class="ice-dropdown-menu">
 *     <li>
 *       <button>Foo bar baz</button>
 *       <i class="fa fa-caret-down ice-dropdown-caret" aria-hidden="true"></i>
 *       {{#ice-sub-dropdown}}
 *         <ul class="ice-dropdown-menu">
 *           <li><button>Foo bar baz</button></li>
 *           <li><button>I'm Mr. Meseeks</button></li>
 *           <li><button>Lorem ipsum</button></li>
 *         </ul>
 *       {{/ice-sub-dropdown}}
 *     </li>
 *   </ul>
 * {{/ice-dropdown}}
 * ```
 */
export default class IceSubDropdownComponent extends IceDropdownComponent {

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
