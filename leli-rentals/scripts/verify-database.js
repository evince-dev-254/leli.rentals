#!/usr/bin/env node

/**
 * Database Verification Script
 * 
 * This script helps verify that Firestore indexes are working correctly
 * by testing common queries used in the application.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');

// Firebase configuration (you'll need to add your config here)
const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from Firebase Console > Project Settings > General > Your apps
};

console.log('🔍 Verifying database indexes...\n');

// Initialize Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase');
  console.error('Please add your Firebase configuration to this script');
  console.error('Error:', error.message);
  process.exit(1);
}

// Test queries that should use indexes
const testQueries = [
  {
    name: 'Saved Bookings by User',
    collection: 'savedBookings',
    query: () => query(
      collection(db, 'savedBookings'),
      where('userId', '==', 'test-user-id'),
      orderBy('savedAt', 'desc'),
      limit(10)
    )
  },
  {
    name: 'Saved Bookings by Category',
    collection: 'savedBookings',
    query: () => query(
      collection(db, 'savedBookings'),
      where('userId', '==', 'test-user-id'),
      where('listingCategory', '==', 'vehicles'),
      limit(10)
    )
  },
  {
    name: 'User Favorites',
    collection: 'favorites',
    query: () => query(
      collection(db, 'favorites'),
      where('userId', '==', 'test-user-id'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
  },
  {
    name: 'User Bookings',
    collection: 'bookings',
    query: () => query(
      collection(db, 'bookings'),
      where('userId', '==', 'test-user-id'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
  },
  {
    name: 'Listings by Category',
    collection: 'listings',
    query: () => query(
      collection(db, 'listings'),
      where('category', '==', 'vehicles'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
  },
  {
    name: 'Available Listings',
    collection: 'listings',
    query: () => query(
      collection(db, 'listings'),
      where('available', '==', true),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
  },
  {
    name: 'User Interactions',
    collection: 'user_interactions',
    query: () => query(
      collection(db, 'user_interactions'),
      where('userId', '==', 'test-user-id'),
      where('interactionType', '==', 'like'),
      orderBy('timestamp', 'desc'),
      limit(10)
    )
  },
  {
    name: 'User Reviews',
    collection: 'userReviews',
    query: () => query(
      collection(db, 'userReviews'),
      where('revieweeId', '==', 'test-user-id'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
  },
  {
    name: 'User Notifications',
    collection: 'notifications',
    query: () => query(
      collection(db, 'notifications'),
      where('userId', '==', 'test-user-id'),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
  }
];

// Run test queries
async function runTests() {
  let passedTests = 0;
  let totalTests = testQueries.length;

  for (const test of testQueries) {
    try {
      console.log(`🧪 Testing: ${test.name}...`);
      
      const startTime = Date.now();
      const querySnapshot = await getDocs(test.query());
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      const docCount = querySnapshot.size;
      
      console.log(`   ✅ Query executed successfully`);
      console.log(`   📊 Found ${docCount} documents in ${duration}ms`);
      
      if (duration > 1000) {
        console.log(`   ⚠️  Query took longer than expected (${duration}ms)`);
      }
      
      passedTests++;
    } catch (error) {
      console.log(`   ❌ Query failed: ${error.message}`);
      
      if (error.message.includes('index')) {
        console.log(`   💡 This might indicate a missing index`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('📋 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your indexes are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the Firebase Console for index build status.');
    console.log('   Indexes may still be building - this can take several minutes.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});
