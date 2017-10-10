import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { click } from 'ember-native-dom-helpers';

import waitForAnimations from '../../helpers/wait-for-animations';
import popoverHelpers from '../../helpers/components/popover-helpers';

moduleForComponent('ice-popover', 'Integration | Component | ice popover', {
  integration: true
});

test('popover box renders when parent element is the target', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div data-test-popover-target>
      Target
      {{#ice-popover placement="bottom-start"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  assert.equal(popoverHelpers.getPopoversCount(), 0,
    'popover not rendered initially');

  await popoverHelpers.togglePopover('[data-test-popover-target]');

  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 1,
    'only one popover is rendered');

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 0,
    'popover removed after clicking the target again');
});

test('popover box renders when another element is the target', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div data-test-popover-target>
      Target
    </div>

    {{#ice-popover target="[data-test-popover-target]" placement="bottom-start"}}
      template block text
    {{/ice-popover}}
  `);

  assert.equal(popoverHelpers.getPopoversCount(), 0,
    'popover not rendered initially');

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 1,
    'only one popover is rendered');

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 0,
    'popover removed after clicking the target again');
});

test('popover box closes when element outside of popover is clicked', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-outside-element></div>
    <div data-test-popover-target>
      Target
      {{#ice-popover placement="bottom-start"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  await popoverHelpers.togglePopover('[data-test-popover-target]');

  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 1,
    'popover is rendered');

  await click('[data-test-outside-element]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 0,
    'popover removed after clicking the outside element');
});

test('clicking inside popover only closes for designated elements', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div data-test-popover-target>
      Target
      {{#ice-popover placement="bottom-start"}}
        template block text
        <button data-popover-close>Close Me</button>
      {{/ice-popover}}
    </div>
  `);

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 1,
    'popover is rendered');

  await click(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 1,
    'popover does not close after clicking the popover container');

  await popoverHelpers.clickPopoverCloseElement();
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoversCount(), 0,
    'popover removed after clicking the close element');
});

test('popover box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-popover-target>
      Target
      {{#ice-popover class="foobar" placement="bottom-start"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopover().classList.contains('foobar'), true,
    'popover box reflects additional class');
});

test('popover box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-popover-target>
      Target
      {{#ice-popover placement="bottom-end"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopover().getAttribute('x-placement'), 'bottom-end',
    'popover box reflects correct direction');
});

test('popover box correctly renders content', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-popover-target>
      Target
      {{#ice-popover placement="bottom-start"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopover().textContent.trim(), 'template block text',
    'popover renders given content');
});

test('popover header is rendered when title is passed in', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-popover-target>
      Target
      {{#ice-popover placement="bottom-start" popoverTitle="Foo"}}
        template block text
      {{/ice-popover}}
    </div>
  `);

  await popoverHelpers.togglePopover('[data-test-popover-target]');
  await waitForAnimations(popoverHelpers.POPOVER_SELECTOR);

  assert.equal(popoverHelpers.getPopoverHeader().textContent.trim(), 'Foo',
    'popover header renders given content');
});
