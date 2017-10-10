import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { find, click } from 'ember-native-dom-helpers';

import waitForAnimations from '../../helpers/wait-for-animations';
import dropdownHelpers from '../../helpers/components/dropdown-helpers';

moduleForComponent('ice-dropdown', 'Integration | Component | ice dropdown', {
  integration: true
});

test('dropdown box renders when parent element is the target', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'dropdown not rendered initially');

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');

  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'only one dropdown is rendered');

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'dropdown removed after clicking the target again');
});

test('dropdown box renders when another element is the target', async function(assert) {
  assert.expect(3);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
    </div>

    {{#ice-dropdown target="[data-test-dropdown-target]"}}
      template block text
    {{/ice-dropdown}}
  `);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'dropdown not rendered initially');

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'only one dropdown is rendered');

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'dropdown removed after clicking the target again');
});

test('dropdown box closes when element outside of dropdown is clicked', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-outside-element></div>
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'dropdown is rendered');

  await click('[data-test-outside-element]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'dropdown removed after clicking the outside element');
});

test('clicking inside dropdown only closes for certain elements', async function(assert) {
  assert.expect(6);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        <ul class="ice-dropdown-menu">
          <li class="list-group-header" data-test-menu-header>Group Header</li>
          <li><a disabled>Lorem ipsum</a></li>
          <li class="list-divider" data-test-list-divider></li>
          <li data-dropdown-close>Foo bar baz</li>

        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'dropdown is rendered');

  await click(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'dropdown does not close after clicking the dropdown container');

  await click('[data-test-menu-header]');

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'dropdown does not close after clicking a menu header');

  await click('[disabled]');

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'dropdown does not close after clicking a disabled item');

  await click('[data-test-list-divider]');

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'dropdown does not close after clicking a list divider');

  await dropdownHelpers.clickDropdownCloseElement();
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'dropdown removed after clicking the close element');
});

test('List item links automatically become closable elements', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        <ul class="ice-dropdown-menu">
          <li><a data-test-link>Foo bar baz</a></li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  // a single attribute's value is blank by default
  assert.equal(dropdownHelpers.getCloseAttribute('[data-test-link]'), '',
    'Link has correct close attribute');
});

test('Can turn off auto closing menu items', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown closeItems=false}}
        <ul class="ice-dropdown-menu">
          <li><a data-test-link>Foo bar baz</a></li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getCloseAttribute('[data-test-link]'), null,
    'Link does not have close attribute');
});

test('dropdown box modifier class can be added', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown class="foobar"}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdown().classList.contains('foobar'), true,
    'dropdown box reflects additional class');
});

test('dropdown box correctly renders content', async function(assert) {
  assert.expect(1);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdown().textContent.trim(), 'template block text',
    'dropdown renders given content');
});

test('dropdown box direction can be modified', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown placement="bottom-end"}}
        template block text
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdown().getAttribute('x-placement'), 'bottom-end',
    'dropdown box reflects correct direction');
  assert.equal(find('[data-test-dropdown-target]').getAttribute('dropdown-placement'), 'bottom-end',
    'dropdown target reflects correct dropdown placement');
});

test('sub dropdown button is active when open', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        <ul class="ice-dropdown-menu">
          <li data-test-sub-item><a>Foo bar baz</a>
          {{#ice-sub-dropdown}}
            <ul class="ice-dropdown-menu">
              <li><a>Foo bar baz</a></li>
            </ul>
          {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  assert.equal(find('[data-test-dropdown-target]').classList.contains('is-active'), false,
    'Dropdown target does not initially reflect active class');

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(find('[data-test-dropdown-target]').classList.contains('is-active'), true,
    'Dropdown target reflects active class');
});
