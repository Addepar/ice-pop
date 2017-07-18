import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ice-tooltip-icon', 'Integration | Component | ice tooltip icon', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ice-tooltip-icon}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#ice-tooltip-icon}}
      template block text
    {{/ice-tooltip-icon}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
