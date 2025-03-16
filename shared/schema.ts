import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Remote desktop connections
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  connectionId: text("connection_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").default("New Connection"),
  password: text("password"),
  active: boolean("active").default(true),
  settings: text("settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const insertConnectionSchema = createInsertSchema(connections).pick({
  connectionId: true,
  userId: true,
  name: true,
  password: true,
  active: true,
  settings: true,
});

// White label configuration
export const whiteLabelConfig = pgTable("white_label_config", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  companyName: text("company_name").notNull(),
  primaryColor: text("primary_color").notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWhiteLabelConfigSchema = createInsertSchema(whiteLabelConfig).pick({
  userId: true,
  companyName: true,
  primaryColor: true,
  logoUrl: true,
});

// Types for use in the app
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type WhiteLabelConfig = typeof whiteLabelConfig.$inferSelect;
export type InsertWhiteLabelConfig = z.infer<typeof insertWhiteLabelConfigSchema>;
