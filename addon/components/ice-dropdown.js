import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';

import BasePopMenuComponent from './-private/base-pop-menu';
import layout from '../templates/components/ice-dropdown';

/**
 * Super simple dropdown component that uses popper.js. It targets its immediate parent
 * element, and will open whenever that element is clicked.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   <i class="fa fa-caret-down ice-dropdown-caret"></i>
 *   {{#ice-dropdown}}
 *     Dropdown with defaults
 *   {{/ice-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <i class="fa fa-caret-down ice-dropdown-caret"></i>
 *   {{#ice-dropdown placement="bottom"}}
 *     Dropdown with custom placement
 *   {{/ice-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <i class="fa fa-caret-down ice-dropdown-caret"></i>
 *   {{#ice-dropdown class="custom-class"}}
 *     Dropdown with custom class
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <i class="fa fa-caret-down ice-dropdown-caret"></i>
 *   {{#ice-dropdown}}
 *     <a data-close>
 *       Adding data-close to anything within the dropdown will cause
 *       it to close when the item is clicked
 *     </a>
 *   {{/ice-tooltip}}
 * </div>
 * ```
 */
export default class IceDropdownComponent extends BasePopMenuComponent {
  layout = layout;

  triggerEvent = 'click';

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the dropdown
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @argument
  @type('string')
  placement = 'bottom-start';

}
