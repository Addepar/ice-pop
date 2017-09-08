import { find, findAll, click } from 'ember-native-dom-helpers';

const POPOVER_SELECTOR = '[data-test-popover]';
const POPOVER_HEADER_SELECTOR = '[data-test-popover-header]';

/**
 * Get count of currently rendered popovers in the DOM
 * @return {number}
 */
const getPopoversCount = () =>
  findAll(POPOVER_SELECTOR).length;

/**
 * Find currently rendered popover in the DOM
 * @return {object}
 */
const getPopover = () =>
  find(POPOVER_SELECTOR);

/**
 * Find header of currently rendered popover in the DOM
 * @return {object}
 */
const getPopoverHeader = () =>
  find(POPOVER_HEADER_SELECTOR);

/**
 * Click the popover trigger element to toggle the popover box open/closed
 * @param {string} popover target selector
 */
const togglePopover = (target) =>
  click(target);

/**
 * Click the close element inside the popover to close the popover box
 */
const clickPopoverCloseElement = () =>
  click('[data-popover-close]', POPOVER_SELECTOR);

export {
  POPOVER_SELECTOR,
  POPOVER_HEADER_SELECTOR,
  getPopoversCount,
  getPopover,
  getPopoverHeader,
  togglePopover,
  clickPopoverCloseElement
};
