import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import PageObject, { clickable, hasClass, is, triggerable } from 'ember-classy-page-object';

import AddeDropdownPage from '@addepar/pop-menu/test-support/pages/adde-dropdown';

const DropdownHelper = AddeDropdownPage.extend('[data-test-dropdown]');

moduleForComponent('adde-dropdown', 'Integration | Component | adde-dropdown', {
  integration: true,
});

test('dropdown works', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#adde-dropdown data-test-dropdown=true}}
        template block text
      {{/adde-dropdown}}
    </div>
  `);

  let dropdown = new DropdownHelper();

  assert.ok(!dropdown.isOpen, 'dropdown not rendered initially');

  await dropdown.open();

  assert.ok(dropdown.isOpen, 'dropdown is rendered');
  assert.equal(dropdown.content.text, 'template block text', 'dropdown has correct text');

  await dropdown.close();

  assert.ok(!dropdown.isOpen, 'dropdown removed after exiting the parent');
});

test('dropdown box closes when element outside of dropdown is clicked', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-content>
      <div data-test-outside-element></div>
      <div>
        Target
        {{#adde-dropdown data-test-dropdown=true}}
          template block text
        {{/adde-dropdown}}
      </div>
    </div>
  `);

  let content = new PageObject({
    scope: '[data-test-content]',
    clickOutsideElement: clickable('[data-test-outside-element]'),

    dropdown: DropdownHelper,
  });

  await content.dropdown.open();

  assert.ok(content.dropdown.isOpen, 'dropdown is rendered');

  await content.clickOutsideElement();

  assert.ok(!content.dropdown.isOpen, 'dropdown closed when outside element clicked');
});

test('clicking inside dropdown only closes for certain elements', async function(assert) {
  assert.expect(6);

  this.render(hbs`
    <div>
      Target
      {{#adde-dropdown data-test-dropdown=true}}
        <ul class="adde-dropdown-menu">
          <li class="list-group-header" data-test-menu-header>Group Header</li>
          <li><a data-close disabled>Lorem ipsum</a></li>
          <li class="list-divider" data-test-list-divider></li>
          <li data-test-close-item data-close>Foo bar baz</li>
        </ul>
      {{/adde-dropdown}}
    </div>
  `);

  let dropdown = new DropdownHelper({
    content: {
      click: clickable(),
      clickMenuHeader: clickable('[data-test-menu-header]'),
      clickDisabledItem: clickable('[disabled]'),
      clickDivider: clickable('[data-test-list-divider]'),
      clickCloseItem: clickable('[data-test-close-item]'),
    },
  });

  await dropdown.open();

  assert.ok(dropdown.isOpen, 'dropdown is rendered');

  await dropdown.content.click();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking the dropdown container');

  await dropdown.content.clickMenuHeader();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking a menu header');

  await dropdown.content.clickDisabledItem();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking a disabled item');

  await dropdown.content.clickDivider();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking a list divider');

  await dropdown.content.clickCloseItem();

  assert.ok(!dropdown.isOpen, 'dropdown removed after clicking the close element');
});

test('dropdown box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#adde-dropdown data-test-dropdown=true class="foobar"}}
        template block text
      {{/adde-dropdown}}
    </div>
  `);

  let dropdown = new DropdownHelper({
    content: {
      hasAdditionalClass: hasClass('foobar'),
    },
  });

  await dropdown.open();

  assert.ok(dropdown.content.hasAdditionalClass, 'dropdown box reflects additional class');
});

test('dropdown box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#adde-dropdown data-test-dropdown=true placement="bottom-end"}}
        template block text
      {{/adde-dropdown}}
    </div>
  `);

  let dropdown = new DropdownHelper();

  await dropdown.open();

  assert.equal(dropdown.content.placement, 'bottom-end', 'dropdown box reflects correct direction');
});

