import { argument, type } from 'ember-argument-decorators';

import BasePopMenuComponent from './-private/base-pop-menu';
import layout from '../templates/components/ice-dropdown';

/**
 * Super simple dropdown component that uses popper.js. It targets its immediate parent
 * element, and will open whenever that element is clicked.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown}}
 *     Dropdown with defaults
 *   {{/ice-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown placement="bottom"}}
 *     Dropdown with custom placement
 *   {{/ice-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
 *   {{#ice-dropdown class="custom-class"}}
 *     Dropdown with custom class
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <div class="ice-dropdown-caret"></div>
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
