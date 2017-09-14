import { find, findAll, click, triggerEvent } from 'ember-native-dom-helpers';

const DROPDOWN_SELECTOR = '[data-test-dropdown]';
const DROPDOWN_HEADER_SELECTOR = '[data-test-dropdown-header]';
const DROPDOWN_CLOSE = 'data-dropdown-close';
const SUB_DROPDOWN_SELECTOR = '[data-test-sub-dropdown]';

/**
 * Get count of currently rendered dropdowns in the DOM
 * @return {number}
 */
const getDropdownsCount = () =>
  findAll(DROPDOWN_SELECTOR).length;

/**
 * Get count of currently rendered sub dropdowns in the DOM
 * @return {number}
 */
const getSubDropdownsCount = () =>
  findAll(SUB_DROPDOWN_SELECTOR).length;

/**
 * Find currently rendered dropdown in the DOM
 * @return {object}
 */
const getDropdown = () =>
  find(DROPDOWN_SELECTOR);

/**
 * Find currently rendered sub dropdown in the DOM
 * @return {object}
 */
const getSubDropdown = () =>
  find(SUB_DROPDOWN_SELECTOR);

/**
 * Find header of currently rendered dropdown in the DOM
 * @return {object}
 */
const getDropdownHeader = () =>
  find(DROPDOWN_HEADER_SELECTOR);

/**
 * Click the dropdown trigger element to toggle the dropdown box open/closed
 * @param {string} dropdown target selector
 */
const toggleDropdown = (target) =>
  click(target);

/**
 * Mimic mousing over the list item that opens a sub dropdown
 * @param {string} tooltip target selector
 */
const openSubDropdown = (target) =>
  triggerEvent(target, 'mouseenter');

/**
 * Mimic mousing out of the list item that opens a sub dropdown, so it will close
 * @param {string} tooltip target selector
 */
const closeSubDropdown = (target) =>
  triggerEvent(target, 'mouseleave');

/**
 * Click the close element inside the dropdown to close the dropdown box
 */
const clickDropdownCloseElement = () =>
  click(`[${DROPDOWN_CLOSE}]`, DROPDOWN_SELECTOR);

/**
 * Finds the value of the dropdown close attribute
 * @param  {string} target The element what would have the close attribute
 * @return {string}        Will return null if it has not been set
 */
const getCloseAttribute = (target) =>
  find(target).getAttribute(DROPDOWN_CLOSE);

export {
  DROPDOWN_SELECTOR,
  DROPDOWN_HEADER_SELECTOR,
  DROPDOWN_CLOSE,
  SUB_DROPDOWN_SELECTOR,
  getDropdownsCount,
  getSubDropdownsCount,
  getDropdown,
  getSubDropdown,
  getDropdownHeader,
  toggleDropdown,
  openSubDropdown,
  closeSubDropdown,
  clickDropdownCloseElement,
  getCloseAttribute
};
