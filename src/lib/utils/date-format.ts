/**
 * Date Formatting Utilities
 * Utilitaires pour formater les dates de façon cohérente
 */

/**
 * Format a date in French locale with full date and time
 * @param date - The date to format (Date object, string, or null)
 * @returns Formatted date string or "Jamais" if null
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) {
    return 'Jamais';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

/**
 * Format a date in French locale with full date only
 * @param date - The date to format (Date object or string)
 * @returns Formatted date string
 */
export function formatFullDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
  }).format(new Date(date));
}

/**
 * Format a date in French locale with short date
 * @param date - The date to format (Date object or string)
 * @returns Formatted date string
 */
export function formatShortDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
  }).format(new Date(date));
}

/**
 * Format a date in French locale with medium date
 * @param date - The date to format (Date object or string)
 * @returns Formatted date string
 */
export function formatMediumDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(date));
}
