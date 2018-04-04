import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import PageObject, { clickable, hasClass, triggerable } from 'ember-classy-page-object';

import IcePopoverPage from '@addepar/ice-pop/test-support/pages/ice-popover';

const PopoverHelper = IcePopoverPage.extend({ scope: '[data-test-popover]' });

moduleForComponent('ice-popover', 'Integration | Component | ice-popover', {
  integration: true
});

test('popover works', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.create();

  assert.ok(!popover.isOpen, 'popover not rendered initially');

  await popover.open();

  assert.ok(popover.isOpen, 'popover is rendered');
  assert.equal(popover.content.text, 'template block text', 'popover has correct text');

  await popover.close();

  assert.ok(!popover.isOpen, 'popover removed after exiting the parent');
});

test('popover box closes when element outside of popover is clicked', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-content>
      <div data-test-outside-element></div>
      <div>
        Target
        {{#ice-popover data-test-popover=true}}
          template block text
        {{/ice-popover}}
      </div>
    </div>
  `);

  let content = PageObject.extend({
    scope: '[data-test-content]',
    clickOutsideElement: clickable('[data-test-outside-element]'),

    popover: PopoverHelper
  }).create();

  await content.popover.open();

  assert.ok(content.popover.isOpen, 'popover is rendered');

  await content.clickOutsideElement();

  assert.ok(!content.popover.isOpen, 'popover closed when outside element clicked');
});

test('clicking inside popover only closes for designated elements', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-start"}}
        template block text
        <button disabled data-close>Close Me</button>
        <button data-test-close data-close>Close Me</button>
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.extend({
    content: {
      click: clickable(),
      clickDisabled: clickable('[disabled]'),
      clickCloseButton: clickable('[data-test-close]')
    }
  }).create();

  await popover.open();

  assert.ok(popover.isOpen, 'popover is rendered');

  await popover.content.click();

  assert.ok(popover.isOpen, 'popover does not close after clicking the popover container');

  await popover.content.clickDisabled();

  assert.ok(popover.isOpen, 'popover does not close after clicking a disabled element');

  await popover.content.clickCloseButton();

  assert.ok(!popover.isOpen, 'popover removed after clicking the close element');
});

test('popover box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true class="foobar"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.extend({
    content: {
      hasAdditionalClass: hasClass('foobar')
    }
  }).create();

  await popover.open();

  assert.ok(popover.content.hasAdditionalClass, 'popover box reflects additional class');
});

test('popover box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-end"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.create();

  await popover.open();

  assert.equal(popover.content.placement, 'bottom-end', 'popover box reflects correct direction');
});

test('popover header is rendered when title is passed in', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-start" popoverTitle="Foo"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.create();

  await popover.open();

  assert.ok(popover.content.header.isPresent, 'popover header is rendered');
  assert.equal(popover.content.header.text, 'Foo', 'popover header renders given content');
});

test('popover trigger element is marked as active when open', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-end"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.create();

  assert.ok(!popover.trigger.isActive, 'popover trigger is not marked as active when the popover is closed');

  await popover.open();

  assert.ok(popover.trigger.isActive, 'popover trigger is marked as active when the popover is open');

  await popover.close();

  assert.ok(!popover.trigger.isActive, 'popover trigger is not marked as active when the popover is closed again');
});

test('popover trigger element has correct aria roles', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-end"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  let popover = PopoverHelper.create();

  assert.ok(popover.trigger.hasAriaPopup, 'popover trigger has aria-haspopup role');
  assert.equal(popover.trigger.isAriaExpanded, 'false', 'popover trigger role aria-expanded is false');

  await popover.open();

  assert.equal(popover.trigger.isAriaExpanded, 'true', 'popover trigger role aria-expanded is true when the popover is open');

  await popover.close();

  assert.equal(popover.trigger.isAriaExpanded, 'false', 'popover trigger role aria-expanded is false when the popover is closed again');
});

test('popover is keyboard accessible', async function(assert) {
  assert.expect(6);

  this.render(hbs`
    <button>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-end"}}
        <button data-close>Close</button>
      {{/ice-popover}}
    </button>
  `);

  let popover = PopoverHelper.extend({
    trigger: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      tab: triggerable('keydown', null, { eventProperties: { key: 'Tab', bubbles: true } }),
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      space: triggerable('keydown', null, { eventProperties: { key: ' ' } })
    },
    content: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      enterOnCloseItem: triggerable('keydown', '[data-close]', { eventProperties: { key: 'Enter' } })
    }
  }).create();

  assert.ok(!popover.isOpen, 'popover not rendered initially');

  await popover.trigger.enter();

  assert.ok(popover.isOpen, 'popover renders after pressing enter on the target');

  await popover.trigger.escape();

  assert.ok(!popover.isOpen, 'popover removed after pressing escape on the target');

  await popover.trigger.space();

  assert.ok(popover.isOpen, 'popover renders after pressing space on the target');

  // tab moves focus to dropdown container
  await popover.trigger.tab();
  await popover.content.escape();

  assert.ok(!popover.isOpen, 'popover removed after pressing escape on the popover container');

  await popover.trigger.enter();
  await popover.content.enterOnCloseItem();

  assert.ok(!popover.isOpen, 'popover removed after pressing enter on a data-close item');
});

test('First item autofocuses when opened by keyboard only', async function(assert) {
  assert.expect(6);

  this.render(hbs`
    <button>
      Target
      {{#ice-popover data-test-popover=true placement="bottom-end"}}
        <button data-test-button data-close>Close</button>
        <button>Foo</button>
      {{/ice-popover}}
    </button>
  `);

  let popover = PopoverHelper.extend({
    trigger: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      space: triggerable('keydown', null, { eventProperties: { key: ' ' } })
    },
    content: {
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      buttonWithFocus: {
        scope: '[data-test-button]:focus'
      }
    }
  }).create();

  await popover.trigger.enter();

  assert.ok(popover.isOpen, 'popover rendered on enter');
  assert.ok(popover.content.buttonWithFocus.isPresent, 'first button has focus');

  await popover.content.escape();
  await popover.trigger.space();

  assert.ok(popover.isOpen, 'popover rendered on space');
  assert.ok(popover.content.buttonWithFocus.isPresent, 'first button has focus');

  await popover.content.escape();
  await popover.open();

  assert.ok(popover.isOpen, 'popover rendered on click');
  assert.ok(!popover.content.buttonWithFocus.isPresent, 'first button does not have focus');
});

moduleForComponent('ice-popover', 'Unit | Component | ice-popover', {
  unit: true
});

test('popper modifiers are customizable', function(assert) {
  assert.expect(2);

  let popover = this.subject();
  assert.deepEqual(
    popover.get('_popperModifiers'),
    {
      flip: { boundariesElement: 'viewport' },
      preventOverflow: { boundariesElement: 'window' }
    },
    'Default modifiers are correct'
  );

  popover.set('popperModifiers', {
    flip: { boundariesElement: 'overrideValue' },
    newProperty: 'newValue'
  });

  assert.deepEqual(
    popover.get('_popperModifiers'),
    {
      flip: { boundariesElement: 'overrideValue' },
      preventOverflow: { boundariesElement: 'window' },
      newProperty: 'newValue'
    },
    'Merging of modifiers is correct'
  );
});
