export class BiometricService {
  private static instance: BiometricService;

  private constructor() {}

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  async isSupported(): Promise<boolean> {
    return window.PublicKeyCredential !== undefined;
  }

  async register(username: string): Promise<boolean> {
    try {
      // Generate random buffer for challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const createCredentialOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Digital Identity Platform",
          id: window.location.hostname,
        },
        user: {
          id: Uint8Array.from(username, c => c.charCodeAt(0)),
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "direct",
      };

      const credential = await navigator.credentials.create({
        publicKey: createCredentialOptions,
      }) as PublicKeyCredential;

      return credential !== null;
    } catch (error) {
      console.error('Failed to register biometric:', error);
      return false;
    }
  }

  async verify(username: string): Promise<boolean> {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const getCredentialOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: getCredentialOptions,
      });

      return assertion !== null;
    } catch (error) {
      console.error('Failed to verify biometric:', error);
      return false;
    }
  }
}

export function useBiometric() {
  const biometric = BiometricService.getInstance();
  return {
    isSupported: biometric.isSupported.bind(biometric),
    register: biometric.register.bind(biometric),
    verify: biometric.verify.bind(biometric),
  };
}
