/**
 * Narzędzie do generowania unikalnych identyfikatorów
 */

export class IdGenerator {
  /**
   * Generuje unikalny identyfikator w formacie UUID
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Generuje krótki unikalny identyfikator
   */
  static generateShortId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}