import { find, findAll, triggerEvent } from 'ember-native-dom-helpers';

const TOOLTIP_CLASS = '.ice-tooltip';
const TOOLTIP_ICON_CLASS = '.tooltip-icon';

/**
 * Get count of currently rendered tooltips in the DOM
 * @return {number}
 */
const getTooltipsCount = () =>
  findAll(TOOLTIP_CLASS).length;

/**
 * Get count of currently rendered tooltip icons in the DOM
 * @return {number}
 */
const getTooltipIconsCount = () =>
  findAll(TOOLTIP_ICON_CLASS).length;

/**
 * Find currently rendered tooltip in the DOM
 * @return {object}
 */
const getTooltip = () =>
  find(TOOLTIP_CLASS);

/**
 * Find currently rendered tooltip icon in the DOM
 * @return {object}
 */
const getTooltipIcon = () =>
  find(TOOLTIP_ICON_CLASS);

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
  TOOLTIP_CLASS,
  TOOLTIP_ICON_CLASS,
  getTooltipsCount,
  getTooltipIconsCount,
  getTooltip,
  getTooltipIcon,
  openTooltip,
  closeTooltip
};
