import type { Client } from '../types';

/**
 * Normalizes company name by stripping legal forms (ТОВ, ПП, ФОП тощо), 
 * quotes, symbols, punctuation, and correcting common Ukrainian/Russian phonetics.
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';

  let normalized = name.toLowerCase();

  // 1. Remove quotes and brackets
  normalized = normalized.replace(/[«»""''„“`]/g, '');
  normalized = normalized.replace(/[()[\]{}]/g, ' ');

  // 2. Remove common Ukrainian & international legal forms
  const legalPrefixes = [
    /\bтов\b/g,
    /\bтзов\b/g,
    /\bпп\b/g,
    /\bфоп\b/g,
    /\bспд\b/g,
    /\bпрат\b/g,
    /\bпат\b/g,
    /\bват\b/g,
    /\bзат\b/g,
    /\bкп\b/g,
    /\bдп\b/g,
    /\bго\b/g,
    /\bllc\b/g,
    /\bltd\b/g,
    /\binc\b/g,
    /\bcorp\b/g,
    /\bco\b/g,
    /\bcompany\b/g,
    /\bкомпанія\b/g,
    /\bпідприємство\b/g,
    /\bагентство\b/g,
    /\bагенція\b/g,
    /\bавтосервіс\b/g,
    /\bавтосервис\b/g,
    /\bсто\b/g
  ];

  for (const regex of legalPrefixes) {
    normalized = normalized.replace(regex, ' ');
  }

  // 3. Phonetic / spelling normalization for typo tolerance (UA/RU variations)
  normalized = normalized
    .replace(/[иііїыэ]/g, 'і') // unify vowels that frequently get mixed up (сервис / сервіс)
    .replace(/[еє]/g, 'е')
    .replace(/[ґг]/g, 'г');

  // 4. Remove punctuation & special characters
  normalized = normalized.replace(/[.,/#!$%^&*;:{}=\-_~+?@|<>\\]/g, ' ');

  // 5. Trim and collapse multiple whitespaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Calculates Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));

  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;
  for (let j = 0; j <= an; ++j) matrix[0][j] = j;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Calculates string similarity ratio between 0.0 and 1.0.
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 && !str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return 1.0 - distance / maxLen;
}

export interface CompanyMatchResult {
  client: Client;
  score: number; // 0..1
  matchType: 'exact' | 'normalized_exact' | 'contains' | 'fuzzy';
  matchedName: string;
  reason: string;
}

/**
 * Intelligent search for an existing company in the database with typo and synonym tolerance.
 */
export function findMatchingCompany(
  inputName: string,
  clients: Client[],
  threshold = 0.72
): CompanyMatchResult | null {
  if (!inputName || !inputName.trim()) return null;

  const rawInput = inputName.trim().toLowerCase();
  const normInput = normalizeCompanyName(inputName);

  let bestMatch: CompanyMatchResult | null = null;
  let highestScore = 0;

  for (const client of clients) {
    const rawClientName = client.name.trim().toLowerCase();
    const normClientName = normalizeCompanyName(client.name);

    // 1. Exact raw match
    if (rawClientName === rawInput) {
      return {
        client,
        score: 1.0,
        matchType: 'exact',
        matchedName: client.name,
        reason: 'Точний збіг назви компанії'
      };
    }

    // 2. Exact normalized match (e.g. «ТОВ ФармаТрейд» vs «ФармаТрейд»)
    if (normInput.length > 2 && normClientName.length > 2 && normInput === normClientName) {
      return {
        client,
        score: 0.98,
        matchType: 'normalized_exact',
        matchedName: client.name,
        reason: 'Повний збіг після очищення правової форми та лапок'
      };
    }

    // 3. Substring / Token inclusion check (e.g. "Гараж 777" inside "Автосервіс Гараж 777")
    const inputTokens = normInput.split(' ').filter(t => t.length > 1);
    const clientTokens = normClientName.split(' ').filter(t => t.length > 1);

    if (inputTokens.length > 0 && clientTokens.length > 0) {
      const allInputInClient = inputTokens.every(t => normClientName.includes(t));
      const allClientInInput = clientTokens.every(t => normInput.includes(t));

      if (allInputInClient || allClientInInput) {
        const tokenScore = 0.92;
        if (tokenScore > highestScore) {
          highestScore = tokenScore;
          bestMatch = {
            client,
            score: tokenScore,
            matchType: 'contains',
            matchedName: client.name,
            reason: `Співпадіння ключових слів компанії (${allInputInClient ? 'входить до назви' : 'містить назву'})`
          };
        }
      }
    }

    // 4. Fuzzy Levenshtein on normalized names
    const sim = calculateSimilarity(normInput, normClientName);
    if (sim >= threshold && sim > highestScore) {
      highestScore = sim;
      bestMatch = {
        client,
        score: Math.round(sim * 100) / 100,
        matchType: 'fuzzy',
        matchedName: client.name,
        reason: `Схожість назви з врахуванням можливої помилки або описки (${Math.round(sim * 100)}%)`
      };
    }
  }

  return bestMatch;
}

/**
 * Normalizes phone numbers to digits only for accurate matching.
 */
export function normalizePhoneDigits(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // If starts with 380, keep 380..., if starts with 0, convert to 380...
  if (digits.startsWith('0') && digits.length === 10) {
    return '38' + digits;
  }
  return digits;
}

/**
 * Checks if a phone number already belongs to the client or their additional contacts.
 */
export function isContactInCompany(client: Client, phone: string, name?: string): boolean {
  const normPhone = normalizePhoneDigits(phone);
  
  if (normPhone && normalizePhoneDigits(client.phone) === normPhone) {
    return true;
  }

  if (client.additionalContacts && client.additionalContacts.length > 0) {
    for (const contact of client.additionalContacts) {
      if (normPhone && normalizePhoneDigits(contact.phone) === normPhone) {
        return true;
      }
      if (name && contact.name.trim().toLowerCase() === name.trim().toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}
