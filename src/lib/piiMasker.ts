/**
 * PII Data Privacy Orchestrator
 * Modular utility to mask and unmask sensitive information before sending to LLMs.
 * 
 * This class should be instantiated once per request lifecycle to ensure 
 * the masking dictionary exists only temporarily in memory.
 */

export class PIIMasker {
  private mapping: Record<string, string> = {};
  private counter: number = 1;

  constructor() {}

  /**
   * Masks sensitive data in the text and stores the mapping in the instance.
   */
  public mask(text: string, knownCustomerName?: string): string {
    let maskedText = text;

    // Helper to replace and map
    const replaceAndMap = (regex: RegExp, type: string) => {
      maskedText = maskedText.replace(regex, (match) => {
        const placeholder = `<${type}_${this.counter++}>`;
        this.mapping[placeholder] = match;
        return placeholder;
      });
    };

    // 1. Explicit Customer Name (if known)
    if (knownCustomerName && knownCustomerName.trim().length > 0) {
      // Escape regex chars
      const escapedName = knownCustomerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'gi');
      replaceAndMap(nameRegex, 'CUSTOMER_NAME');
      
      // Also mask just the first name to be safe
      const firstName = knownCustomerName.split(' ')[0];
      if (firstName.length > 2) {
        const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'gi');
        replaceAndMap(firstNameRegex, 'CUSTOMER_NAME');
      }
    }

    // 2. Email
    replaceAndMap(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'EMAIL');

    // 3. UPI IDs
    replaceAndMap(/\b[A-Za-z0-9.\-_]+@[a-zA-Z]{3,}\b/g, 'UPI_ID');

    // 4. Phone Numbers (Indian format and general 10+ digits)
    replaceAndMap(/\b(?:\+?91[\-\s]?)?[6789]\d{9}\b/g, 'PHONE_NUMBER');
    replaceAndMap(/\b\d{10,12}\b/g, 'PHONE_NUMBER');

    // 5. Aadhaar (12 digits, optional spaces)
    replaceAndMap(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, 'AADHAAR');

    // 6. PAN Card (5 chars, 4 digits, 1 char)
    replaceAndMap(/\b[A-Z]{5}\d{4}[A-Z]{1}\b/gi, 'PAN_CARD');

    // 7. Passport (Indian: 1 letter + 7 digits)
    replaceAndMap(/\b[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]\b/gi, 'PASSPORT');
    
    // 8. Bank Details / Credit Cards (14-16 digits)
    replaceAndMap(/\b(?:\d{4}[\s\-]?){3,4}\d{2,4}\b/g, 'BANK_ACCOUNT_OR_CARD');

    // 9. Heuristic Address Masking
    // Matches sentences/phrases containing common Indian address keywords
    const addressKeywords = ['Road', 'Street', 'Sector', 'Flat', 'Apartment', 'Society', 'Nagar', 'Phase', 'Block', 'Enclave', 'Marg', 'Vihar', 'Layout'];
    const addressRegexStr = `(?:\\b(?:\\d+[A-Za-z]?\\s*,?\\s*)?(?:[A-Za-z]+\\s+){0,4}(?:${addressKeywords.join('|')})\\b(?:\\s*,?\\s*[A-Za-z0-9]+){0,3})`;
    const addressRegex = new RegExp(addressRegexStr, 'gi');
    replaceAndMap(addressRegex, 'ADDRESS');

    // 10. PIN Codes (6 digits)
    replaceAndMap(/\b[1-9][0-9]{2}[\s]?[0-9]{3}\b/g, 'PINCODE');

    return maskedText;
  }

  /**
   * Unmasks the text using the stored mapping.
   */
  public unmask(text: string): string {
    let unmaskedText = text;
    // Iterate over all placeholders and replace them back
    for (const [placeholder, originalValue] of Object.entries(this.mapping)) {
      // Use global regex replace in case the LLM duplicated the placeholder
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedPlaceholder, 'g');
      unmaskedText = unmaskedText.replace(regex, originalValue);
    }
    return unmaskedText;
  }
  /**
   * Deeply unmasks all string values within an object/array.
   * This is safe for JSON since it doesn't break string quoting syntax.
   */
  public unmaskObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.unmask(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.unmaskObject(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        // Unmask both the key and the value (keys rarely contain PII, but just in case)
        newObj[key] = this.unmaskObject(obj[key]);
      }
      return newObj;
    }
    return obj;
  }
}