test('dropdown trigger element is marked as active when open', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div>
      Target
      {{#adde-dropdown data-test-dropdown=true placement="bottom-end"}}
        template block text
      {{/adde-dropdown}}
    </div>
  `);

  let dropdown = new DropdownHelper();

  assert.ok(
    !dropdown.trigger.isActive,
    'dropdown trigger is not marked as active when the dropdown is closed'
  );

  await dropdown.open();

  assert.ok(
    dropdown.trigger.isActive,
    'dropdown trigger is marked as active when the dropdown is open'
  );

  await dropdown.close();

  assert.ok(
    !dropdown.trigger.isActive,
    'dropdown trigger is not marked as active when the dropdown is closed again'
  );
});

test('dropdown trigger element has correct aria roles', async function(assert) {
  assert.expect(5);

  this.render(hbs`
    <div>
      Target
      {{#adde-dropdown data-test-dropdown=true placement="bottom-end"}}
        template block text
      {{/adde-dropdown}}
    </div>
  `);

  let dropdown = new DropdownHelper();

  assert.ok(dropdown.trigger.hasAriaPopup, 'dropdown trigger has aria-haspopup role');
  assert.equal(
    dropdown.trigger.isAriaExpanded,
    'false',
    'dropdown trigger role aria-expanded is false'
  );

  await dropdown.open();

  assert.equal(
    dropdown.trigger.isAriaExpanded,
    'true',
    'dropdown trigger role aria-expanded is true when the dropdown is open'
  );
  assert.ok(dropdown.trigger.hasAriaDescribedBy, 'dropdown trigger has aria-describedby role');

  await dropdown.close();

  assert.equal(
    dropdown.trigger.isAriaExpanded,
    'false',
    'dropdown trigger role aria-expanded is false when the dropdown is closed again'
  );
});

test('dropdown is keyboard accessible', async function(assert) {
  assert.expect(12);

  this.render(hbs`
    <button>
      Target
      {{#adde-dropdown data-test-dropdown=true placement="right-start"}}
        <ul class="adde-dropdown-menu">
          <li><button data-test-menu-item1 data-close>Item</button></li>
          <li><button data-test-menu-item2 data-close>Item</button></li>
        </ul>
      {{/adde-dropdown}}
    </button>
  `);

  let dropdown = new DropdownHelper({
    trigger: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      tab: triggerable('keydown', null, { eventProperties: { key: 'Tab', bubbles: true } }),
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      space: triggerable('keydown', null, { eventProperties: { key: ' ' } }),
      arrowdown: triggerable('keydown', null, { eventProperties: { key: 'ArrowDown' } }),
      arrowup: triggerable('keydown', null, { eventProperties: { key: 'ArrowUp' } }),
    },
    content: {
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      arrowdown: triggerable('keydown', null, { eventProperties: { key: 'ArrowDown' } }),
      arrowup: triggerable('keydown', null, { eventProperties: { key: 'ArrowUp' } }),
      enterOnMenuItem: triggerable('keydown', '[data-test-menu-item1]', {
        eventProperties: { key: 'Enter' },
      }),
      firstItemHasFocus: is(':focus', '[data-test-menu-item1]'),
      lastItemHasFocus: is(':focus', '[data-test-menu-item2]'),
    },
  });

  assert.ok(!dropdown.isOpen, 'dropdown not rendered initially');

  await dropdown.trigger.enter();

  assert.ok(dropdown.isOpen, 'dropdown renders after pressing enter on the target');

  await dropdown.trigger.escape();

  assert.ok(!dropdown.isOpen, 'dropdown removed after pressing escape on the target');

  await dropdown.trigger.space();

  assert.ok(dropdown.isOpen, 'dropdown renders after pressing space on the target');

  await dropdown.content.escape();

  assert.ok(!dropdown.isOpen, 'dropdown removed after pressing escape on the dropdown container');

  await dropdown.trigger.arrowdown();

  assert.ok(dropdown.isOpen, 'dropdown renders after pressing down arrow on the target');
  assert.ok(dropdown.content.firstItemHasFocus, 'first item has focus');

  await dropdown.content.arrowdown();

  assert.ok(dropdown.content.lastItemHasFocus, 'next item has focus on arrow down');

  await dropdown.content.escape();
  await dropdown.trigger.arrowup();

  assert.ok(dropdown.isOpen, 'dropdown renders after pressing up arrow on the target');
  assert.ok(dropdown.content.lastItemHasFocus, 'last item has focus');

  await dropdown.content.arrowup();

  assert.ok(dropdown.content.firstItemHasFocus, 'previous item has focus on arrow up');

  await dropdown.content.enterOnMenuItem();

  assert.ok(!dropdown.isOpen, 'dropdown removed after pressing enter on a data-close item');
});

test('First item autofocuses when opened by keyboard only', async function(assert) {
  assert.expect(6);

  this.render(hbs`
    <button>
      Target
      {{#adde-dropdown data-test-dropdown=true placement="right-start"}}
        <ul class="adde-dropdown-menu">
          <li><button data-test-menu-item>First Item</button></li>
          <li><button>Another Item</button></li>
        </ul>
      {{/adde-dropdown}}
    </button>
  `);

  let dropdown = new DropdownHelper({
    trigger: {
      enter: triggerable('keydown', null, { eventProperties: { key: 'Enter' } }),
      space: triggerable('keydown', null, { eventProperties: { key: ' ' } }),
    },
    content: {
      escape: triggerable('keydown', null, { eventProperties: { key: 'Escape' } }),
      menuItemWithFocus: {
        scope: '[data-test-menu-item]:focus',
      },
    },
  });

  await dropdown.trigger.enter();

  assert.ok(dropdown.isOpen, 'dropdown rendered on enter');
  assert.ok(dropdown.content.menuItemWithFocus.isPresent, 'first menu item has focus');

  await dropdown.content.escape();
  await dropdown.trigger.space();

  assert.ok(dropdown.isOpen, 'dropdown rendered on space');
  assert.ok(dropdown.content.menuItemWithFocus.isPresent, 'first menu item has focus');

  await dropdown.content.escape();
  await dropdown.open();

  assert.ok(dropdown.isOpen, 'dropdown rendered on click');
  assert.ok(!dropdown.content.menuItemWithFocus.isPresent, 'first menu item does not have focus');
});

test('The dropdown can be positioned to another element than its parent', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <button style="width:250px; height:30px;" data-test-target>New parent</button>
    <button style="width: 200px; height: 20px;" data-test-button>
      Target
      {{#adde-dropdown
        data-test-dropdown=true
        placement="bottom-start"
        positionTarget=popperTarget
      }}
        <ul class="adde-dropdown-menu">
          <li><button data-test-menu-item1 data-close>Item 1</button></li>
          <li><button data-test-menu-item2 data-close>Item 2</button></li>
        </ul>
      {{/adde-dropdown}}
    </button>
  `);

  let dropdown = new DropdownHelper();

  let newTarget = this.$('[data-test-target]')[0];
  this.set('popperTarget', newTarget);
  await dropdown.open();
  let targetRects = newTarget.getClientRects();
  let dropdownElt = document.querySelector('.adde-dropdown');
  let dropdownRects = dropdownElt.getClientRects();
  assert.equal(
    targetRects[0].bottom,
    dropdownRects[0].top,
    "dropdown positioned relatively to its target's bottom side"
  );
  assert.equal(
    targetRects[0].left,
    dropdownRects[0].left,
    "dropdown positioned relatively to its target's left side"
  );
});

test('The dropdown sends didInsertCallback and willDestroyCallback actions', async function(assert) {
  assert.expect(2);

  this.on('didInsert', component => {
    assert.ok(component, 'didInsert action is sent');
  });
  this.on('willDestroy', component => {
    assert.ok(component, 'willDestroy action is sent');
  });

  this.set('isVisible', true);

  this.render(hbs`
    {{#if isVisible}}
    <button style="width: 200px; height: 20px;">
      Target
      {{#adde-dropdown
        data-test-dropdown=true
        placement="bottom-start"
        didInsertCallback='didInsert'
        willDestroyCallback='willDestroy'
      }}
        <ul class="adde-dropdown-menu">
          <li><button data-test-menu-item1 data-close>Item 1</button></li>
          <li><button data-test-menu-item2 data-close>Item 2</button></li>
        </ul>
      {{/adde-dropdown}}
    </button>
    {{/if}}
  `);

  this.set('isVisible', false);
});

test('The dropdown can be opened programmatically', async function(assert) {
  assert.expect(1);

  this.on('didInsert', component => {
    this.component = component;
  });
  this.render(hbs`
    <button style="width: 200px; height: 20px;">
      Target
      {{#adde-dropdown
        data-test-dropdown=true
        placement="bottom-start"
        didInsertCallback='didInsert'
      }}
        <ul class="adde-dropdown-menu">
          <li><button data-test-menu-item1 data-close>Item 1</button></li>
          <li><button data-test-menu-item2 data-close>Item 2</button></li>
        </ul>
      {{/adde-dropdown}}
    </button>
  `);

  let dropdown = new DropdownHelper();
  await this.component.open();
  assert.ok(dropdown.isOpen, 'dropdown opens when calling `open`');
});
