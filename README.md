# Community Platform

A production-quality monorepo with two web apps (Community + Creator Dashboard), sharing one backend API and one PostgreSQL database. Strict role-based access control ensures fans never see financial data. Creators get full financial visibility in the dashboard only.

## Architecture

```
community-platform/
├── apps/
│   ├── community-web/     # Public community app (Next.js 15, App Router)
│   ├── dashboard-web/     # Creator dashboard app (Next.js 15, App Router)
│   └── api/               # Backend API (Next.js route handlers)
├── packages/
│   ├── ui/                # Shared UI component library (28 components)
│   ├── database/          # Prisma schema & client (17 models, 8 enums)
│   ├── types/             # Shared TypeScript types
│   ├── validators/        # Shared Zod validation schemas
│   └── config/            # Shared ESLint, TypeScript, Tailwind configs
└── scripts/
    └── check-banned-words.js  # Linter for financial language compliance
```

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript (strict mode)
- **Monorepo:** Turborepo + pnpm workspaces
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL via Supabase + Prisma ORM
- **Auth:** Supabase Auth (email + OAuth)
- **Payments:** Stripe Checkout + Webhooks
- **Rate Limiting:** Upstash Redis (sliding window, 60 req/min)
- **Validation:** Zod
- **Testing:** Vitest + v8 coverage
- **CI:** GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/raphalbongso/community-platform.git
cd community-platform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase, Stripe, and Upstash credentials

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed demo data
pnpm db:seed

# Start all apps in development
pnpm dev
```

### App URLs (development)

| App | URL | Description |
|-----|-----|-------------|
| Community Web | http://localhost:3000 | Public community app |
| Dashboard Web | http://localhost:3001 | Creator dashboard |
| API | http://localhost:3002 | Backend API |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `NEXT_PUBLIC_APP_URL` | Community web app URL |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard web app URL |
| `NEXT_PUBLIC_API_URL` | API URL |
| `RESEND_API_KEY` | Resend email API key |
| `WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID (stub) |

## Available Scripts

```bash
pnpm dev            # Start all apps in development mode
pnpm build          # Build all apps and packages
pnpm test           # Run all tests
pnpm lint           # Lint all packages
pnpm check-words    # Check for banned financial words in public code
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:seed        # Seed demo data
pnpm db:studio      # Open Prisma Studio
pnpm clean          # Clean build artifacts
```

## Database Schema

17 models across 4 domains:

**Core:** User, CreatorProfile, Initiative, Milestone, Post
**Forums:** Forum, Thread, Comment
**Financial (private):** SupportTier, Purchase, Entitlement, Token, AcquisitionOffer, OfferAcceptance, Snapshot, SnapshotRow
**Security:** AuditLog, Session

## Security Model

### Roles & Permissions

| Role | Permissions |
|------|------------|
| **FAN** | Read public content, manage own profile, support creators |
| **CREATOR** | All FAN permissions + dashboard access, content management, financial data |
| **ADMIN** | Full access to all resources |

### Data Sanitization

The `sanitizeForPublic()` middleware automatically strips sensitive fields from all public API responses:

- All `*Cents` fields (priceCents, amountCents, feeCents, netCents)
- `soldCount`, `acceptedQty`
- `providerRef`, `stripeCustomerId`, `stripeAccountId`

### Banned Words Enforcement

A CI linter scans all public-facing source code (community-web, UI package) for prohibited financial language: invest, returns, dividend, profit, yield, ROI, crowdfund, equity, backer, etc.

### Audit Logging

All financial data access is logged to the `audit_logs` table with actor, action, entity, IP, and user agent.

## API Endpoints

### Public (no auth, rate limited)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/feed` | Paginated feed posts |
| GET | `/api/public/creator/:username` | Creator profile |
| GET | `/api/public/initiative/:slug` | Initiative details |
| GET | `/api/public/forums` | Forum listing |
| GET | `/api/public/forums/:id/threads` | Forum threads |
| GET | `/api/public/threads/:id` | Thread with comments |
| GET | `/api/public/search` | Full-text search |

### App (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/app/support/checkout` | Create Stripe Checkout session |
| POST | `/api/app/support/webhook` | Stripe webhook handler |
| GET | `/api/app/entitlements` | User's entitlements |
| GET | `/api/app/offers/available` | Available offers |
| POST | `/api/app/offers/:id/accept` | Accept an offer |
| POST | `/api/app/posts/:id/like` | Like a post |
| POST | `/api/app/posts/:id/comment` | Comment on a post |

### Dashboard (creator + ownership required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/overview` | Financial stats overview |
| CRUD | `/api/dashboard/initiatives` | Initiative management |
| CRUD | `/api/dashboard/initiatives/:id/milestones` | Milestone management |
| CRUD | `/api/dashboard/initiatives/:id/tiers` | Tier management |
| CRUD | `/api/dashboard/posts` | Post management |
| GET | `/api/dashboard/sales-ledger` | Full financial ledger |
| GET | `/api/dashboard/supporters` | Supporter registry |
| CRUD | `/api/dashboard/snapshots` | Snapshot tool |
| GET | `/api/dashboard/snapshots/:id/export` | CSV export |
| CRUD | `/api/dashboard/offers` | Acquisition offers |
| GET | `/api/dashboard/offers/:id/acceptances` | Offer acceptances |

## Testing

```bash
# Run all tests
pnpm vitest run

# Run with coverage
pnpm vitest run --coverage

# Run specific test file
pnpm vitest run apps/api/src/middleware/__tests__/sanitizer.test.ts
```

**Test coverage areas:**
- Sanitization functions (strips all financial fields, handles deep nesting)
- RBAC permission checks (role-based access, admin bypass)
- Zod validators (all API input schemas)
- Integration tests (public API data flow never leaks financial data)

## CI Pipeline

GitHub Actions runs on every push and PR to main/master:

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Generate Prisma client
3. Run banned words check
4. Run unit tests (Vitest)
5. Type check (Turborepo dry-run build)
