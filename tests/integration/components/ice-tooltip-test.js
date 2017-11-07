import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { triggerEvent } from 'ember-native-dom-helpers';

import IceTooltipPage from '@addepar/ice-pop/test-support/pages/ice-tooltip';

import { hasClass } from 'ember-cli-page-object';

const TooltipHelper = IceTooltipPage.extend({ scope: '[data-test-tooltip]' });

moduleForComponent('ice-tooltip', 'Integration | Component | ice-tooltip', {
  integration: true
});

test('tooltip works', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-tooltip data-test-tooltip=true}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  const tooltip = TooltipHelper.create();

  assert.ok(!tooltip.isOpen, 'tooltip not rendered initially');

  await tooltip.open();

  assert.ok(tooltip.isOpen, 'tooltip is rendered');
  assert.equal(tooltip.content.text, 'template block text', 'tooltip has correct text');

  await tooltip.close();

  assert.ok(!tooltip.isOpen, 'tooltip removed after exiting the parent');
});

test('tooltip remains rendered when tooltip box itself is hovered', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-tooltip data-test-tooltip=true}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  const tooltip = TooltipHelper.create();

  assert.ok(!tooltip.isOpen, 'tooltip not rendered initially');

  await tooltip.open();

  assert.ok(tooltip.isOpen, 'tooltip is rendered');

  // Trigger the event manually so that we can trigger mouseenter on the
  // tooltip content before it finishes closing
  triggerEvent(tooltip.scope, 'mouseleave');
  await triggerEvent(tooltip.content.scope, 'mouseenter');

  assert.ok(tooltip.isOpen, 'tooltip is still rendered');

  await triggerEvent(tooltip.content.scope, 'mouseleave');

  assert.ok(!tooltip.isOpen, 'tooltip removed after exiting the content');
});

test('tooltip box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#ice-tooltip data-test-tooltip=true class="error-tooltip"}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  const tooltip = TooltipHelper.extend({
    content: {
      isErrored: hasClass('error-tooltip')
    }
  }).create();

  await tooltip.open();

  assert.ok(tooltip.content.isErrored, 'tooltip box reflects additional class');
});

test('tooltip box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#ice-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  const tooltip = TooltipHelper.create();

  await tooltip.open();

  assert.equal(tooltip.content.placement, 'bottom-end', 'tooltip box reflects correct direction');
});

test('tooltip trigger element is marked as active when open', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div>
      Target
      {{#ice-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  const tooltip = TooltipHelper.create();

  assert.ok(!tooltip.trigger.isActive, 'tooltip trigger is not marked as active when the tooltip is closed');

  await tooltip.open();

  assert.ok(tooltip.trigger.isActive, 'tooltip trigger is marked as active when the tooltip is open');

  await tooltip.close();

  assert.ok(!tooltip.trigger.isActive, 'tooltip trigger is not marked as active when the tooltip is closed again');
});
