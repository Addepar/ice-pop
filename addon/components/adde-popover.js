import { argument } from '@ember-decorators/argument';
import { type, unionOf } from '@ember-decorators/argument/type';

import BasePopMenuComponent from './-private/base-pop-menu';

import layout from '../templates/components/adde-popover';

/**
 * Super simple popover component that uses popper.js. It targets its immediate parent
 * element, and will open whenever that element is clicked.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   {{#adde-popover}}
 *     Popover with defaults
 *   {{/adde-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#adde-popover placement="bottom"}}
 *     Popover with custom placement
 *   {{/adde-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#adde-popover class="custom-class"}}
 *     Popover with custom class
 *   {{/adde-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#adde-popover popoverTitle="Title Text"}}
 *     Popover with optional header/title
 *   {{/adde-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#adde-popover}}
 *     <a data-close>
 *       Adding data-close to anything within the popover will cause
 *       it to close when the item is clicked
 *     </a>
 *   {{/adde-popover}}
 * </div>
 * ```
 */
export default class AddePopoverComponent extends BasePopMenuComponent {
  layout = layout;

  triggerEvent = 'click';

  // ----- Arguments ------

  /**
   * Used to determine the placement of the popover
   * Can choose between auto, top, right, bottom, left
   * Can also add -start or -end modifier
   */
  @argument
  @type('string')
  placement = 'right-start';

  /**
   * Title for the popover, if provided will include the header
   * in the template. Defaults to nothing.
   */
  @argument
  @type(unionOf(null, 'string'))
  popoverTitle = null;
}
