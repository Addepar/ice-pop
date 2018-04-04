import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import IceTooltipIconPage from '@addepar/ice-pop/test-support/pages/ice-tooltip-icon';

const IconHelper = IceTooltipIconPage.extend({ scope: '[data-test-tooltip-icon]' });

module('Integration | Component | ice-tooltip-icon', function(hooks) {
  setupRenderingTest(hooks);

  test('target icon renders', async function(assert) {
    assert.expect(2);

    await render(hbs`
      {{#ice-tooltip-icon data-test-tooltip-icon=true}}
        template block text
      {{/ice-tooltip-icon}}
    `);

    let icon = IconHelper.create();

    assert.ok(icon.isPresent, 'a tooltip icon target is rendered');
    assert.ok(icon.isIcon('fa-question-circle'), 'tooltip has correct default class');
  });

  test('tooltip works as expected', async function(assert) {
    assert.expect(3);

    await render(hbs`
      {{#ice-tooltip-icon data-test-tooltip-icon=true}}
        template block text
      {{/ice-tooltip-icon}}
    `);

    let icon = IconHelper.create();

    await icon.tooltip.open();

    assert.ok(icon.tooltip.content.isPresent, 'hovering icon target renders a tooltip');
    assert.equal(icon.tooltip.content.text, 'template block text', 'tooltip content renders');

    await icon.tooltip.close();

    assert.ok(!icon.tooltip.content.isPresent, 'tooltip removed after exiting the tooltip icon');
  });

  test('tooltip icon class can be modified', async function(assert) {
    assert.expect(2);

    await render(hbs`
      {{#ice-tooltip-icon data-test-tooltip-icon=true iconClass="fa-exclamation"}}
        template block text
      {{/ice-tooltip-icon}}
    `);

    let icon = IconHelper.create();

    assert.ok(icon.isIcon('fa-exclamation'), 'tooltip icon has new class');
    assert.ok(!icon.isIcon('fa-question-circle'), 'tooltip icon no longer has default class');
  });

  test('tooltip box modifier class can be added', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{#ice-tooltip-icon data-test-tooltip-icon=true tooltipClass="error-tooltip"}}
        template block text
      {{/ice-tooltip-icon}}
    `);

    let icon = IconHelper.create();

    await icon.tooltip.open();

    assert.ok(icon.tooltip.content.hasClass('error-tooltip'), 'tooltip box reflects additional class');
  });

  test('tooltip box direction can be modified', async function(assert) {
    assert.expect(1);

    await render(hbs`
      {{#ice-tooltip-icon data-test-tooltip-icon=true placement="bottom-end"}}
        template block text
      {{/ice-tooltip-icon}}
    `);

    let icon = IconHelper.create();

    await icon.tooltip.open();

    assert.equal(icon.tooltip.content.placement, 'bottom-end', 'tooltip box reflects correct direction');
  });
});
