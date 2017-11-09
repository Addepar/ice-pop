import { argument, type } from 'ember-argument-decorators';
import { unionOf } from 'ember-argument-decorators/types';

import BasePopMenuComponent from './-private/base-pop-menu';

import layout from '../templates/components/ice-popover';

/**
 * Super simple popover component that uses popper.js. It targets its immediate parent
 * element, and will open whenever that element is clicked.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   {{#ice-popover}}
 *     Popover with defaults
 *   {{/ice-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-popover placement="bottom"}}
 *     Popover with custom placement
 *   {{/ice-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-popover class="custom-class"}}
 *     Popover with custom class
 *   {{/ice-popover}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-popover popoverTitle="Title Text"}}
 *     Popover with optional header/title
 *   {{/ice-popover}}
 * </div>
 *
* <div class="target">
 *   Target text
 *   {{#ice-popover}}
 *     <a data-close>
 *       Adding data-close to anything within the popover will cause
 *       it to close when the item is clicked
 *     </a>
 *   {{/ice-popover}}
 * </div>
 * ```
 */
export default class IcePopoverComponent extends BasePopMenuComponent {
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
