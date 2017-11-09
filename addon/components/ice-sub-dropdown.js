import { argument, type } from 'ember-argument-decorators';

import IceDropdownComponent from './ice-dropdown';

/**
 * Subdropdown component that is used inside a dropdown menu item. It targets
 * its immediate parent element, and will open whenever that element is hovered.
 *
 * ```hbs
 * {{#ice-dropdown}}
 *   <ul class="ice-dropdown-menu">
 *     <li>
 *       <a>Foo bar baz</a>
 *       <i class="fa fa-caret-down ice-dropdown-caret"></i>
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
