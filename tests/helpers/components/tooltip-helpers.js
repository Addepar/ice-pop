import { find, findAll, triggerEvent } from 'ember-native-dom-helpers';

const TOOLTIP_SELECTOR = '[data-test-tooltip]';

/**
 * Get count of currently rendered tooltips in the DOM
 * @return {number}
 */
const getTooltipsCount = () =>
  findAll(TOOLTIP_SELECTOR).length;

/**
 * Find currently rendered tooltip in the DOM
 * @return {object}
 */
const getTooltip = () =>
  find(TOOLTIP_SELECTOR);

/**
 * Mimic mousing over the tooltip trigger point to open the tooltip box
 * @param {string} tooltip target selector
 */
const openTooltip = (target) =>
  triggerEvent(target, 'mouseenter');

/**
 * Mimic mousing out of the tooltip trigger point to close the tooltip box
 * @param {string} tooltip target selector
 */
const closeTooltip = (target) =>
  triggerEvent(target, 'mouseleave');

export {
  TOOLTIP_SELECTOR,
  getTooltipsCount,
  getTooltip,
  openTooltip,
  closeTooltip
};
