import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import { MockBlockchain } from "../client/src/lib/mock-blockchain";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Get all documents for a user
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const documents = await storage.getDocumentsForUser(req.user.id);
    res.json(documents);
  });

  // Get a specific document by hash
  app.get("/api/documents/:hash", async (req, res) => {
    const document = await storage.getDocumentByHash(req.params.hash);
    if (!document) return res.status(404).send("Document not found");
    res.json(document);
  });

  // Upload a new document
  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const document = insertDocumentSchema.parse({
        ...req.body,
        userId: req.user.id,
        documentType: req.body.documentType || "identity",
        documentData: req.body.documentData || "mock_data",
      });

      const blockchain = MockBlockchain.getInstance();
      const savedDoc = await storage.createDocument(document);
      const hash = blockchain.addBlock(savedDoc);
      
      await storage.updateDocumentHash(savedDoc.id, hash);
      const updatedDoc = await storage.getDocument(savedDoc.id);
      
      res.status(201).json(updatedDoc);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  // Verify a document's authenticity
  app.post("/api/documents/:id/verify", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.sendStatus(401);
    }

    const document = await storage.getDocument(parseInt(req.params.id));
    if (!document) return res.status(404).send("Document not found");

    await storage.verifyDocument(document.id);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
