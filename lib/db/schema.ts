import {
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const clinicians = pgTable("kusco_clinicians", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const patients = pgTable("kusco_patients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clinicianId: integer("clinician_id")
    .references(() => clinicians.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatHistory = pgTable("kusco_chat_history", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  userMessage: text("user_message").notNull(),
  modelResponse: text("model_response").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const notes = pgTable("kusco_notes", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  noteType: varchar("note_type", { length: 50 }).notNull(), // SOAP, BIRP, DAP, Basic
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const surveys = pgTable("kusco_surveys", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  surveyType: varchar("survey_type", { length: 100 }).notNull(),
  responses: jsonb("responses").notNull(),
  totalScore: integer("total_score").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

export const keywords = pgTable("kusco_keywords", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  keyword: varchar("keyword", { length: 100 }).notNull(),
  frequency: integer("frequency").default(0).notNull(),
  contexts: jsonb("contexts"),
  category: varchar("category", { length: 100 }),
  lastMentioned: timestamp("last_mentioned"),
});

export const diagnoses = pgTable("kusco_diagnoses", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  diagnosis: text("diagnosis").notNull(),
  likelihood: real("likelihood"),
  evidence: text("evidence"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const goals = pgTable("kusco_goals", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  metric: text("metric"),
  targetValue: varchar("target_value", { length: 255 }),
  currentValue: varchar("current_value", { length: 255 }),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completed: integer("completed").default(0).notNull(), // 0 = false, 1 = true
});

export const resources = pgTable("kusco_resources", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }),
  content: text("content"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
