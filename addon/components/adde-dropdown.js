import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';

import BasePopMenuComponent from './-private/base-pop-menu';
import layout from '../templates/components/adde-dropdown';

/**
 * Super simple dropdown component that uses popper.js. It targets its immediate parent
 * element, and will open whenever that element is clicked.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   <i class="fas fa-caret-down adde-dropdown-caret"></i>
 *   {{#adde-dropdown}}
 *     Dropdown with defaults
 *   {{/adde-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <i class="fas fa-caret-down adde-dropdown-caret"></i>
 *   {{#adde-dropdown placement="bottom"}}
 *     Dropdown with custom placement
 *   {{/adde-dropdown}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <i class="fas fa-caret-down adde-dropdown-caret"></i>
 *   {{#adde-dropdown class="custom-class"}}
 *     Dropdown with custom class
 *   {{/adde-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   <i class="fas fa-caret-down adde-dropdown-caret"></i>
 *   {{#adde-dropdown}}
 *     <a data-close>
 *       Adding data-close to anything within the dropdown will cause
 *       it to close when the item is clicked
 *     </a>
 *   {{/adde-tooltip}}
 * </div>
 * ```
 */
export default class AddeDropdownComponent extends BasePopMenuComponent {
  layout = layout;

  @argument
  triggerEvent = 'click';

  // ----- Public Settings ------

  /**
   * Since dropdowns primarily contain adde-dropdown-menu lists,
   * they likely always need arrow navigation mode.
   * If your dropdown doesn't use this list and instead uses other semantic elements
   * that automatically use arrow navigation, you can turn this off.
   */
  @argument
  @type('boolean')
  arrowNavigation = true;

  /**
   * Used to determine the placement of the dropdown
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @argument
  @type('string')
  placement = 'bottom-start';
}
