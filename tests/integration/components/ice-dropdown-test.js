import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { PageObject } from 'ember-classy-page-object';
import { clickable, hasClass } from 'ember-cli-page-object';

import IceDropdownPage from '@addepar/ice-pop/test-support/pages/ice-dropdown';

const DropdownHelper = IceDropdownPage.extend({ scope: '[data-test-dropdown]' });

moduleForComponent('ice-dropdown', 'Integration | Component | ice-dropdown', {
  integration: true
});

test('dropdown works', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = DropdownHelper.create();

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
        {{#ice-dropdown data-test-dropdown=true}}
          template block text
        {{/ice-dropdown}}
      </div>
    </div>
  `);

  const content = new PageObject({
    scope: '[data-test-content]',
    clickOutsideElement: clickable('[data-test-outside-element]'),

    dropdown: DropdownHelper
  }).create();

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
      {{#ice-dropdown data-test-dropdown=true}}
        <ul class="ice-dropdown-menu">
          <li class="list-group-header" data-test-menu-header>Group Header</li>
          <li><a data-close disabled>Lorem ipsum</a></li>
          <li class="list-divider" data-test-list-divider></li>
          <li data-test-close-item data-close>Foo bar baz</li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = DropdownHelper.extend({
    content: {
      click: clickable(),
      clickMenuHeader: clickable('[data-test-menu-header]'),
      clickDisabledItem: clickable('[disabled]'),
      clickDivider: clickable('[data-test-list-divider]'),
      clickCloseItem: clickable('[data-test-close-item]')
    }
  }).create();

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
      {{#ice-dropdown data-test-dropdown=true class="foobar"}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = DropdownHelper.extend({
    content: {
      hasAdditionalClass: hasClass('foobar')
    }
  }).create();

  await dropdown.open();

  assert.ok(dropdown.content.hasAdditionalClass, 'dropdown box reflects additional class');
});

test('dropdown box direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true placement="bottom-end"}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = DropdownHelper.create();

  await dropdown.open();

  assert.equal(dropdown.content.placement, 'bottom-end', 'dropdown box reflects correct direction');
});

test('dropdown trigger element is marked as active when open', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true placement="bottom-end"}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = DropdownHelper.create();

  assert.ok(!dropdown.trigger.isActive, 'dropdown trigger is not marked as active when the dropdown is closed');

  await dropdown.open();

  assert.ok(dropdown.trigger.isActive, 'dropdown trigger is marked as active when the dropdown is open');

  await dropdown.close();

  assert.ok(!dropdown.trigger.isActive, 'dropdown trigger is not marked as active when the dropdown is closed again');
});
