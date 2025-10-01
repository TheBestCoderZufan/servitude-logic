// src/lib/utils.js

/**
 * Format a date string according to the given options.
 *
 * By default, the date string will be formatted with the year, month (short), and day (numeric).
 * The options object should contain any of the valid options for the Intl.DateTimeFormat constructor.
 *
 * @param {string} date - The date string to be formatted
 * @param {{year: string, month: string, day: string}} [options={}] - The options for the Intl.DateTimeFormat constructor
 * @returns {string} The formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return "";
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(
    new Date(date)
  );
}

/**
 * Format a currency amount according to the given options.
 *
 * By default, the currency amount will be formatted with the given currency and up to two decimal places.
 * The options object should contain any of the valid options for the Intl.NumberFormat constructor.
 *
 * @param {number} amount - The currency amount to be formatted
 * @param {string} [currency=USD] - The currency to be used for formatting
 * @returns {string} The formatted currency string
 */
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string according to the given options.
 *
 * By default, the date string will be formatted with the year, month (short), day (numeric), hour (2-digit), and minute (2-digit).
 *
 * @param {string} date - The date string to be formatted
 * @returns {string} The formatted date string
 */
export function formatDateTime(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(date));
}

/**
 * Format a given date string as a relative time string, e.g. "3 days ago".
 *
 * The given date string should be in a format that can be parsed by the Date constructor.
 *
 * The returned string will be in one of the following formats:
 * - "Just now" if the given date is within the last minute
 * - "{X} minute(s) ago" if the given date is within the last hour
 * - "{X} hour(s) ago" if the given date is within the last 24 hours
 * - "{X} day(s) ago" if the given date is within the last 7 days
 * - "{X} week(s) ago" if the given date is within the last 28 days
 * - "{X} month(s) ago" if the given date is within the last 365 days
 * - "{X} year(s) ago" if the given date is more than a year ago
 *
 * @param {string} date - The date string to be formatted
 * @returns {string} The formatted relative time string
 */
export function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  } else {
    return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  }
}

/**
 * Return the first two letters of the given name, or "U" if the name is falsy.
 *
 * The letters are taken from the first letter of each word in the name,
 * and are uppercased.
 *
 * Useful for generating a user's initials from their full name.
 *
 * @param {string} [name] - The name to generate initials from
 * @returns {string} The initials
 */
export function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate the percentage of tasks that are completed in a project.
 *
 * @param {{tasks: Array<{status: string}>}} project - The project object
 * @returns {number} The percentage of completed tasks
 */
export function calculateProjectProgress(project) {
  if (!project.tasks || project.tasks.length === 0) return 0;
  const completedTasks = project.tasks.filter(
    (task) => task.status === "DONE"
  ).length;
  return Math.round((completedTasks / project.tasks.length) * 100);
}

/**
 * Maps a status string to its corresponding variant for use in UI components.
 *
 * The returned variant is a string that can be used to style UI components
 * differently based on the given status. The following variants are available:
 * - 'default'
 * - 'planning'
 * - 'inProgress'
 * - 'completed'
 * - 'onHold'
 * - 'cancelled'
 * - 'warning'
 * - 'error'
 * - 'success'
 *
 * @param {string} status - The status to map
 * @returns {string} The variant string
 */
export function getStatusVariant(status) {
  switch (status) {
    case "PLANNING":
      return "planning";
    case "IN_PROGRESS":
      return "inProgress";
    case "COMPLETED":
      return "completed";
    case "ON_HOLD":
      return "onHold";
    case "CANCELLED":
      return "cancelled";
    case "BACKLOG":
      return "default";
    case "BLOCKED":
      return "error";
    case "READY_FOR_REVIEW":
      return "info";
    case "CLIENT_APPROVED":
      return "success";
    case "DONE":
      return "completed";
    case "DRAFT":
      return "default";
    case "SENT":
      return "warning";
    case "PAID":
      return "success";
    case "OVERDUE":
      return "error";
    default:
      return "default";
  }
}

