CREATE TABLE "favorite" (
	"user_id" text NOT NULL,
	"tool_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "favorite_user_id_tool_id_pk" PRIMARY KEY("user_id","tool_id")
);
--> statement-breakpoint
CREATE TABLE "contact_message" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"user_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscription_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscription_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
ALTER TABLE "tool" ADD COLUMN "pricing" text;--> statement-breakpoint
ALTER TABLE "tool" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tool" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_tool_id_tool_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tool"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_subscription" ADD CONSTRAINT "newsletter_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorite_tool_id_idx" ON "favorite" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "newsletter_subscription_status_idx" ON "newsletter_subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tool_featured_idx" ON "tool" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "tool_pricing_idx" ON "tool" USING btree ("pricing");