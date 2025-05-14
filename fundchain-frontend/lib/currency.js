/**
 * Currency conversion utilities for FundChain
 */

// Hardcoded conversion rate (in production, you would use a real-time API)
const ETH_TO_INR_RATE = 275000; // Approximate rate: 1 ETH = ₹275,000 (as of May 2023)

/**
 * Convert ETH to INR
 * @param {string|number} ethAmount - Amount in ETH
 * @returns {number} Amount in INR
 */
export function ethToInr(ethAmount) {
  if (!ethAmount) return 0;
  const ethValue = parseFloat(ethAmount);
  if (isNaN(ethValue)) return 0;
  return ethValue * ETH_TO_INR_RATE;
}

/**
 * Convert INR to ETH
 * @param {string|number} inrAmount - Amount in INR
 * @returns {number} Amount in ETH
 */
export function inrToEth(inrAmount) {
  if (!inrAmount) return 0;
  const inrValue = parseFloat(inrAmount);
  if (isNaN(inrValue)) return 0;
  return inrValue / ETH_TO_INR_RATE;
}

/**
 * Format currency for display
 * @param {string|number} amount - Amount to format
 * @param {string} currency - Currency code (INR, ETH)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'INR') {
  if (!amount) return currency === 'INR' ? '₹0' : '0 ETH';
  
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return currency === 'INR' ? '₹0' : '0 ETH';
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numAmount);
  } else if (currency === 'ETH') {
    return `${numAmount.toFixed(4)} ETH`;
  }
  
  return amount.toString();
} 