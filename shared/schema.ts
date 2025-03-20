import { pgTable, text, serial, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  languages: text("languages").array().notNull(),
});

export const identityDocuments = pgTable("identity_documents", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  documentType: text("document_type").notNull(),
  documentData: text("document_data").notNull(),
  verified: boolean("verified").notNull().default(false),
  blockchainHash: text("blockchain_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
});

export const insertDocumentSchema = createInsertSchema(identityDocuments);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type IdentityDocument = typeof identityDocuments.$inferSelect;
