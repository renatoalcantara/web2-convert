import { pgTable, uuid, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const conversionStatus = pgEnum("conversion_status", [
  "pending",
  "retro_streaming",
  "retro_done",
  "modern_streaming",
  "done",
  "error",
]);

export const conversions = pgTable("conversions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerCookie: text("owner_cookie").notNull(),
  imageUrl: text("image_url").notNull(),
  imageMime: text("image_mime").notNull(),
  retroHtml: text("retro_html"),
  modernHtml: text("modern_html"),
  status: conversionStatus("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  isPublic: boolean("is_public").notNull().default(true),
  title: text("title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Conversion = typeof conversions.$inferSelect;
export type NewConversion = typeof conversions.$inferInsert;
