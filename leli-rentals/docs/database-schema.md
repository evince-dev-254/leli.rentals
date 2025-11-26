# Database Schema - Leli Rentals

This document outlines the database schema for the Leli Rentals platform, including the onboarding system and user data management.

## Firebase Collections

### 1. userOnboarding
Stores user onboarding data and progress.

```typescript
interface UserOnboardingData {
  id: string                    // User ID (same as auth UID)
  userId: string                // User ID reference
  userType: 'renter' | 'owner' | 'both'
  interests: string[]           // Selected category interests
  location: string              // User's city/location
  phone: string                 // Phone number
  bio?: string                  // Optional user bio
  verificationMethod: 'phone' | 'email' | 'id'
  verificationStatus: 'pending' | 'verified' | 'failed'
  agreedToTerms: boolean
  onboardingCompleted: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Example Document:**
```json
{
  "id": "user123",
  "userId": "user123",
  "userType": "both",
  "interests": ["vehicles", "electronics", "equipment"],
  "location": "Nairobi",
  "phone": "+254700000000",
  "bio": "I love sharing economy and sustainable living",
  "verificationMethod": "phone",
  "verificationStatus": "verified",
  "agreedToTerms": true,
  "onboardingCompleted": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

### 2. userPreferences
Stores user preferences and settings.

```typescript
interface UserPreferences {
  id: string                    // User ID
  userId: string                // User ID reference
  preferredCategories: string[] // User's preferred rental categories
  notificationSettings: {
    email: boolean
    sms: boolean
    push: boolean
    marketing: boolean
  }
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showPhone: boolean
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Example Document:**
```json
{
  "id": "user123",
  "userId": "user123",
  "preferredCategories": ["vehicles", "electronics"],
  "notificationSettings": {
    "email": true,
    "sms": true,
    "push": true,
    "marketing": false
  },
  "privacySettings": {
    "profileVisibility": "public",
    "showEmail": false,
    "showPhone": false
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:45:00Z"
}
```

### 3. userVerifications
Stores user verification data and status.

```typescript
interface UserVerification {
  id: string                    // User ID
  userId: string                // User ID reference
  method: 'phone' | 'email' | 'id'
  status: 'pending' | 'verified' | 'failed'
  verificationCode?: string     // For phone/email verification
  verificationToken?: string   // For ID verification
  attempts: number             // Number of verification attempts
  lastAttemptAt: Timestamp
  verifiedAt?: Timestamp       // When verification was completed
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Example Document:**
```json
{
  "id": "user123",
  "userId": "user123",
  "method": "phone",
  "status": "verified",
  "verificationCode": "123456",
  "attempts": 1,
  "lastAttemptAt": "2024-01-15T10:35:00Z",
  "verifiedAt": "2024-01-15T10:35:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### 4. userProfiles (Existing)
Extended to include onboarding data.

```typescript
interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  phoneNumber?: string
  profilePictureUrl?: string
  userType: 'renter' | 'owner' | 'both'  // Added from onboarding
  createdAt: Timestamp
  updatedAt: Timestamp
  isEmailVerified: boolean
  provider: 'email' | 'google'
}
```

## API Endpoints

### 1. `/api/onboarding`

#### GET - Retrieve onboarding data
```
GET /api/onboarding?userId={userId}
```

#### POST - Save onboarding step data
```
POST /api/onboarding
Content-Type: application/json

{
  "userId": "user123",
  "step": 1,
  "userType": "renter"
}
```

#### PUT - Complete onboarding
```
PUT /api/onboarding
Content-Type: application/json

{
  "userId": "user123",
  "userType": "renter",
  "interests": ["vehicles", "electronics"],
  "location": "Nairobi",
  "phone": "+254700000000",
  "verificationMethod": "phone",
  "agreedToTerms": true
}
```

### 2. `/api/user-preferences`

#### GET - Retrieve user preferences
```
GET /api/user-preferences?userId={userId}
```

#### POST - Save user preferences
```
POST /api/user-preferences
Content-Type: application/json

{
  "userId": "user123",
  "preferredCategories": ["vehicles", "electronics"],
  "notificationSettings": {
    "email": true,
    "sms": true,
    "push": true,
    "marketing": false
  },
  "privacySettings": {
    "profileVisibility": "public",
    "showEmail": false,
    "showPhone": false
  }
}
```

### 3. `/api/verification`

#### POST - Save verification data
```
POST /api/verification
Content-Type: application/json

{
  "userId": "user123",
  "method": "phone"
}
```

#### PUT - Verify code
```
PUT /api/verification
Content-Type: application/json

{
  "userId": "user123",
  "code": "123456"
}
```

#### GET - Get verification status
```
GET /api/verification?userId={userId}
```

## Data Flow

### Onboarding Process
1. User selects user type → Save to `userOnboarding`
2. User selects interests → Update `userOnboarding`
3. User enters profile info → Update `userOnboarding`
4. User chooses verification method → Save to `userVerifications`
5. User agrees to terms → Complete onboarding, update `userProfiles`

### Data Relationships
- `userOnboarding.userId` → `userProfiles.id`
- `userPreferences.userId` → `userProfiles.id`
- `userVerifications.userId` → `userProfiles.id`

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User onboarding data
    match /userOnboarding/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User preferences
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User verifications
    match /userVerifications/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User profiles
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Validation Rules

### Client-Side Validation
- User type must be one of: 'renter', 'owner', 'both'
- Interests must be an array of valid category IDs
- Location must be a non-empty string
- Phone must be a valid phone number format
- Verification method must be one of: 'phone', 'email', 'id'
- Terms agreement must be true

### Server-Side Validation
- All required fields must be present
- Data types must match expected interfaces
- User must be authenticated
- Rate limiting on verification attempts (max 3 attempts)

## Error Handling

### Common Error Responses
```json
{
  "error": "User ID is required",
  "status": 400
}
```

```json
{
  "error": "Invalid verification method",
  "status": 400
}
```

```json
{
  "error": "Too many verification attempts",
  "status": 429
}
```

## Performance Considerations

### Indexing
- Index on `userId` for all collections
- Index on `verificationStatus` for userVerifications
- Index on `onboardingCompleted` for userOnboarding

### Caching
- Cache user preferences in client state
- Cache onboarding progress for quick access
- Implement offline support for form data

### Data Cleanup
- Remove verification codes after successful verification
- Archive old verification attempts
- Clean up incomplete onboarding data after 30 days
