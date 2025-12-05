/**
 * Home Page
 * Redirection temporaire vers la page de login
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Pour l'instant, on redirige vers la page de login
  // Plus tard, on créera une vraie landing page
  redirect('/login');
}
