import CryptoJS from "crypto-js";
import { IdentityDocument } from "@shared/schema";

export class MockBlockchain {
  private static instance: MockBlockchain;
  private chain: { hash: string; data: string; timestamp: number }[] = [];

  private constructor() {
    this.chain = [{
      hash: "0000",
      data: "genesis",
      timestamp: Date.now()
    }];
  }

  static getInstance(): MockBlockchain {
    if (!MockBlockchain.instance) {
      MockBlockchain.instance = new MockBlockchain();
    }
    return MockBlockchain.instance;
  }

  addBlock(document: IdentityDocument): string {
    const previousBlock = this.chain[this.chain.length - 1];
    const timestamp = Date.now();
    const data = JSON.stringify(document);
    const hash = CryptoJS.SHA256(previousBlock.hash + timestamp + data).toString();

    this.chain.push({ hash, data, timestamp });
    return hash;
  }

  verifyDocument(hash: string): boolean {
    return this.chain.some(block => block.hash === hash);
  }
}