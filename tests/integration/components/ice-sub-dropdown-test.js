import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { find, click, triggerEvent } from 'ember-native-dom-helpers';

import waitForAnimations from '../../helpers/wait-for-animations';
import dropdownHelpers from '../../helpers/components/dropdown-helpers';

moduleForComponent('ice-sub-dropdown', 'Integration | Component | ice sub dropdown', {
  integration: true
});

test('sub dropdown box renders when hovering target list item', async function(assert) {
  assert.expect(7);

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

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'main dropdown not rendered initially');
  assert.equal(dropdownHelpers.getSubDropdownsCount(), 0,
    'sub dropdown not rendered initially');

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'main dropdown is rendered');
  assert.equal(dropdownHelpers.getSubDropdownsCount(), 0,
    'sub dropdown not rendered yet');

  await dropdownHelpers.openSubDropdown('[data-test-sub-item]');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'sub dropdown is rendered');

  triggerEvent('[data-test-sub-item]', 'mouseleave');
  await triggerEvent(dropdownHelpers.SUB_DROPDOWN_SELECTOR, 'mouseenter');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'sub dropdown is still rendered after entering the sub dropdown box');

  await triggerEvent(dropdownHelpers.SUB_DROPDOWN_SELECTOR, 'mouseleave');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 0,
    'sub dropdown is no longer rendered when mouse is no longer hovering the list item');
});

test('sub dropdown box closes when element outside of sub dropdown is clicked', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-outside-element></div>
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

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);
  await dropdownHelpers.openSubDropdown('[data-test-sub-item]');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'sub dropdown is rendered');

  await click('[data-test-outside-element]');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'sub dropdown removed after clicking the outside element');
});

test('clicking inside sub dropdown only closes for certain elements', async function(assert) {
  assert.expect(11);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        <ul class="ice-dropdown-menu">
          <li data-test-sub-item><a>Foo bar baz</a>
          {{#ice-sub-dropdown}}
            <ul class="ice-dropdown-menu">
              <li class="list-group-header" data-test-menu-header>Group Header</li>
              <li><a disabled>Lorem ipsum</a></li>
              <li class="list-divider" data-test-list-divider></li>
              <li data-dropdown-close>Foo bar baz</li>
            </ul>
          {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);
  await dropdownHelpers.openSubDropdown('[data-test-sub-item]');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'sub dropdown is rendered');

  await click(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'Sub dropdown does not close after clicking the sub dropdown container');
  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'Main dropdown has also not been closed');

  await click('[data-test-menu-header]');

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'Sub dropdown does not close after clicking a menu header');
  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'Main dropdown has also not been closed');

  await click('[disabled]');

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'Sub dropdown does not close after clicking a disabled item');
  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'Main dropdown has also not been closed');

  await click('[data-test-list-divider]');

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 1,
    'Sub dropdown does not close after clicking a list divider');
  assert.equal(dropdownHelpers.getDropdownsCount(), 1,
    'Main dropdown has also not been closed');

  await dropdownHelpers.clickDropdownCloseElement();
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdownsCount(), 0,
    'Sub dropdown removed after clicking the close element');
  assert.equal(dropdownHelpers.getDropdownsCount(), 0,
    'Main dropdown also removed after clicking the close element');
});

test('sub dropdown direction can be modified', async function(assert) {
  assert.expect(2);

  this.render(hbs`
    <div data-test-dropdown-target>
      Target
      {{#ice-dropdown}}
        <ul class="ice-dropdown-menu">
          <li data-test-sub-item><a>Foo bar baz</a>
          {{#ice-sub-dropdown placement="right-end"}}
            <ul class="ice-dropdown-menu">
              <li><a>Foo bar baz</a></li>
            </ul>
          {{/ice-sub-dropdown}}
          </li>
        </ul>
      {{/ice-dropdown}}
    </div>
  `);

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);
  await dropdownHelpers.openSubDropdown('[data-test-sub-item]');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(dropdownHelpers.getSubDropdown().getAttribute('x-placement'), 'right-end',
    'Sub dropdown box reflects correct direction');
  assert.equal(find('[data-test-sub-item]').getAttribute('dropdown-placement'), 'right-end',
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

  await dropdownHelpers.toggleDropdown('[data-test-dropdown-target]');
  await waitForAnimations(dropdownHelpers.DROPDOWN_SELECTOR);

  assert.equal(find('[data-test-sub-item]').classList.contains('is-active'), false,
    'Sub dropdown target list item does not initially reflect active class');

  await dropdownHelpers.openSubDropdown('[data-test-sub-item]');
  await waitForAnimations(dropdownHelpers.SUB_DROPDOWN_SELECTOR);

  assert.equal(find('[data-test-sub-item]').classList.contains('is-active'), true,
    'Sub dropdown target list item reflects active class');
});
