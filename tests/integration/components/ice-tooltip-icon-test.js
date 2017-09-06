import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import waitForAnimations from '../../helpers/wait-for-animations';
import tooltipHelpers from '../../helpers/tooltip-helpers';

moduleForComponent('ice-tooltip-icon', 'Integration | Component | ice tooltip icon', {
  integration: true
});

test('target icon renders', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#ice-tooltip-icon}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  assert.equal(tooltipHelpers.getTooltipIconsCount(), 1,
    'a tooltip icon target is rendered');
  assert.equal(tooltipHelpers.getTooltipIcon().classList.contains('fa-question-circle'), true,
    'tooltip has correct default class');
});

test('tooltip works as expected', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    {{#ice-tooltip-icon}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 1,
    'hovering icon target renders a tooltip');
  assert.equal(tooltipHelpers.getTooltip().textContent.trim(), 'template block text',
    'tooltip content renders');

  await tooltipHelpers.closeTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip removed after exiting the tooltip icon');
});

test('tooltip icon class can be modified', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#ice-tooltip-icon iconClass="fa-exclamation"}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  assert.equal(tooltipHelpers.getTooltipIcon().classList.contains('fa-exclamation'), true,
    'tooltip icon has new class');
  assert.equal(tooltipHelpers.getTooltipIcon().classList.contains('fa-question-circle'), false,
    'tooltip icon no longer has default class');
});

test('tooltip box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#ice-tooltip-icon tooltipClass="error-tooltip"}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().classList.contains('error-tooltip'), true,
    'tooltip box reflects additional class');
});

test('tooltip box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#ice-tooltip-icon placement="bottom-end"}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await tooltipHelpers.openTooltip(tooltipHelpers.TOOLTIP_ICON_SELECTOR);
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().getAttribute('x-placement'), 'bottom-end',
    'tooltip box reflects correct direction');
});
