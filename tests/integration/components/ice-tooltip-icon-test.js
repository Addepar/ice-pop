import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { find, triggerEvent } from 'ember-native-dom-helpers';

moduleForComponent('ice-tooltip-icon', 'Integration | Component | ice tooltip icon', {
  integration: true
});

test('it renders', async function(assert) {
  // Template block usage:
  this.render(hbs`
    {{#ice-tooltip-icon}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  await triggerEvent('.tooltip-icon', 'mouseenter');

  assert.equal(find('.ice-tooltip').textContent.trim(), 'template block text');
});
