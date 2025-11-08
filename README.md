# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8c51cfc0-3390-423d-bfbb-3c440e7b1520

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8c51cfc0-3390-423d-bfbb-3c440e7b1520) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+ & npm
- Git

### Setup:

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create .env.local file with:
VITE_POSTHOG_KEY=your_posthog_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_ANALYTICS_ENABLED=true

# 4. Start development server
npm run dev
```

### 📊 Analytics Setup:
See: `/docs/QUICK_SETUP.md` for PostHog configuration (5 minutes)

### 🔐 Authentication:
- Local development uses Supabase test environment
- Production uses Google OAuth + email/password
- See: `/docs/AUTH_IMPROVEMENTS_SUMMARY.md`

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack

### Core:
- **Frontend:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn-ui components
- **Backend:** Supabase (Auth, PostgREST, RLS)
- **Data Fetching:** React Query + Custom hooks
- **Routing:** React Router v6

### Features:
- **Authentication:** 
  - Email/Password with validation
  - Google OAuth integration
  - Password recovery flow
- **Analytics:** PostHog (events + session replay)
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation

### Infrastructure:
- **Hosting:** Vercel (SPA configuration)
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Analytics:** PostHog Cloud

### Upcoming:
- Custom email system (Resend + React Email)

## 📚 Documentation

- **[Quick Setup Guide](/docs/QUICK_SETUP.md)** - 5-minute analytics setup
- **[Analytics & Email Setup](/docs/ANALYTICS_EMAIL_SETUP.md)** - Comprehensive guide
- **[Auth Improvements](/docs/AUTH_IMPROVEMENTS_SUMMARY.md)** - OAuth & password recovery
- **[Google OAuth Setup](/docs/SUPABASE_GOOGLE_OAUTH_SETUP.md)** - Step-by-step configuration
- **[Analytics Implementation](/docs/releases/ANALYTICS_IMPLEMENTATION.md)** - Technical details

## 🔧 Development

### Supabase & Types

Generate updated types (requires Supabase CLI + SUPABASE_PROJECT_ID):

```sh
export SUPABASE_PROJECT_ID=<project-id>
npm run gen:types
```

This overwrites `src/integrations/supabase/types.ts`. After regenerating:
- Review discrepancies with manual types
- Commit controlled changes for easy diff

### Available Scripts:

```sh
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run gen:types    # Generate Supabase types
```

## 🚀 Deployment

### Vercel (Current):
1. Push to main branch
2. Vercel auto-deploys
3. Add environment variables in Vercel Dashboard

**Required Environment Variables:**
```
VITE_POSTHOG_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_ANALYTICS_ENABLED=true
```

### Custom Domain:
Navigate to Project > Settings > Domains in Lovable
Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain)

## 📊 Features

### Current:
- ✅ Multi-currency expense tracking
- ✅ Recurring expenses & subscriptions
- ✅ Budget management
- ✅ Income tracking
- ✅ FIRE calculator
- ✅ Housing services management
- ✅ Google OAuth login
- ✅ Password recovery
- ✅ Analytics & session replay

### In Progress:
- 🔄 Custom email templates
- 🔄 Advanced analytics dashboards

## 🔐 Security

- Environment variables for all secrets
- Supabase RLS (Row Level Security)
- Google OAuth 2.0
- Password strength validation
- HTTPS only in production

## 📝 License

[Your License Here]
