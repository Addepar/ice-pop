import Ember from 'ember';
import { property } from '@addepar/ice-box/utils/class';

import layout from '../templates/components/ice-tooltip-icon';

const { Component } = Ember;

/**
 * A tooltip that has an icon as its target element,
 * which is currently by default a font awesome icon.
 *
 * ```hbs
 * {{#ice-tooltip-icon placement="bottom"}}
 *   // Tooltip with default icon and bottom placement
 *   Some text
 * {{/ice-tooltip-icon}}
 *
 * {{#ice-tooltip-icon iconClass="fa-warning"}}
 *   // Tooltip with warning icon
 *   Some text
 * {{/ice-tooltip-icon}}
 * ```
 *
 */
export default class IceTooltipIcon extends Component {
  @property layout = layout

  @property tagName ='i'

  @property classNameBindings = [':fa', 'iconClass', ':tooltip-icon']

  // ----- Public Settings ------

  /**
   * The specific icon class that you want to use
   */
  @property iconClass = 'fa-question-circle'

  /**
   * Used to determine the placement of the tooltip;
   * Can choose between auto, top, right, bottom, left;
   * Can also add -start or -end modifier.
   */
  @property placement = 'auto'

  /**
   * An optional class to pass to the tooltip itself.
   */
  @property tooltipClass = null
}
