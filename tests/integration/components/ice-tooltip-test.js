import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { triggerEvent } from 'ember-native-dom-helpers';

import waitForAnimations from '../../helpers/wait-for-animations';
import tooltipHelpers from '../../helpers/tooltip-helpers';

moduleForComponent('ice-tooltip', 'Integration | Component | ice tooltip', {
  integration: true
});

test('tooltip box renders when parent element is the target', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div id="tooltip-target">
      Target
      {{#ice-tooltip}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip not rendered initially');

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 1,
    'only one tooltip is rendered');

  await tooltipHelpers.closeTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip removed after exiting the parent');
});

test('tooltip box renders when another element is the target', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div id="tooltip-target">
      Target
    </div>

    {{#ice-tooltip target="#tooltip-target"}}
      template block text
    {{/ice-tooltip}}
  `);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip not rendered initially');

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 1,
    'only one tooltip is rendered');

  await tooltipHelpers.closeTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip removed after exiting the parent');
});

test('tooltip remains rendered when tooltip box itself is hovered', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div id="tooltip-target">
      Target
      {{#ice-tooltip}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 1,
    'tooltip rendered after entering the target');

  await triggerEvent(tooltipHelpers.TOOLTIP_ICON_SELECTOR, 'mouseleave');
  await triggerEvent(tooltipHelpers.TOOLTIP_SELECTOR, 'mouseenter');
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 1,
    'tooltip is still rendered after entering the tooltip box');

  await triggerEvent(tooltipHelpers.TOOLTIP_SELECTOR, 'mouseleave');
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip removed after exiting the tooltip box');
});

test('tooltip box correctly renders content', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div id="tooltip-target">
      Target
      {{#ice-tooltip}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().textContent.trim(), 'template block text',
    'tooltip renders given content');
});

test('tooltip box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div id="tooltip-target">
      Target
      {{#ice-tooltip class="error-tooltip"}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().classList.contains('error-tooltip'), true,
    'tooltip box reflects additional class');
});

test('tooltip box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div id="tooltip-target">
      Target
      {{#ice-tooltip placement="bottom-end"}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTORS);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().getAttribute('x-placement'), 'bottom-end',
    'tooltip box reflects correct direction');
});
