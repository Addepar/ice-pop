import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { triggerEvent } from 'ember-native-dom-helpers';

import IceTooltipPage from '@addepar/ice-pop/test-support/pages/ice-tooltip';

import { hasClass, triggerable } from 'ember-classy-page-object';

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

test('tooltip trigger element has correct aria roles', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  const tooltip = TooltipHelper.create();

  assert.ok(tooltip.trigger.hasAriaPopup, 'tooltip trigger has aria-haspopup role');
  assert.equal(tooltip.trigger.isAriaExpanded, 'false', 'tooltip trigger role aria-expanded is false');

  await tooltip.open();

  assert.equal(tooltip.trigger.isAriaExpanded, 'true', 'tooltip trigger role aria-expanded is true when the tooltip is open');

  await tooltip.close();

  assert.equal(tooltip.trigger.isAriaExpanded, 'false', 'tooltip trigger role aria-expanded is false when the tooltip is closed again');
});

test('tooltip is keyboard accessible', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <button>
      Target
      {{#ice-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/ice-tooltip}}
    </button>
  `);

  const tooltip = TooltipHelper.extend({
    trigger: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      space: triggerable('keydown', null, { eventProperties: { key: ' ' } })
    },
    content: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } })
    }
  }).create();

  assert.ok(!tooltip.isOpen, 'tooltip not rendered initially');

  await tooltip.trigger.enter();

  assert.ok(tooltip.isOpen, 'tooltip renders after pressing enter on the target');

  await tooltip.trigger.escape();

  assert.ok(!tooltip.isOpen, 'tooltip removed after pressing escape on the target');

  await tooltip.trigger.space();

  assert.ok(tooltip.isOpen, 'tooltip renders after pressing space on the target');
});

test('Focusing on hidden focus tracker closes tooltip', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <button>
      Target
      {{#ice-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/ice-tooltip}}
    </button>
  `);

  const tooltip = TooltipHelper.extend({
    content: {
      focusHiddenTracker: triggerable('focus', '[data-test-focus-tracker]')
    }
  }).create();

  await tooltip.open();

  assert.ok(tooltip.isOpen, 'tooltip is rendered');

  await tooltip.content.focusHiddenTracker();

  assert.ok(!tooltip.isOpen, 'tooltip removed after focusing on hidden focus tracker');
});
