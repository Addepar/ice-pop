import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { find, findAll, triggerEvent } from 'ember-native-dom-helpers';

import waitForAnimations from '../../helpers/wait-for-animations';

moduleForComponent('ice-tooltip', 'Integration | Component | ice tooltip', {
  integration: true
});

test('it renders when parent element is the target', async function(assert) {
  assert.expect(4);

  // Template block usage:
  this.render(hbs`
    <div id="tooltip-target">
      Target
      {{#ice-tooltip}}
        template block text
      {{/ice-tooltip}}
    </div>
  `);

  assert.equal(findAll('.ice-tooltip').length, 0, 'tooltip not rendered initially');

  await triggerEvent('#tooltip-target', 'mouseenter');
  await waitForAnimations('.ice-tooltip');

  assert.equal(find('.ice-tooltip').textContent.trim(), 'template block text', 'tooltip rendered after entering the target');
  assert.equal(findAll('.ice-tooltip').length, 1, 'only one tooltip rendered');

  await triggerEvent('#tooltip-target', 'mouseleave');
  await waitForAnimations('.ice-tooltip');

  assert.equal(findAll('.ice-tooltip').length, 0, 'tooltip removed after exiting the parent');
});

test('it renders when another element is the target', async function(assert) {
  assert.expect(4);

  // Template block usage:
  this.render(hbs`
    <div id="tooltip-target">
      Target
    </div>

    {{#ice-tooltip target="#tooltip-target"}}
      template block text
    {{/ice-tooltip}}
  `);

  assert.equal(findAll('.ice-tooltip').length, 0, 'tooltip not rendered initially');

  await triggerEvent('#tooltip-target', 'mouseenter');
  await waitForAnimations('.ice-tooltip');

  assert.equal(find('.ice-tooltip').textContent.trim(), 'template block text', 'tooltip rendered after entering the target');
  assert.equal(findAll('.ice-tooltip').length, 1, 'only one tooltip rendered');

  await triggerEvent('#tooltip-target', 'mouseleave');
  await waitForAnimations('.ice-tooltip');

  assert.equal(findAll('.ice-tooltip').length, 0, 'tooltip removed after exiting the parent');
});
