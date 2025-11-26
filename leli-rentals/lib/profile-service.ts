// Firebase removed - all imports removed

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  website?: string
  createdAt: Date
  updatedAt: Date
  membershipType: 'free' | 'premium' | 'pro'
  isVerified: boolean
  rating: {
    average: number
    count: number
  }
  stats: {
    totalListings: number
    totalBookings: number
    totalEarnings: number
    responseRate: number
  }
}

export interface UserReview {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  revieweeId: string
  rating: number
  comment: string
  createdAt: Date
  listingId?: string
  bookingId?: string
}

export interface UserListing {
  id: string
  ownerId: string
  title: string
  description: string
  price: number
  category: string
  images: string[]
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  location: string
  availability: {
    startDate: Date
    endDate: Date
  }
  features: string[]
  createdAt: Date
  updatedAt: Date
  stats: {
    views: number
    bookings: number
    rating: number
    reviewCount: number
  }
}

export interface UserBooking {
  id: string
  userId: string
  listingId: string
  listingTitle: string
  listingImage: string
  ownerId: string
  ownerName: string
  startDate: Date
  endDate: Date
  totalPrice: number
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  review?: {
    rating: number
    comment: string
  }
}

export const profileService = {
  // Get user profile
  async getUserProfile(id: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, "userProfiles", id)
      const userSnap = await getDocs(query(collection(db, "userProfiles"), where("id", "==", id)))

      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data()
        return {
          ...userData,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          rating: userData.rating || { average: 0, count: 0 },
          stats: userData.stats || { totalListings: 0, totalBookings: 0, totalEarnings: 0, responseRate: 0 }
        } as UserProfile
      }

      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  },

  // Update user profile
  async updateUserProfile(id: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, "userProfiles", id)

      // Check if document exists first
      const docSnap = await getDoc(userRef)
      if (!docSnap.exists()) {
        // Create the document if it doesn't exist
        await setDoc(userRef, {
          id,
          ...profileData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      } else {
        // Update existing document
        await updateDoc(userRef, {
          ...profileData,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw new Error("Failed to update profile")
    }
  },

  // Convert file to base64 for fallback
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  },

  // Upload profile image using base64 encoding (works without Firebase Storage)
  async uploadProfileImage(id: string, file: File): Promise<string> {
    try {
      // Use base64 encoding to store image directly in Firestore
      console.log("Converting image to base64 for storage...")
      const base64Image = await this.fileToBase64(file)

      // Update profile with base64 image data
      await this.updateUserProfile(id, { avatar: base64Image })

      console.log("Profile image updated successfully with base64 encoding")
      return base64Image
    } catch (error) {
      console.error("Failed to upload profile image:", error)
      throw new Error(`Failed to upload image: ${(error as Error)?.message || 'Unknown error'}`)
    }
  },

  // Get user reviews
  async getUserReviews(id: string): Promise<UserReview[]> {
    try {
      const reviewsQuery = query(
        collection(db, "userReviews"),
        where("revieweeId", "==", id),
        limit(50)
      )
      const querySnapshot = await getDocs(reviewsQuery)

      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as UserReview[]
    } catch (error) {
      console.error("Error fetching user reviews:", error)
      return []
    }
  },

  // Add user review
  async addUserReview(review: Omit<UserReview, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, "userReviews"), {
        ...review,
        createdAt: serverTimestamp()
      })

      // Update user's average rating
      await this.updateUserRating(review.revieweeId)
    } catch (error) {
      console.error("Error adding user review:", error)
      throw new Error("Failed to add review")
    }
  },

  // Update user rating
  async updateUserRating(id: string): Promise<void> {
    try {
      const reviewsQuery = query(
        collection(db, "userReviews"),
        where("revieweeId", "==", id)
      )
      const querySnapshot = await getDocs(reviewsQuery)

      const reviews = querySnapshot.docs.map(doc => doc.data())
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

      await this.updateUserProfile(id, {
        rating: {
          average: Math.round(averageRating * 10) / 10,
          count: reviews.length
        }
      })
    } catch (error) {
      console.error("Error updating user rating:", error)
    }
  },

  // Get user listings
  async getUserListings(id: string): Promise<UserListing[]> {
    try {
      const listingsQuery = query(
        collection(db, "listings"),
        where("ownerId", "==", id)
      )
      const querySnapshot = await getDocs(listingsQuery)

      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          availability: {
            startDate: doc.data().availability?.startDate?.toDate() || new Date(),
            endDate: doc.data().availability?.endDate?.toDate() || new Date()
          }
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as UserListing[]
    } catch (error) {
      console.error("Error fetching user listings:", error)
      return []
    }
  },

  // Get user bookings
  async getUserBookings(id: string): Promise<UserBooking[]> {
    try {
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", id)
      )
      const querySnapshot = await getDocs(bookingsQuery)

      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate() || new Date()
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as UserBooking[]
    } catch (error) {
      console.error("Error fetching user bookings:", error)
      return []
    }
  },

  // Update user stats
  async updateUserStats(id: string): Promise<void> {
    try {
      const [listings, bookings] = await Promise.all([
        this.getUserListings(id),
        this.getUserBookings(id)
      ])

      const totalEarnings = bookings
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + booking.totalPrice, 0)

      const totalBookings = bookings.length
      const totalListings = listings.length
      const responseRate = totalBookings > 0 ?
        (bookings.filter(b => b.status !== 'pending').length / totalBookings) * 100 : 0

      await this.updateUserProfile(id, {
        stats: {
          totalListings,
          totalBookings,
          totalEarnings,
          responseRate: Math.round(responseRate)
        }
      })
    } catch (error) {
      console.error("Error updating user stats:", error)
    }
  },

  // Get membership info
  getMembershipInfo(profile: UserProfile) {
    const joinDate = profile.createdAt
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return {
      joinDate,
      membershipDuration: diffDays,
      membershipType: profile.membershipType || 'free',
      isVerified: profile.isVerified || false
    }
  },

  // Create default profile
  async createDefaultProfile(id: string, name: string, email: string): Promise<void> {
    try {
      const defaultProfile: Omit<UserProfile, 'id'> = {
        name,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        membershipType: 'free',
        isVerified: false,
        rating: { average: 0, count: 0 },
        stats: { totalListings: 0, totalBookings: 0, totalEarnings: 0, responseRate: 0 }
      }

      await setDoc(doc(db, "userProfiles", id), {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error("Error creating default profile:", error)
      throw new Error("Failed to create profile")
    }
  }
}

