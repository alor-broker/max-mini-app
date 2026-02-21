import { storageManager } from './storage-manager';

const BIOMETRIC_CREDENTIAL_KEY = 'max_biometric_credential_id';
const BIOMETRIC_ENABLED_KEY = 'max_biometric_enabled';

// Relying party for WebAuthn — should match the app domain
const RP_ID = window.location.hostname;
const RP_NAME = 'Max Mini App';

/**
 * Converts an ArrayBuffer to a base64url-encoded string.
 */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts a base64url-encoded string back to an ArrayBuffer.
 */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a cryptographically random challenge.
 */
function generateChallenge(): ArrayBuffer {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array.buffer as ArrayBuffer;
}

/**
 * BiometricManager provides biometric authentication capabilities
 * using the Web Authentication API (WebAuthn) with platform authenticators
 * (fingerprint scanner, Face ID, etc.).
 *
 * If biometrics are not available, the app falls back to PIN code.
 */
export const biometricManager = {
  /**
   * Checks if biometric authentication is available on this device.
   * Returns true if:
   * 1. The Web Authentication API is supported
   * 2. A platform authenticator (biometric) is available
   * 3. The app is running on a mobile platform (ios/android)
   */
  isAvailable: async (): Promise<boolean> => {
    try {
      // Check if we're on a mobile platform via WebApp bridge
      const platform = window.WebApp?.platform;
      const isMobile = platform === 'ios' || platform === 'android';

      // If we know the platform and it's not mobile, skip biometrics
      // If platform is unknown (e.g., testing in browser), still allow biometrics
      if (platform && !isMobile) {
        return false;
      }

      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        console.log('[BiometricManager] WebAuthn not supported');
        return false;
      }

      // Check if a platform authenticator is available
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        console.log('[BiometricManager] Platform authenticator available:', available);
        return available;
      }

      return false;
    } catch (error) {
      console.warn('[BiometricManager] Error checking biometric availability:', error);
      return false;
    }
  },

  /**
   * Checks if biometrics have been enrolled (credential registered) for this app.
   */
  isEnrolled: async (): Promise<boolean> => {
    try {
      const credentialId = await storageManager.getItem(BIOMETRIC_CREDENTIAL_KEY);
      const enabled = await storageManager.getItem(BIOMETRIC_ENABLED_KEY);
      return !!(credentialId && enabled === 'true');
    } catch {
      return false;
    }
  },

  /**
   * Registers a new biometric credential for the current user.
   * This should be called after the user creates or enters their PIN successfully,
   * so we can link biometric auth to the existing session.
   *
   * @returns true if registration succeeded, false otherwise.
   */
  enroll: async (): Promise<boolean> => {
    try {
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: generateChallenge(),
        rp: {
          name: RP_NAME,
          id: RP_ID,
        },
        user: {
          id: userId,
          name: 'max-user',
          displayName: 'Max App User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Use built-in biometric
          userVerification: 'required',        // Must verify identity (fingerprint/face)
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none', // We don't need attestation for local auth
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential | null;

      if (!credential) {
        console.warn('[BiometricManager] No credential returned from create()');
        return false;
      }

      // Store the credential ID for future authentication
      const credentialId = bufferToBase64url(credential.rawId);
      await storageManager.setItem(BIOMETRIC_CREDENTIAL_KEY, credentialId);
      await storageManager.setItem(BIOMETRIC_ENABLED_KEY, 'true');

      console.log('[BiometricManager] Biometric enrollment successful');
      return true;
    } catch (error: any) {
      // User cancelled or hardware error
      if (error.name === 'NotAllowedError') {
        console.log('[BiometricManager] User cancelled biometric enrollment');
      } else {
        console.warn('[BiometricManager] Biometric enrollment failed:', error);
      }
      return false;
    }
  },

  /**
   * Authenticates the user using their registered biometric credential.
   *
   * @returns true if authentication succeeded, false otherwise.
   */
  authenticate: async (): Promise<boolean> => {
    try {
      const credentialId = await storageManager.getItem(BIOMETRIC_CREDENTIAL_KEY);
      if (!credentialId) {
        console.warn('[BiometricManager] No stored credential ID found');
        return false;
      }

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: generateChallenge(),
        rpId: RP_ID,
        allowCredentials: [
          {
            id: base64urlToBuffer(credentialId),
            type: 'public-key',
            transports: ['internal'], // Platform authenticator
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential | null;

      if (!assertion) {
        console.warn('[BiometricManager] No assertion returned from get()');
        return false;
      }

      console.log('[BiometricManager] Biometric authentication successful');
      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        console.log('[BiometricManager] User cancelled biometric authentication');
      } else {
        console.warn('[BiometricManager] Biometric authentication failed:', error);
      }
      return false;
    }
  },

  /**
   * Disables biometric authentication by clearing stored credentials.
   */
  disable: async (): Promise<void> => {
    await storageManager.removeItem(BIOMETRIC_CREDENTIAL_KEY);
    await storageManager.removeItem(BIOMETRIC_ENABLED_KEY);
    console.log('[BiometricManager] Biometric disabled');
  },
};