/**
 * Maps a priority string to its corresponding variant for use in UI components.
 *
 * The returned variant is a string that can be used to style UI components
 * differently based on the given priority. The following variants are available:
 * - 'default'
 * - 'error'
 * - 'warning'
 * - 'success'
 *
 * @param {string} priority - The priority to map
 * @returns {string} The variant string
 */
export function getPriorityVariant(priority) {
  switch (priority) {
    case "HIGH":
      return "error";
    case "MEDIUM":
      return "warning";
    case "LOW":
      return "success";
    default:
      return "default";
  }
}

/**
 * Format the given number of bytes into a human-readable string,
 * with a specified number of decimal places.
 *
 * @param {number} bytes - The number of bytes to format
 * @param {number} [decimals=2] - The number of decimal places to include
 * @returns {string} The formatted string
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Truncates a given text string to a given maximum length,
 * appending an ellipsis if the text is longer than the maximum length.
 *
 * @param {string} text the text to truncate
 * @param {number} [maxLength=100] the maximum length of the text
 * @returns {string} the truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Generates a unique invoice number based on the current date and time.
 *
 * @returns {string} A string in the format INV-YYYY-MMDDHHMM
 */
export function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const timestamp = Date.now().toString().slice(-4);
  return `INV-${year}-${month}${timestamp}`;
}

/**
 * Validate whether a given string is a valid email address.
 *
 * The email address must contain a "@" and a ".", and must not contain any
 * whitespace characters.
 *
 * @param {string} email the string to validate
 * @returns {boolean} `true` if the string is a valid email address, `false` otherwise
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
/**
 * Validate whether a given string is a valid phone number.
 *
 * The phone number may contain leading `+`, whitespace, parentheses, and dashes.
 * The phone number must consist of at least 1 digit and up to 15 digits.
 *
 * @param {string} phone the phone number to validate
 * @returns {boolean} true if the phone number is valid, false otherwise
 */
export function validatePhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  return phoneRegex.test(cleanPhone);
}

/**
 * Validate whether a given string is a valid URL.
 *
 * @param {string} url the URL to validate
 * @returns {boolean} true if the URL is valid, false otherwise
 */
export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns a debounced version of the given function.
 *
 * When the debounced function is invoked, it will only call the original
 * function after `wait` milliseconds have passed since the last time the
 * debounced function was invoked. This can be used to slow down the rate at
 * which the original function is called. For example, if the original function
 * is a function that sends an API request, you might want to debounce it so
 * that it is only sent once every 500 milliseconds at most.
 *
 * @param {function} func the function to debounce
 * @param {number} wait the number of milliseconds to wait before calling the
 *                     original function
 *
 * @returns {function} the debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Groups the given array of objects by the given key.
 *
 * @param {Object[]} array the array of objects to group
 * @param {string} key the key to group the objects by
 * @returns {Object.<string, Object[]>} an object with the groups as keys and
 *          arrays of objects as values
 */
export function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
}

/**
 * Sorts an array by a given key in ascending or descending order.
 *
 * @function
 * @param {array} array - The array to be sorted.
 * @param {string} key - The key to sort by. Supports nested objects by
 * @param {string} [direction="asc"] - The direction of the sort, either
 *   "asc" for ascending or "desc" for descending.
 * @returns {array} The sorted array.
 */
export function sortBy(array, key, direction = "asc") {
  return [...array].sort((a, b) => {
    const aVal = key.split(".").reduce((obj, k) => obj?.[k], a);
    const bVal = key.split(".").reduce((obj, k) => obj?.[k], b);

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

/**
 * capitalizeFirstLetter
 * Normalizes the provided string so that the first character is uppercase and the
 * remaining characters are lowercase.
 *
 * @param {string|null|undefined} str - Raw string to transform.
 * @returns {string} Transformed string, or an empty string when input is falsy.
 */
export function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
