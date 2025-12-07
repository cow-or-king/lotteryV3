'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Applique la classe auth-page au body
    document.body.classList.add('auth-page');
    document.documentElement.classList.add('auth-page');

    // Cleanup au démontage
    return () => {
      document.body.classList.remove('auth-page');
      document.documentElement.classList.remove('auth-page');
    };
  }, []);

  return <>{children}</>;
}
