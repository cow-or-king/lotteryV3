/**
 * Utility functions
 * Fonctions utilitaires pour l'application
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes Tailwind de manière intelligente
 * Gère les conflits et les overrides
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
