# 🚀 Email System Deployment Guide

Complete guide to deploy the email system to production.

## Prerequisites

✅ Resend account created (3,000 emails/month free)  
✅ Resend API key obtained  
✅ Domain verified in Resend (optional but recommended)  
✅ Supabase CLI installed (`npm install -g supabase`)

---

## Phase 1: Configure Environment Variables

### 1.1 Local Development (.env.local)
```bash
VITE_RESEND_API_KEY=re_YourResendApiKey_Here
```

### 1.2 Vercel Production
```bash
# Add via Vercel Dashboard:
# Settings → Environment Variables → Add

VITE_RESEND_API_KEY=re_YourResendApiKey_Here
```

---

## Phase 2: Deploy Supabase Edge Functions

### 2.1 Login to Supabase
```bash
supabase login
```

### 2.2 Link to your project
```bash
supabase link --project-ref djaxvumqpzjfctklcoaf
```

### 2.3 Set Resend API Key as Secret
```bash
supabase secrets set RESEND_API_KEY=re_YourResendApiKey_Here
```

### 2.4 Deploy Functions
```bash
# Deploy welcome email function
supabase functions deploy send-welcome-email

# Deploy password reset email function
supabase functions deploy send-password-reset-email
```

### 2.5 Verify Deployment
```bash
supabase functions list
```

You should see:
- ✅ send-welcome-email (deployed)
- ✅ send-password-reset-email (deployed)

---

## Phase 3: Test Email Flows

### 3.1 Test Welcome Email
Create a new test account and verify:
1. Welcome email arrives within 30 seconds
2. Email styling looks professional
3. "Empezar ahora" button works
4. Email appears in Resend dashboard

### 3.2 Test Password Reset Email
Request password reset and verify:
1. Reset email arrives within 30 seconds
2. Reset link works (1 hour expiration)
3. Security warnings display correctly
4. Email appears in Resend dashboard

### 3.3 Check Resend Dashboard
Navigate to: https://resend.com/emails
- View sent emails
- Check delivery status
- Monitor bounce/spam rates

---

## Phase 4: Production Verification

### 4.1 Verify Environment Variables in Vercel
```bash
# Check that VITE_RESEND_API_KEY is set
vercel env ls
```

### 4.2 Monitor Email Service Logs
```bash
# View Supabase function logs
supabase functions logs send-welcome-email
supabase functions logs send-password-reset-email
```

### 4.3 Test in Production
1. Visit: https://compounding.vercel.app
2. Create a test account with real email
3. Verify welcome email arrives
4. Test password reset flow
5. Check all links work correctly

---

## Phase 5: Optional - Setup Custom Domain

### 5.1 Add Domain in Resend
1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `compounding.app`)
4. Add DNS records (provided by Resend)

### 5.2 Update FROM_EMAIL
Once domain verified, update in:
- `src/lib/emailService.ts`
- `supabase/functions/send-welcome-email/index.ts`
- `supabase/functions/send-password-reset-email/index.ts`

Change from:
```typescript
const FROM_EMAIL = 'Compounding <onboarding@resend.dev>';
```

To:
```typescript
const FROM_EMAIL = 'Compounding <hello@compounding.app>';
```

Redeploy functions:
```bash
supabase functions deploy send-welcome-email
supabase functions deploy send-password-reset-email
```

---

## Troubleshooting

### Email not arriving?
1. Check Resend dashboard for delivery status
2. Check spam folder
3. Verify RESEND_API_KEY is set correctly
4. Check Supabase function logs for errors

### Function deployment fails?
1. Ensure Supabase CLI is latest version: `npm install -g supabase@latest`
2. Verify you're linked to correct project: `supabase link --project-ref djaxvumqpzjfctklcoaf`
3. Check function syntax for errors

### Emails going to spam?
1. Setup SPF, DKIM, DMARC records (Resend provides these)
2. Use verified custom domain instead of resend.dev
3. Keep email content professional and non-promotional
4. Maintain low bounce/complaint rates

---

## Cost Monitoring

### Resend Free Tier Limits:
- ✅ 3,000 emails per month
- ✅ 100 emails per day
- ✅ Unlimited domains

### Expected Usage (per month):
- **Welcome Emails**: ~50-200 (depends on signups)
- **Password Reset**: ~20-50
- **Monthly Insights**: ~100-500 (only opt-in users)

**Total Estimated**: 170-750 emails/month (well within free tier)

---

## Monitoring & Analytics

### Resend Dashboard Metrics:
- Delivery rate (should be >95%)
- Open rate (industry avg: 20-30%)
- Click rate (industry avg: 2-5%)
- Bounce rate (should be <5%)
- Spam complaints (should be <0.1%)

### Supabase Logs:
```bash
# Monitor real-time logs
supabase functions logs send-welcome-email --tail
```

---

## Next Steps

After deployment:
1. ✅ Test all email flows thoroughly
2. ✅ Monitor first week of production emails
3. ⏳ Implement Monthly Insights (Phase 8 from master plan)
4. ⏳ Build User Preferences UI
5. ⏳ Setup email analytics tracking

---

## Support

- **Resend Docs**: https://resend.com/docs
- **Supabase Functions**: https://supabase.com/docs/guides/functions
- **Project Issues**: Create issue in GitHub repo
