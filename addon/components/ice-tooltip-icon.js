import Component from '@ember/component';

import { className, classNames, tagName } from 'ember-decorators/component';
import { argument, type } from 'ember-argument-decorators';

import layout from '../templates/components/ice-tooltip-icon';

/**
 * A tooltip that has an icon as its target element,
 * which is currently by default a font awesome icon.
 *
 * ```hbs
 * {{#ice-tooltip-icon}}
 *   Icon tooltip with defaults
 * {{/ice-tooltip-icon}}
 *
 * {{#ice-tooltip-icon placement="bottom"}}
 *   Icon tooltip with custom placement
 * {{/ice-tooltip-icon}}
 *
 * {{#ice-tooltip-icon iconClass="fa-warning" tooltipClass="error-tooltip"}}
 *   Icon tooltip with custom icon class and custom tooltip class
 * {{/ice-tooltip-icon}}
 * ```
 */
@tagName('i')
@classNames('fa', 'tooltip-icon')
export default class IceTooltipIcon extends Component {
  layout = layout;

  // ----- Public Settings ------

  /**
   * The specific icon class that you want to use
   */
  @className
  @type('string')
  iconClass = 'fa-question-circle';

  /**
   * Used to determine the placement of the tooltip;
   * Can choose between auto, top, right, bottom, left;
   * Can also add -start or -end modifier.
   */
  @argument
  @type('string')
  placement = 'auto';

  /**
   * An optional class to pass to the tooltip itself.
   */
  @argument
  @type('string')
  tooltipClass = '';
}
