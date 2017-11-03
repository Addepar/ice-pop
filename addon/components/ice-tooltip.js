import BasePopoverComponent from './utils/base-popover';

import layout from '../templates/components/ice-tooltip';

/**
 * Super simple tooltip component that uses popper.js. It targets its immediate
 * parent element, and will open whenever that element is hovered.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   {{#ice-tooltip}}
 *     Tootip with defaults
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-tooltip placement="bottom"}}
 *     Tooltip with custom placement
 *   {{/ice-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#ice-tooltip class="error-tooltip"}}
 *     Tooltip with custom class
 *   {{/ice-tooltip}}
 * </div>
 * ```
 */
export default class IceTooltipComponent extends BasePopoverComponent {
  layout = layout

  triggerEvent = 'hover'
}
