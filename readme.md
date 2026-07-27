# Kusco: Clinician AI Assistant & Patient Management (MVP)

Kusco is a secure, cloud-based clinician AI assistant and patient management portal ported from a local Electron/Flask SQLite setup to Next.js App Router, Neon Serverless PostgreSQL, Stripe monthly subscriptions, and Google Gemini AI.

This MVP is designed for healthcare professionals to manage patients, log structured treatment goals and standardized health surveys (GAD-7, PHQ-9), converse with an AI assistant loaded with patient context, and instantly generate clinical SOAP, BIRP, DAP, and Basic therapy notes.

---

## 🛠️ Target Tech Stack

- **Frontend & Routing**: [Next.js (App Router)](https://nextjs.org/) using TypeScript.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) for a modern, responsive clinician dashboard.
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech/) accessed via [Drizzle ORM](https://orm.drizzle.team/).
- **Billing & Subscriptions**: [Stripe Subscriptions](https://stripe.com/) charging a monthly clinician pro fee ($29/month).
- **AI Engine**: [Google Gemini (gemini-2.0-flash)](https://ai.google.dev/) via the unified `@google/genai` Node.js SDK.
- **Code Quality**: [Biome](https://biomejs.dev/) for 100% formatted, linted files.
- **Testing**: [Vitest](https://vitest.dev/) for mock unit/API tests (exceeding 70% coverage target) and [Playwright](https://playwright.dev/) for end-to-end user flows.

---

## 🏗️ Neon Database Schema (Scoped with `kusco_` prefix)

Because Kusco shares a database with other portfolio applications, all tables are isolated using the prefix `kusco_`:

- `kusco_clinicians`: Clinician profiles containing hashed passwords, Stripe customer/subscription statuses, and subscription tiers.
- `kusco_patients`: Patient profiles belonging to specific clinicians.
- `kusco_chat_history`: Conversation logs between the clinician and the patient-specific AI.
- `kusco_notes`: Saved clinical notes (SOAP, BIRP, DAP, Basic).
- `kusco_goals`: Treatment goals with target values, metrics, and deadlines.
- `kusco_surveys`: Standardized survey records (GAD-7, PHQ-9, C-SSRS).
- `kusco_keywords`: Automatically extracted session keywords and frequencies.
- `kusco_diagnoses`: Tracked clinical diagnostic matches and matching evidence.

---

## 🔌 API Contracts

### 🔑 Authentication
- `POST /api/auth/signup`: Registers a clinician, creates their Stripe customer record, and sets their JWT session cookie.
- `POST /api/auth/login`: Validates credentials and issues a secure JWT cookie session.
- `POST /api/auth/logout`: Clears session cookies.

### 💳 Billing & Stripe
- `POST /api/billing/checkout`: Starts a Stripe checkout session for a `$29/month` "Kusco Clinician AI Assistant" subscription.
- `POST /api/webhook/stripe`: Handles incoming subscription events (`created`, `updated`, `deleted`) to update the clinician's `subscriptionStatus` value (`active` or `inactive`).

### 📂 Patients & Clinical Tools
- `GET /api/patients`: Lists all patients for the active session clinician.
- `POST /api/patients`: Registers a new patient.
- `GET /api/patients/[id]/chat`: Fetches conversation history.
- `POST /api/patients/[id]/chat`: Submits user transcript/question, calls Gemini for an AI response, saves the thread, and updates keywords.
- `GET /api/patients/[id]/notes`: Lists saved notes.
- `POST /api/patients/[id]/notes`: Handles note generation (`action: "generate"`) via Gemini, or saves a draft (`action: "save"`).
- `GET/POST /api/patients/[id]/goals`: Manages patient treatment goals.
- `GET/POST /api/patients/[id]/surveys`: Log PHQ-9 / GAD-7 scores.
- `GET /api/patients/[id]/stats`: Extracts session keywords and clinical diagnostics matching patient records.

---

## 🚀 Getting Started Locally

### 1. Configure Environment Variables
Create a `.env.local` file at the root of the project:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-lucky-night-anrk5kgx.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_secure_jwt_random_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=your_gemini_api_key_from_google_studio
NEXT_PUBLIC_BASE_URL=http://localhost:3006
```

### 2. Install Dependencies & Build
Install and run migrations to setup database tables:

```bash
pnpm install
pnpm db:push
```

### 3. Run Development Server
Start the server locally on port 3006:

```bash
pnpm dev --port 3006
```

---

## 🧪 Testing and Quality Control

### Unit & Integration Testing (Vitest)
Unit tests mock database transactions, Stripe endpoints, and auth helper utilities to test API routes:
```bash
pnpm test
```

### End-to-End Testing (Playwright)
Validates login flows, redirects, and rendering layout of the landing portal on port 3006:
```bash
pnpm test:e2e
```

### Formatting & Linting (Biome)
Ensures full code compliance:
```bash
pnpm lint
pnpm format
```

---

## 🌐 Production Deployment (Vercel)

McMillan General Services uses pre-authenticated Vercel scopes:
1. **Link Project**: `vercel link --scope team_mW23sjMRrUIdEZ2Be7K73DWb`
2. **Add Env Vars**: `vercel env add <KEY> production`
3. **Deploy production**: `vercel deploy --prod`

All Stripe webhooks should point to `https://kusco.vercel.app/api/webhook/stripe`.
