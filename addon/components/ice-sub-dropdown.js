import Component from '@ember/component';

import { tagName } from 'ember-decorators/component';
import { argument, type } from 'ember-argument-decorators';

import layout from '../templates/components/ice-sub-dropdown';

/**
 * Subdropdown component that is used inside a dropdown menu item.
 *
 * ```hbs
 * {{#ice-dropdown}}
 *   <ul class="ice-dropdown-menu">
 *     <li>
 *       <a>Foo bar baz</a>
 *       <div class="ice-dropdown-caret"></div>
 *       {{#ice-sub-dropdown}}
 *         <ul class="ice-dropdown-menu">
 *           <li><a>Foo bar baz</a></li>
 *           <li><a>I'm Mr. Meseeks</a></li>
 *           <li><a>Lorem ipsum</a></li>
 *         </ul>
 *       {{/ice-sub-dropdown}}
 *     </li>
 *   </ul>
 * {{/ice-dropdown}}
 * ```
 */
@tagName('')
export default class IceSubDropdown extends Component {
  layout = layout

  // ----- Public Settings ------

  /**
   * Used to determine the placement of the tooltip.
   * Should only use right-start, left-start, right-end, left-end.
   * Popper will auto move it if needed.
   */
  @argument
  @type('string')
  placement = 'right-start'

  @argument
  @type('boolean')
  renderInPlace = false;
}
