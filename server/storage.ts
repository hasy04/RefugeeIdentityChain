import { users, identityDocuments, type User, type InsertUser, type IdentityDocument } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDocument(id: number): Promise<IdentityDocument | undefined>;
  getDocumentsForUser(userId: number): Promise<IdentityDocument[]>;
  getDocumentByHash(hash: string): Promise<IdentityDocument | undefined>;
  createDocument(document: Partial<IdentityDocument>): Promise<IdentityDocument>;
  updateDocumentHash(id: number, hash: string): Promise<void>;
  verifyDocument(id: number): Promise<void>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, IdentityDocument>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentDocId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    this.currentUserId = 1;
    this.currentDocId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async getDocument(id: number): Promise<IdentityDocument | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsForUser(userId: number): Promise<IdentityDocument[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async getDocumentByHash(hash: string): Promise<IdentityDocument | undefined> {
    return Array.from(this.documents.values()).find(
      (doc) => doc.blockchainHash === hash,
    );
  }

  async createDocument(document: Partial<IdentityDocument>): Promise<IdentityDocument> {
    const id = this.currentDocId++;
    const newDoc: IdentityDocument = {
      id,
      userId: document.userId!,
      documentType: document.documentType!,
      documentData: document.documentData!,
      verified: false,
      blockchainHash: null,
      createdAt: new Date(),
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }

  async updateDocumentHash(id: number, hash: string): Promise<void> {
    const doc = this.documents.get(id);
    if (doc) {
      doc.blockchainHash = hash;
      this.documents.set(id, doc);
    }
  }

  async verifyDocument(id: number): Promise<void> {
    const doc = this.documents.get(id);
    if (doc) {
      doc.verified = true;
      this.documents.set(id, doc);
    }
  }
}

export const storage = new MemStorage();
