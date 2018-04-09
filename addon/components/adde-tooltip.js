import BasePopMenuComponent from './-private/base-pop-menu';

import layout from '../templates/components/adde-tooltip';

/**
 * Super simple tooltip component that uses popper.js. It targets its immediate
 * parent element, and will open whenever that element is hovered.
 *
 * ```hbs
 * <div class="target">
 *   Target text
 *   {{#adde-tooltip}}
 *     Tootip with defaults
 *   {{/adde-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#adde-tooltip placement="bottom"}}
 *     Tooltip with custom placement
 *   {{/adde-tooltip}}
 * </div>
 *
 * <div class="target">
 *   Target text
 *   {{#adde-tooltip class="error-tooltip"}}
 *     Tooltip with custom class
 *   {{/adde-tooltip}}
 * </div>
 * ```
 */
export default class AddeTooltipComponent extends BasePopMenuComponent {
  layout = layout;

  triggerEvent = 'hover';
}
