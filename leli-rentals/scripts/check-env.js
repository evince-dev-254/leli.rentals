#!/usr/bin/env node

/**
 * Environment Variables Checker
 * This script checks if all required environment variables are set
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const placeholderValues = [
  'your_api_key_here',
  'your_project_id',
  'your_messaging_sender_id',
  'your_app_id'
];

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...\n');
  
  let allSet = true;
  const missing = [];
  const placeholder = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    
    if (!value) {
      missing.push(varName);
      allSet = false;
      console.log(`❌ ${varName}: Not set`);
    } else if (placeholderValues.some(placeholder => value.includes(placeholder))) {
      placeholder.push(varName);
      allSet = false;
      console.log(`⚠️  ${varName}: Contains placeholder value`);
    } else {
      console.log(`✅ ${varName}: Set`);
    }
  });
  
  console.log('\n📋 Summary:');
  
  if (missing.length > 0) {
    console.log(`❌ Missing variables: ${missing.join(', ')}`);
  }
  
  if (placeholder.length > 0) {
    console.log(`⚠️  Placeholder values: ${placeholder.join(', ')}`);
  }
  
  if (allSet) {
    console.log('✅ All environment variables are properly configured!');
    console.log('🚀 Ready for deployment!');
    process.exit(0);
  } else {
    console.log('\n❌ Environment variables need to be configured before deployment.');
    console.log('\n📖 To fix this:');
    console.log('1. Get your Firebase configuration from: https://console.firebase.google.com/');
    console.log('2. Update your .env.local file with actual values');
    console.log('3. For deployment, set these variables in your platform:');
    console.log('   - Vercel: Project Settings > Environment Variables');
    console.log('   - Render: Service Settings > Environment');
    console.log('\n📄 See DEPLOYMENT_GUIDE.md for detailed instructions.');
    process.exit(1);
  }
}

// Run the check
checkEnvironmentVariables();
