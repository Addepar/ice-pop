import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import waitForAnimations from '../../helpers/wait-for-animations';
import tooltipHelpers from '../../helpers/components/tooltip-helpers';

import { find } from 'ember-native-dom-helpers';

moduleForComponent('ice-tooltip-icon', 'Integration | Component | ice tooltip icon', {
  integration: true
});

test('target icon renders', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#ice-tooltip-icon data-test-tooltip-icon=true}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  const tooltip = find('[data-test-tooltip-icon]');

  assert.ok(tooltip, 'a tooltip icon target is rendered');
  assert.equal(tooltip.classList.contains('fa-question-circle'), true,
    'tooltip has correct default class');
});

test('tooltip works as expected', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    {{#ice-tooltip-icon data-test-tooltip-icon=true}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await tooltipHelpers.openTooltip('[data-test-tooltip-icon]');
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 1,
    'hovering icon target renders a tooltip');
  assert.equal(tooltipHelpers.getTooltip().textContent.trim(), 'template block text',
    'tooltip content renders');

  await tooltipHelpers.closeTooltip('[data-test-tooltip-icon]');
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltipsCount(), 0,
    'tooltip removed after exiting the tooltip icon');
});

test('tooltip icon class can be modified', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#ice-tooltip-icon data-test-tooltip-icon=true iconClass="fa-exclamation"}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  assert.equal(find('[data-test-tooltip-icon]').classList.contains('fa-exclamation'), true,
    'tooltip icon has new class');
  assert.equal(find('[data-test-tooltip-icon]').classList.contains('fa-question-circle'), false,
    'tooltip icon no longer has default class');
});

test('tooltip box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#ice-tooltip-icon data-test-tooltip-icon=true tooltipClass="error-tooltip"}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await tooltipHelpers.openTooltip('[data-test-tooltip-icon]');
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().classList.contains('error-tooltip'), true,
    'tooltip box reflects additional class');
});

test('tooltip box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#ice-tooltip-icon data-test-tooltip-icon=true placement="bottom-end"}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await tooltipHelpers.openTooltip('[data-test-tooltip-icon]');
  await waitForAnimations(tooltipHelpers.TOOLTIP_SELECTOR);

  assert.equal(tooltipHelpers.getTooltip().getAttribute('x-placement'), 'bottom-end',
    'tooltip box reflects correct direction');
});
