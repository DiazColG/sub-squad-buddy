// PostHog Analytics Verification Script
// This script verifies that PostHog is correctly configured and sending events

console.log('🔍 PostHog Configuration Check');
console.log('================================');

// Check environment variables
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST;
const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED;

console.log('\n📋 Environment Variables:');
console.log(`  VITE_POSTHOG_KEY: ${posthogKey ? '✅ Set (phc_' + posthogKey.slice(4, 12) + '...)' : '❌ Not set'}`);
console.log(`  VITE_POSTHOG_HOST: ${posthogHost || '❌ Not set'}`);
console.log(`  VITE_ANALYTICS_ENABLED: ${analyticsEnabled || '❌ Not set'}`);

// Check PostHog initialization
if (typeof window !== 'undefined' && window.posthog) {
  console.log('\n✅ PostHog SDK loaded successfully');
  console.log(`   Instance: ${window.posthog.__loaded ? 'Initialized' : 'Not initialized'}`);
} else {
  console.log('\n❌ PostHog SDK not found');
}

console.log('\n📝 Test Events to Track:');
console.log('  1. Open browser console (F12)');
console.log('  2. Navigate to http://localhost:8080');
console.log('  3. Check for PostHog initialization messages');
console.log('  4. Try signup/login');
console.log('  5. Go to PostHog Dashboard → Live Events');
console.log('  6. You should see: $pageview, user_signed_up, user_logged_in');

console.log('\n🔗 PostHog Dashboard:');
console.log('   https://app.posthog.com/project/');

console.log('\n================================');
