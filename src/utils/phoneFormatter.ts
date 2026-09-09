/**
 * Formats a phone string into +(380)-XX-XXX-XX-XX format
 * e.g. "969992920" -> "+(380)-96-999-29-20"
 * "0969992920" -> "+(380)-96-999-29-20"
 * "380969992920" -> "+(380)-96-999-29-20"
 */
export const formatPhoneNumber = (val: string): string => {
  if (!val) return '';
  
  // Extract all digits
  let digits = val.replace(/\D/g, '');
  
  // Handle national prefixes if present
  if (digits.startsWith('380')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('38') && digits.length > 2) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // Limit to 9 national Ukrainian digits
  digits = digits.slice(0, 9);
  
  if (digits.length === 0) {
    return '';
  }
  
  let res = '+(380)-';
  if (digits.length > 0) {
    res += digits.slice(0, 2);
  }
  if (digits.length > 2) {
    res += '-' + digits.slice(2, 5);
  }
  if (digits.length > 5) {
    res += '-' + digits.slice(5, 7);
  }
  if (digits.length > 7) {
    res += '-' + digits.slice(7, 9);
  }
  
  return res;
};

/**
 * Validates whether phone contains all 9 national digits (e.g. 969992920)
 */
export const isPhoneComplete = (phone: string): boolean => {
  if (!phone) return false;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('380')) digits = digits.slice(3);
  else if (digits.startsWith('38')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.length >= 9;
};
