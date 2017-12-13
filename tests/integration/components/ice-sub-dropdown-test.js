import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { triggerEvent } from 'ember-native-dom-helpers';

import PageObject, { clickable } from 'ember-classy-page-object';

import IceDropdownPage from '@addepar/ice-pop/test-support/pages/ice-dropdown';
import IceSubDropdownPage from '@addepar/ice-pop/test-support/pages/ice-sub-dropdown';

moduleForComponent('ice-sub-dropdown', 'Integration | Component | ice-sub-dropdown', {
  integration: true
});

test('sub dropdown box renders when hovering target list item', async function(assert) {
  assert.expect(10);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true}}
        <ul class="ice-dropdown-menu">
          <li>
            <a>Foo bar baz</a>
            {{#ice-sub-dropdown data-test-sub-dropdown=true}}
              <ul class="ice-dropdown-menu">
                <li><a>Foo bar baz</a></li>
              </ul>
            {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = IceDropdownPage.extend({
    scope: '[data-test-dropdown]',
    content: {
      subDropdown: IceSubDropdownPage.extend({
        scope: '[data-test-sub-dropdown]'
      })
    }
  }).create();

  const { subDropdown } = dropdown.content;

  assert.ok(!dropdown.isOpen, 'main dropdown not rendered initially');
  assert.ok(!subDropdown.isOpen, 'sub dropdown not rendered initially');

  await dropdown.open();

  assert.ok(dropdown.isOpen, 'main dropdown is rendered');
  assert.ok(!subDropdown.isOpen, 'sub dropdown not rendered yet');

  await subDropdown.open();

  assert.ok(subDropdown.isOpen, 'sub dropdown is rendered');

  // Trigger the event manually so that we can trigger mouseenter on the
  // tooltip content before it finishes closing
  triggerEvent(subDropdown.scope, 'mouseleave');
  await triggerEvent(subDropdown.content.scope, 'mouseenter');

  assert.ok(
    subDropdown.isOpen,
    'sub dropdown is still rendered after entering the sub dropdown box'
  );

  await triggerEvent(subDropdown.content.scope, 'mouseleave');

  assert.ok(
    !subDropdown.isOpen,
    'sub dropdown is no longer rendered when mouse leaves the content'
  );

  await subDropdown.open();

  assert.ok(subDropdown.isOpen, 'sub dropdown reopened');

  await dropdown.close();

  assert.ok(!dropdown.isOpen, 'dropdown closed');
  assert.ok(!subDropdown.isOpen, 'sub dropdown closed with main dropdown');
});

test('sub dropdown box closes when element outside of sub dropdown is clicked', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div data-test-content>
      <div data-test-outside-element></div>
      <div>
        Target
        {{#ice-dropdown data-test-dropdown=true}}
          <ul class="ice-dropdown-menu">
            <li>
              <a>Foo bar baz</a>
              {{#ice-sub-dropdown data-test-sub-dropdown=true}}
                <ul class="ice-dropdown-menu">
                  <li><a>Foo bar baz</a></li>
                </ul>
              {{/ice-sub-dropdown}}
            </li>
          </ul>
        {{/ice-dropdown}}
      </div>
    </div>
  `);

  const content = PageObject.extend({
    scope: '[data-test-content]',
    clickOutsideElement: clickable('[data-test-outside-element]'),

    dropdown: IceDropdownPage.extend({
      scope: '[data-test-dropdown]',
      content: {
        subDropdown: IceSubDropdownPage.extend({
          scope: '[data-test-sub-dropdown]'
        })
      }
    })
  }).create();

  const { dropdown } = content;
  const { subDropdown } = dropdown.content;

  await dropdown.open();
  await subDropdown.open();

  assert.ok(dropdown.isOpen, 'dropdown is rendered');
  assert.ok(subDropdown.isOpen, 'sub dropdown is rendered');

  await content.clickOutsideElement();

  assert.ok(!dropdown.isOpen, 'dropdown is closed');
  assert.ok(!subDropdown.isOpen, 'sub dropdown is closed');
});

test('clicking inside sub dropdown only closes for certain elements', async function(assert) {
  assert.expect(12);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true}}
        <ul class="ice-dropdown-menu">
          <li><a>Foo bar baz</a>
          {{#ice-sub-dropdown data-test-sub-dropdown=true}}
            <ul class="ice-dropdown-menu">
              <li class="list-group-header" data-test-menu-header>Group Header</li>
              <li><a data-close disabled>Lorem ipsum</a></li>
              <li class="list-divider" data-test-list-divider></li>
              <li data-test-close-item data-close>Foo bar baz</li>
            </ul>
          {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = IceDropdownPage.extend({
    scope: '[data-test-dropdown]',
    content: {
      subDropdown: IceSubDropdownPage.extend({
        scope: '[data-test-sub-dropdown]',

        content: {
          click: clickable(),
          clickMenuHeader: clickable('[data-test-menu-header]'),
          clickDisabledItem: clickable('[disabled]'),
          clickDivider: clickable('[data-test-list-divider]'),
          clickCloseItem: clickable('[data-test-close-item]')
        }
      })
    }
  }).create();

  const { subDropdown } = dropdown.content;

  await dropdown.open();
  await subDropdown.open();

  assert.ok(dropdown.isOpen, 'dropdown is rendered');
  assert.ok(subDropdown.isOpen, 'dropdown is rendered');

  await subDropdown.content.click();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking the sub dropdown container');
  assert.ok(subDropdown.isOpen, 'sub dropdown does not close after clicking the sub dropdown container');

  await subDropdown.content.clickMenuHeader();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking a menu header');
  assert.ok(subDropdown.isOpen, 'sub dropdown does not close after clicking a menu header');

  await subDropdown.content.clickDisabledItem();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking a disabled item');
  assert.ok(subDropdown.isOpen, 'sub dropdown does not close after clicking a disabled item');

  await subDropdown.content.clickDivider();

  assert.ok(dropdown.isOpen, 'dropdown does not close after clicking a list divider');
  assert.ok(subDropdown.isOpen, 'sub dropdown does not close after clicking a list divider');

  await subDropdown.content.clickCloseItem();

  assert.ok(!dropdown.isOpen, 'dropdown closed after clicking the close element');
  assert.ok(!subDropdown.isOpen, 'sub dropdown closed after clicking the close element');
});

test('sub dropdown direction can be modified', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true}}
        <ul class="ice-dropdown-menu">
          <li>
            <a>Foo bar baz</a>
            {{#ice-sub-dropdown data-test-sub-dropdown=true placement="right-end"}}
              <ul class="ice-dropdown-menu">
                <li><a>Foo bar baz</a></li>
              </ul>
            {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = IceDropdownPage.extend({
    scope: '[data-test-dropdown]',
    content: {
      subDropdown: IceSubDropdownPage.extend({
        scope: '[data-test-sub-dropdown]'
      })
    }
  }).create();

  const { subDropdown } = dropdown.content;

  await dropdown.open();
  await subDropdown.open();

  assert.equal(subDropdown.content.placement, 'right-end', 'Sub dropdown box reflects correct direction');
});

test('sub dropdown button is active when open', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true}}
        <ul class="ice-dropdown-menu">
          <li>
            <a>Foo bar baz</a>
            {{#ice-sub-dropdown data-test-sub-dropdown=true placement="right-end"}}
              <ul class="ice-dropdown-menu">
                <li><a>Foo bar baz</a></li>
              </ul>
            {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = IceDropdownPage.extend({
    scope: '[data-test-dropdown]',
    content: {
      subDropdown: IceSubDropdownPage.extend({
        scope: '[data-test-sub-dropdown]'
      })
    }
  }).create();

  const { subDropdown } = dropdown.content;

  await dropdown.open();

  assert.ok(!subDropdown.trigger.isActive, 'Sub dropdown target list item does not initially reflect active class');

  await subDropdown.open();

  assert.ok(subDropdown.trigger.isActive, 'Sub dropdown target list item reflects active class');
});

test('sub dropdown button has correct aria roles', async function(assert) {
  assert.expect(4);

  this.render(hbs`
    <div>
      Target
      {{#ice-dropdown data-test-dropdown=true}}
        <ul class="ice-dropdown-menu">
          <li>
            <a>Foo bar baz</a>
            {{#ice-sub-dropdown data-test-sub-dropdown=true placement="right-end"}}
              <ul class="ice-dropdown-menu">
                <li><a>Foo bar baz</a></li>
              </ul>
            {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  const dropdown = IceDropdownPage.extend({
    scope: '[data-test-dropdown]',
    content: {
      subDropdown: IceSubDropdownPage.extend({
        scope: '[data-test-sub-dropdown]'
      })
    }
  }).create();

  const { subDropdown } = dropdown.content;

  await dropdown.open();

  assert.ok(subDropdown.trigger.hasAriaPopup, 'subdropdown trigger has aria-haspopup role');
  assert.equal(subDropdown.trigger.isAriaExpanded, 'false', 'subdropdown trigger role aria-expanded is false');

  await subDropdown.open();

  assert.equal(subDropdown.trigger.isAriaExpanded, 'true', 'subdropdown trigger role aria-expanded is true when the subdropdown is open');

  await subDropdown.close();

  assert.equal(subDropdown.trigger.isAriaExpanded, 'false', 'subdropdown trigger role aria-expanded is false when the subdropdown is closed again');
});
