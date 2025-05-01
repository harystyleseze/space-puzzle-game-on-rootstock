/**
 * Utility functions for handling BigNumber objects from Ethereum
 */

/**
 * Safely converts a potential BigNumber object to a number
 * @param value Any value that might be a BigNumber
 * @returns A regular JavaScript number
 */
export const toBigNumberToNumber = (value: any): number => {
  if (!value) return 0;

  // Check if it's a BigNumber object (has _hex property)
  if (value._hex !== undefined) {
    // Convert hex string to number
    return parseInt(value._hex, 16);
  }

  // Check if it's an object with isBigNumber flag
  if (value._isBigNumber) {
    // Try to convert to number safely
    try {
      return Number(value.toString());
    } catch (e) {
      console.error("Error converting BigNumber to number:", e);
      return 0;
    }
  }

  // If it's already a number or string, convert to number
  return Number(value);
};

/**
 * Safely converts a potential BigNumber object to a string
 * @param value Any value that might be a BigNumber
 * @returns A string representation
 */
export const toBigNumberToString = (value: any): string => {
  if (!value) return "0";

  // Check if it's a BigNumber object (has _hex property)
  if (value._hex !== undefined) {
    // Convert hex string to number and then to string
    return parseInt(value._hex, 16).toString();
  }

  // Check if it's an object with isBigNumber flag
  if (value._isBigNumber) {
    // Try to convert to string safely
    try {
      return value.toString();
    } catch (e) {
      console.error("Error converting BigNumber to string:", e);
      return "0";
    }
  }

  // If it's already a number or string, convert to string
  return value.toString();
};

/**
 * Safely formats a value for display, handling BigNumber objects
 * @param value Any value that might be a BigNumber
 * @returns A safely formatted string for display
 */
export const formatValue = (value: any): string => {
  return toBigNumberToString(value);
};
