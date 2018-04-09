import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { triggerEvent } from 'ember-native-dom-helpers';

import AddeTooltipPage from '@addepar/pop-menu/test-support/pages/adde-tooltip';

import { hasClass, triggerable } from 'ember-classy-page-object';

const TooltipHelper = AddeTooltipPage.extend({ scope: '[data-test-tooltip]' });

moduleForComponent('adde-tooltip', 'Integration | Component | adde-tooltip', {
  integration: true
});

test('tooltip works', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#adde-tooltip data-test-tooltip=true}}
        template block text
      {{/adde-tooltip}}
    </div>
  `);

  let tooltip = TooltipHelper.create();

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
      {{#adde-tooltip data-test-tooltip=true}}
        template block text
      {{/adde-tooltip}}
    </div>
  `);

  let tooltip = TooltipHelper.create();

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
      {{#adde-tooltip data-test-tooltip=true class="error-tooltip"}}
        template block text
      {{/adde-tooltip}}
    </div>
  `);

  let tooltip = TooltipHelper.extend({
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
      {{#adde-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/adde-tooltip}}
    </div>
  `);

  let tooltip = TooltipHelper.create();

  await tooltip.open();

  assert.equal(tooltip.content.placement, 'bottom-end', 'tooltip box reflects correct direction');
});

test('tooltip trigger element is marked as active when open', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div>
      Target
      {{#adde-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/adde-tooltip}}
    </div>
  `);

  let tooltip = TooltipHelper.create();

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
      {{#adde-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/adde-tooltip}}
    </div>
  `);

  let tooltip = TooltipHelper.create();

  assert.ok(tooltip.trigger.hasAriaPopup, 'tooltip trigger has aria-haspopup role');
  assert.equal(tooltip.trigger.isAriaExpanded, 'false', 'tooltip trigger role aria-expanded is false');

  await tooltip.open();

  assert.equal(tooltip.trigger.isAriaExpanded, 'true', 'tooltip trigger role aria-expanded is true when the tooltip is open');

  await tooltip.close();

  assert.equal(tooltip.trigger.isAriaExpanded, 'false', 'tooltip trigger role aria-expanded is false when the tooltip is closed again');
});

test('tooltip is keyboard accessible', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <button>
      Target
      {{#adde-tooltip data-test-tooltip=true placement="bottom-end"}}
        template block text
      {{/adde-tooltip}}
    </button>
  `);

  let tooltip = TooltipHelper.extend({
    trigger: {
      focus: triggerable('focus'),
      blur: triggerable('blur')
    }
  }).create();

  assert.ok(!tooltip.isOpen, 'tooltip not rendered initially');

  await tooltip.trigger.focus();

  assert.ok(tooltip.isOpen, 'tooltip renders after focusing on the target');

  await tooltip.trigger.blur();

  assert.ok(!tooltip.isOpen, 'tooltip removed after unfocusing of the target');
});
