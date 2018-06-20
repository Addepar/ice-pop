import Component from '@ember/component';

import { attribute, className, classNames, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';

import layout from '../templates/components/adde-tooltip-icon';

/**
 * A tooltip that has an icon as its target element,
 * which is currently by default a font awesome icon.
 *
 * ```hbs
 * {{#adde-tooltip-icon}}
 *   Icon tooltip with defaults
 * {{/adde-tooltip-icon}}
 *
 * {{#adde-tooltip-icon placement="bottom"}}
 *   Icon tooltip with custom placement
 * {{/adde-tooltip-icon}}
 *
 * {{#adde-tooltip-icon iconClass="fa-warning" tooltipClass="error-tooltip"}}
 *   Icon tooltip with custom icon class and custom tooltip class
 * {{/adde-tooltip-icon}}
 * ```
 */
@tagName('i')
@classNames('fa', 'tooltip-icon')
export default class AddeTooltipIcon extends Component {
  layout = layout;

  // Make the tooltip icon tabbable
  @argument
  @attribute tabindex = '0';

  // ----- Public Settings ------

  /**
   * The specific icon class that you want to use
   */
  @argument
  @type('string')
  @className
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
