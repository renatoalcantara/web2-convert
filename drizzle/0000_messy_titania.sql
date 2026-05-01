CREATE TYPE "public"."conversion_status" AS ENUM('pending', 'retro_streaming', 'retro_done', 'modern_streaming', 'done', 'error');--> statement-breakpoint
CREATE TABLE "conversions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_cookie" text NOT NULL,
	"image_url" text NOT NULL,
	"image_mime" text NOT NULL,
	"retro_html" text,
	"modern_html" text,
	"status" "conversion_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
