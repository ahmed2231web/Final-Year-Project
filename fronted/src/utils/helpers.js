/**
 * Utility functions for the AgroConnect application
 */

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date string
 * @param {string|Date} dateString - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Truncate text to a specific length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text with ellipsis if needed
 */
export function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Calculate discounted price
 * @param {number} price - Original price
 * @param {number} discountPercentage - Discount percentage
 * @returns {number} - Discounted price
 */
export function calculateDiscountedPrice(price, discountPercentage) {
  if (!discountPercentage) return price;
  return price - (price * (discountPercentage / 100));
}

/**
 * Get a user-friendly stock status
 * @param {number} quantity - Stock quantity
 * @returns {Object} - Status object with text and color class
 */
export function getStockStatus(quantity) {
  if (quantity <= 0) {
    return { text: 'Out of Stock', colorClass: 'text-red-600' };
  }
  if (quantity < 5) {
    return { text: 'Low Stock', colorClass: 'text-orange-600' };
  }
  return { text: 'In Stock', colorClass: 'text-green-600' };
}

/**
 * Sanitize a string for use in URLs or file paths
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_');
}
