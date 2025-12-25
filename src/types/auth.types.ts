/**
 * Auth types
 */
export interface GoogleUserMetadata {
  name?: string;
  given_name?: string;
  family_name?: string;
  avatar_url?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
}

export interface GameUserData {
  supabaseId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
}

export interface AuthCallbackResponse {
  success: boolean;
  isGameAuth?: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  session?: {
    access_token: string;
  };
}

export type AuthStatus = 'processing' | 'success' | 'error';
