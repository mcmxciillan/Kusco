CREATE TABLE "kusco_chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"user_message" text NOT NULL,
	"model_response" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kusco_clinicians" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"subscription_status" varchar(50) DEFAULT 'inactive' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kusco_clinicians_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "kusco_diagnoses" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"diagnosis" text NOT NULL,
	"likelihood" real,
	"evidence" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kusco_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"description" text NOT NULL,
	"metric" text,
	"target_value" varchar(255),
	"current_value" varchar(255),
	"deadline" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kusco_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"keyword" varchar(100) NOT NULL,
	"frequency" integer DEFAULT 0 NOT NULL,
	"contexts" jsonb,
	"category" varchar(100),
	"last_mentioned" timestamp
);
--> statement-breakpoint
CREATE TABLE "kusco_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"note_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kusco_patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"clinician_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kusco_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar(100),
	"content" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kusco_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"survey_type" varchar(100) NOT NULL,
	"responses" jsonb NOT NULL,
	"total_score" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "kusco_chat_history" ADD CONSTRAINT "kusco_chat_history_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_diagnoses" ADD CONSTRAINT "kusco_diagnoses_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_goals" ADD CONSTRAINT "kusco_goals_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_keywords" ADD CONSTRAINT "kusco_keywords_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_notes" ADD CONSTRAINT "kusco_notes_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_patients" ADD CONSTRAINT "kusco_patients_clinician_id_kusco_clinicians_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."kusco_clinicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_resources" ADD CONSTRAINT "kusco_resources_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kusco_surveys" ADD CONSTRAINT "kusco_surveys_patient_id_kusco_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."kusco_patients"("id") ON DELETE cascade ON UPDATE no action;