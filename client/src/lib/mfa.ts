import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "./queryClient";

export class MFAService {
  private static instance: MFAService;
  
  private constructor() {}
  
  static getInstance(): MFAService {
    if (!MFAService.instance) {
      MFAService.instance = new MFAService();
    }
    return MFAService.instance;
  }

  async setupMFA(userId: number): Promise<{ secret: string; qrCode: string }> {
    try {
      const response = await apiRequest("POST", "/api/mfa/setup", { userId });
      const data = await response.json();
      return {
        secret: data.secret,
        qrCode: `otpauth://totp/DigitalIdentity:${userId}?secret=${data.secret}&issuer=DigitalIdentity`
      };
    } catch (error) {
      console.error("Failed to setup MFA:", error);
      throw error;
    }
  }

  async verifyMFA(token: string): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/mfa/verify", { token });
      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error("Failed to verify MFA:", error);
      return false;
    }
  }

  async disableMFA(): Promise<boolean> {
    try {
      await apiRequest("POST", "/api/mfa/disable");
      return true;
    } catch (error) {
      console.error("Failed to disable MFA:", error);
      return false;
    }
  }
}

export function useMFA() {
  const mfa = MFAService.getInstance();
  return {
    setupMFA: mfa.setupMFA.bind(mfa),
    verifyMFA: mfa.verifyMFA.bind(mfa),
    disableMFA: mfa.disableMFA.bind(mfa),
  };
}
