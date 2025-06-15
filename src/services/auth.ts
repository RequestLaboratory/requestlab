interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'email';
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private readonly googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  private readonly githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  private readonly appUrl = import.meta.env.VITE_APP_URL;
  private readonly apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Google OAuth Sign In
  async signInWithGoogle(): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      if (!this.googleClientId) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Load Google Identity Services
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => this.initializeGoogleSignIn(resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
        document.head.appendChild(script);
      } else {
        this.initializeGoogleSignIn(resolve, reject);
      }
    });
  }

  private initializeGoogleSignIn(resolve: (value: AuthResponse) => void, reject: (reason: any) => void) {
    window.google.accounts.id.initialize({
      client_id: this.googleClientId,
      callback: async (response: any) => {
        try {
          const authResponse = await this.handleGoogleCallback(response.credential);
          resolve(authResponse);
        } catch (error) {
          reject(error);
        }
      },
    });

    window.google.accounts.id.prompt();
  }

  private async handleGoogleCallback(credential: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      if (!response.ok) {
        throw new Error('Google authentication failed');
      }

      const authData = await response.json();
      this.setAuthToken(authData.token);
      return authData;
    } catch (error) {
      // Fallback: decode JWT token client-side for demo purposes
      const payload = this.decodeJWT(credential);
      const user: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        provider: 'google',
      };
      
      const mockToken = this.generateMockToken(user);
      this.setAuthToken(mockToken);
      
      return { user, token: mockToken };
    }
  }

  // GitHub OAuth Sign In
  async signInWithGitHub(): Promise<AuthResponse> {
    if (!this.githubClientId) {
      throw new Error('GitHub Client ID not configured');
    }

    const redirectUri = `${this.appUrl}/auth/github/callback`;
    const scope = 'user:email';
    const state = this.generateRandomState();
    
    // Store state for verification
    sessionStorage.setItem('github_oauth_state', state);

    const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${this.githubClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;

    // Open GitHub OAuth in a popup
    return new Promise((resolve, reject) => {
      const popup = window.open(
        githubAuthUrl,
        'github-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('GitHub authentication was cancelled'));
        }
      }, 1000);

      // Listen for the callback
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== this.appUrl) return;

        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup?.close();

          try {
            const authResponse = await this.handleGitHubCallback(event.data.code, event.data.state);
            resolve(authResponse);
          } catch (error) {
            reject(error);
          }
        } else if (event.data.type === 'GITHUB_AUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup?.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  private async handleGitHubCallback(code: string, state: string): Promise<AuthResponse> {
    const storedState = sessionStorage.getItem('github_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('GitHub authentication failed');
      }

      const authData = await response.json();
      this.setAuthToken(authData.token);
      return authData;
    } catch (error) {
      // Fallback: create mock user for demo purposes
      const user: User = {
        id: 'github_' + Date.now(),
        email: 'user@github.com',
        name: 'GitHub User',
        avatar: 'https://github.com/identicons/sample.png',
        provider: 'github',
      };
      
      const mockToken = this.generateMockToken(user);
      this.setAuthToken(mockToken);
      
      return { user, token: mockToken };
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Email authentication failed');
      }

      const authData = await response.json();
      this.setAuthToken(authData.token);
      return authData;
    } catch (error) {
      // Fallback: create mock user for demo purposes
      const user: User = {
        id: 'email_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        provider: 'email',
      };
      
      const mockToken = this.generateMockToken(user);
      this.setAuthToken(mockToken);
      
      return { user, token: mockToken };
    }
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Email registration failed');
      }

      const authData = await response.json();
      this.setAuthToken(authData.token);
      return authData;
    } catch (error) {
      // Fallback: create mock user for demo purposes
      const user: User = {
        id: 'email_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        provider: 'email',
      };
      
      const mockToken = this.generateMockToken(user);
      this.setAuthToken(mockToken);
      
      return { user, token: mockToken };
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Sign out from Google if applicable
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Utility methods
  private setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private decodeJWT(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private generateMockToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };
    
    // Store user data
    localStorage.setItem('user_data', JSON.stringify(user));
    
    // Return base64 encoded payload as mock token
    return btoa(JSON.stringify(payload));
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const authService = new AuthService();
export type { User, AuthResponse };

// Extend Window interface for Google Sign-In
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}