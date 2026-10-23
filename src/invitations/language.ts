// No React here: the WhatsApp preview build step (scripts/sharePreviews.ts) uses this too.

export type Language = 'en' | 'id';

/** English when the couple greets in English ('Dear', 'To', …); Indonesian otherwise. */
export const greetingLanguage = (greeting: string): Language => (/^(dear|to|for|hi|hello)$/i.test(greeting.trim()) ? 'en' : 'id');
