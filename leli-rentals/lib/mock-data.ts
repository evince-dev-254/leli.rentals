// Centralized mock data for the application
export interface Listing {
  id: string
  title: string
  description: string
  price: number
  location: string
  rating: number
  reviews: number
  image: string
  amenities: string[]
  available: boolean
  category: string
  owner: {
    name: string
    avatar: string
    rating: number
    verified: boolean
  }
  images: string[]
  fullDescription: string
}

export const mockListings: Record<string, Listing[]> = {
  homes: [
    {
      id: "1",
      title: "Modern Downtown Apartment",
      description: "Stylish 2-bedroom apartment in the heart of the city with amazing views",
      fullDescription:
        "Experience luxury living in this beautifully designed 2-bedroom apartment located in the vibrant downtown area. The space features floor-to-ceiling windows offering breathtaking city views, modern appliances, and premium finishes throughout. Perfect for business travelers or couples looking for a sophisticated urban retreat.",
      price: 185,
      location: "Downtown",
      rating: 4.8,
      reviews: 24,
      image: "/modern-apartment.png",
      images: [
        "/modern-apartment.png",
        "/modern-apartment-living-room.png",
        "/modern-apartment-bedroom.png",
        "/modern-apartment-kitchen.png",
        "/modern-apartment-bathroom.png",
      ],
      amenities: ["WiFi", "Kitchen", "Parking", "Air Conditioning", "City View"],
      available: true,
      category: "homes",
      owner: {
        name: "Sarah Johnson",
        avatar: "/woman-profile.png",
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: "2",
      title: "Cozy Suburban House",
      description: "Perfect family home with garden and quiet neighborhood",
      fullDescription:
        "Escape to this charming 3-bedroom house nestled in a peaceful suburban neighborhood. The property features a beautiful garden, spacious living areas, and a fully equipped kitchen. Ideal for families or groups seeking comfort and tranquility while still being close to city amenities.",
      price: 125,
      location: "Suburbs",
      rating: 4.6,
      reviews: 18,
      image: "/suburban-house.png",
      images: [
        "/suburban-house.png",
        "/suburban-living-room.png",
        "/suburban-house-garden.jpg",
        "/suburban-kitchen.png",
      ],
      amenities: ["Garden", "Garage", "Pet-friendly", "BBQ Area", "Quiet Area"],
      available: true,
      category: "homes",
      owner: {
        name: "Michael Chen",
        avatar: "/man-profile.png",
        rating: 4.7,
        verified: true,
      },
    },
    {
      id: "3",
      title: "Luxury Penthouse Suite",
      description: "Premium penthouse with panoramic city views and luxury amenities",
      fullDescription:
        "Indulge in the ultimate luxury experience in this stunning penthouse suite. Featuring panoramic city views, premium amenities including a private pool and gym access, and concierge services. This exclusive property offers the finest in urban living with unparalleled comfort and style.",
      price: 350,
      location: "City Center",
      rating: 4.9,
      reviews: 31,
      image: "/luxury-penthouse-interior.png",
      images: [
        "/luxury-penthouse-interior.png",
        "/luxury-penthouse-living-room.png",
        "/luxury-penthouse-bedroom.png",
        "/luxury-penthouse-terrace.png",
        "/luxury-penthouse-bathroom.png",
      ],
      amenities: ["Pool", "Gym", "Concierge", "Panoramic Views", "Premium Finishes"],
      available: true,
      category: "homes",
      owner: {
        name: "Emma Rodriguez",
        avatar: "/business-woman-profile.png",
        rating: 5.0,
        verified: true,
      },
    },
    {
      id: "9",
      title: "Beachfront Villa",
      description: "Stunning oceanfront villa with private beach access",
      fullDescription:
        "Wake up to ocean views in this magnificent beachfront villa. Features 4 bedrooms, private beach access, infinity pool, and outdoor dining area. Perfect for luxury getaways and special occasions.",
      price: 450,
      location: "Beachfront",
      rating: 4.9,
      reviews: 67,
      image: "/beachfront-villa.png",
      images: ["/beachfront-villa.png"],
      amenities: ["Private Beach", "Pool", "Ocean View", "4 Bedrooms", "Outdoor Kitchen"],
      available: true,
      category: "homes",
      owner: {
        name: "Maria Santos",
        avatar: "/woman-profile.png",
        rating: 4.8,
        verified: true,
      },
    },
    {
      id: "10",
      title: "Mountain Cabin Retreat",
      description: "Rustic cabin surrounded by nature with modern amenities",
      fullDescription:
        "Escape to this cozy mountain cabin featuring rustic charm with modern comforts. Includes fireplace, hot tub, and hiking trails nearby. Perfect for nature lovers and romantic getaways.",
      price: 95,
      location: "Mountains",
      rating: 4.7,
      reviews: 43,
      image: "/secluded-mountain-cabin.png",
      images: ["/secluded-mountain-cabin.png"],
      amenities: ["Fireplace", "Hot Tub", "Hiking Trails", "Mountain View", "Pet-friendly"],
      available: true,
      category: "homes",
      owner: {
        name: "Robert Wilson",
        avatar: "/man-profile.png",
        rating: 4.6,
        verified: true,
      },
    },
    ...Array.from({ length: 2495 }, (_, i) => {
      const index = i + 6 // Start after existing 5 listings
      const homeTypes = ["apartment", "house", "condo", "studio", "loft", "villa", "penthouse", "townhouse"]
      const styles = ["Modern", "Luxury", "Cozy", "Spacious", "Elegant", "Contemporary", "Classic", "Boutique"]
      const locations = [
        "Downtown",
        "Suburbs",
        "City Center",
        "Beachfront",
        "Mountains",
        "Garden District",
        "Historic District",
      ]

      const homeType = homeTypes[index % homeTypes.length]
      const style = styles[index % styles.length]
      const location = locations[index % locations.length]

      return {
        id: `home-${index}`,
        title: `${style} ${homeType.charAt(0).toUpperCase() + homeType.slice(1)} ${index}`,
        description: `Beautiful ${style.toLowerCase()} ${homeType} in ${location}`,
        fullDescription: `Experience comfort and style in this ${style.toLowerCase()} ${homeType} located in the desirable ${location} area. Features modern amenities, comfortable furnishings, and excellent location. Perfect for business travelers, families, or romantic getaways.`,
        price: Math.floor(Math.random() * 300) + 75,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 60) + 5,
        image: `/placeholder.svg?height=300&width=400&text=${style}+${homeType}`,
        images: Array.from(
          { length: 6 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${style}+${homeType}+${imgIndex + 1}`,
        ),
        amenities: ["WiFi", "Kitchen", "Parking", "Air Conditioning", "Modern Furnishing", "Great Location"],
        available: Math.random() > 0.1,
        category: "homes",
        owner: {
          name: `Host ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Host`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.05,
        },
      }
    }),
  ],
  vehicles: [
    {
      id: "4",
      title: "Tesla Model 3",
      description: "Electric sedan with autopilot and premium interior",
      fullDescription:
        "Experience the future of driving with this Tesla Model 3. Featuring cutting-edge autopilot technology, premium interior with vegan leather seats, and impressive range. Perfect for eco-conscious travelers who don't want to compromise on luxury and performance.",
      price: 95,
      location: "Downtown",
      rating: 4.7,
      reviews: 42,
      image: "https://picsum.photos/seed/vehicles-1/800/600",
      images: [
        "https://picsum.photos/seed/vehicles-1/800/600",
        "https://picsum.photos/seed/vehicles-2/800/600",
        "https://picsum.photos/seed/vehicles-3/800/600",
        "https://picsum.photos/seed/vehicles-4/800/600",
        "https://picsum.photos/seed/vehicles-5/800/600",
      ],
      amenities: ["Electric", "Autopilot", "Premium Audio", "GPS Navigation", "Fast Charging"],
      available: true,
      category: "vehicles",
      owner: {
        name: "David Kim",
        avatar: "/man-profile-tech.jpg",
        rating: 4.8,
        verified: true,
      },
    },
    {
      id: "5",
      title: "BMW X5 SUV",
      description: "Spacious luxury SUV perfect for family trips",
      fullDescription:
        "Travel in comfort and style with this premium BMW X5 SUV. Offering spacious seating for up to 7 passengers, advanced safety features, and luxurious leather interior. Ideal for family vacations, group trips, or when you need extra space and comfort.",
      price: 135,
      location: "Airport",
      rating: 4.5,
      reviews: 28,
      image: "https://picsum.photos/seed/vehicles-6/800/600",
      images: [
        "https://picsum.photos/seed/vehicles-6/800/600",
        "https://picsum.photos/seed/vehicles-7/800/600",
        "https://picsum.photos/seed/vehicles-8/800/600",
        "https://picsum.photos/seed/vehicles-9/800/600",
        "https://picsum.photos/seed/vehicles-10/800/600",
      ],
      amenities: ["7-seater", "GPS", "Leather seats", "Sunroof", "Premium Sound"],
      available: true,
      category: "vehicles",
      owner: {
        name: "Lisa Thompson",
        avatar: "/professional-woman-profile.png",
        rating: 4.6,
        verified: true,
      },
    },
    {
      id: "11",
      title: "Porsche 911 Carrera",
      description: "Iconic sports car for the ultimate driving experience",
      fullDescription:
        "Feel the thrill of driving this legendary Porsche 911 Carrera. With its powerful engine, precision handling, and timeless design, it's perfect for special occasions and weekend adventures.",
      price: 285,
      location: "Luxury District",
      rating: 4.9,
      reviews: 34,
  image: "https://picsum.photos/seed/vehicles-11/800/600",
  images: ["https://picsum.photos/seed/vehicles-11/800/600"],
      amenities: ["Sports Car", "Premium Interior", "High Performance", "Convertible Option"],
      available: true,
      category: "vehicles",
      owner: {
        name: "James Mitchell",
        avatar: "/businessman-profile.jpg",
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: "12",
      title: "Ford Transit Van",
      description: "Spacious van perfect for group travel and moving",
      fullDescription:
        "This reliable Ford Transit van offers ample space for passengers or cargo. Ideal for group trips, moving, or transporting equipment. Features modern safety systems and comfortable seating.",
      price: 75,
      location: "Industrial Area",
      rating: 4.3,
      reviews: 19,
  image: "https://picsum.photos/seed/vehicles-12/800/600",
  images: ["https://picsum.photos/seed/vehicles-12/800/600"],
      amenities: ["12-seater", "Large Cargo Space", "GPS", "Backup Camera", "Bluetooth"],
      available: true,
      category: "vehicles",
      owner: {
        name: "Carlos Rodriguez",
        avatar: "/man-profile.png",
        rating: 4.4,
        verified: true,
      },
    },
    ...Array.from({ length: 1796 }, (_, i) => {
      const index = i + 5 // Start after existing 4 listings
      const vehicleTypes = [
        "sedan",
        "suv",
        "truck",
        "convertible",
        "motorcycle",
        "van",
        "sports-car",
        "electric",
        "hybrid",
      ]
      const brands = [
        "BMW",
        "Mercedes",
        "Audi",
        "Toyota",
        "Honda",
        "Ford",
        "Chevrolet",
        "Nissan",
        "Volkswagen",
      ]
      const locations = ["Downtown", "Airport", "Suburbs", "City Center", "Business District", "Luxury District"]

      const vehicleType = vehicleTypes[index % vehicleTypes.length]
      const brand = brands[index % brands.length]
      const location = locations[index % locations.length]

      // Use picsum seeds in the vehicles pool starting at 13+
      const genSeedStart = 13 + i

      return {
        id: `vehicle-${index}`,
        title: `${brand} ${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} ${index}`,
        description: `Premium ${brand} ${vehicleType} with modern features and comfort`,
        fullDescription: `Experience luxury and performance with this ${brand} ${vehicleType}. Features premium interior, advanced safety systems, and excellent fuel efficiency. Perfect for business trips, family vacations, or special occasions.`,
        price: Math.floor(Math.random() * 200) + 50,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 50) + 5,
        image: `https://picsum.photos/seed/vehicles-${genSeedStart}/800/600`,
        images: Array.from({ length: 5 }, (_, imgIndex) => `https://picsum.photos/seed/vehicles-${genSeedStart + imgIndex}/800/600`),
        amenities: ["GPS Navigation", "Bluetooth", "Air Conditioning", "Premium Sound", "Safety Features"],
        available: Math.random() > 0.1,
        category: "vehicles",
        owner: {
          name: `Owner ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Owner`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.2,
        },
      }
    }),
  ],
  equipment: [
    {
      id: "6",
      title: "Professional Camera Kit",
      description: "Complete photography setup with lenses and accessories",
      fullDescription:
        "Capture stunning photos and videos with this professional camera kit. Includes a high-end DSLR camera, multiple lenses (24-70mm, 85mm portrait, 16-35mm wide), professional lighting equipment, and sturdy tripod. Perfect for photographers, content creators, or special events.",
      price: 65,
      location: "Creative District",
      rating: 4.8,
      reviews: 15,
      image: "/professional-camera-equipment.jpg",
      images: [
        "/professional-camera-equipment.jpg",
        "/professional-camera-kit.jpg",
        "/camera-lenses-collection.jpg",
        "/photography-lighting-setup.png",
        "/camera-tripod-equipment.jpg",
      ],
      amenities: ["Multiple lenses", "Tripod", "Lighting", "Memory Cards", "Carrying Case"],
      available: true,
      category: "equipment",
      owner: {
        name: "Alex Rivera",
        avatar: "/photographer-profile.png",
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: "13",
      title: "DJ Equipment Setup",
      description: "Professional DJ equipment for events and parties",
      fullDescription:
        "Complete DJ setup including turntables, mixer, speakers, and lighting. Perfect for parties, weddings, and events. Includes wireless microphones and extensive music library access.",
      price: 125,
      location: "Entertainment District",
      rating: 4.7,
      reviews: 28,
      image: "/dj-equipment-setup.jpg",
      images: ["/dj-equipment-setup.jpg"],
      amenities: ["Turntables", "Mixer", "Speakers", "Lighting", "Wireless Mics"],
      available: true,
      category: "equipment",
      owner: {
        name: "DJ Marcus",
        avatar: "/dj-profile.png",
        rating: 4.8,
        verified: true,
      },
    },
    {
      id: "14",
      title: "Power Tools Set",
      description: "Complete set of professional power tools for construction",
      fullDescription:
        "Comprehensive collection of professional-grade power tools including drills, saws, sanders, and more. Perfect for construction projects, home renovations, and DIY enthusiasts.",
      price: 45,
      location: "Hardware District",
      rating: 4.5,
      reviews: 22,
      image: "/power-tools-set.jpg",
      images: ["/power-tools-set.jpg"],
      amenities: ["Multiple Tools", "Carrying Case", "Batteries Included", "Instruction Manual"],
      available: true,
      category: "equipment",
      owner: {
        name: "Mike Johnson",
        avatar: "/contractor-profile.jpg",
        rating: 4.6,
        verified: true,
      },
    },
    ...Array.from({ length: 3197 }, (_, i) => {
      const index = i + 4 // Start after existing 3 listings
      const equipmentTypes = [
        "camera",
        "tools",
        "audio",
        "lighting",
        "construction",
        "kitchen",
        "cleaning",
        "garden",
        "office",
      ]
      const categories = ["Professional", "Industrial", "Commercial", "Heavy-duty", "Portable", "Digital", "Wireless"]
      const locations = ["Creative District", "Industrial Area", "Business District", "Tech Hub", "Downtown"]

      const equipmentType = equipmentTypes[index % equipmentTypes.length]
      const category = categories[index % categories.length]
      const location = locations[index % locations.length]

      return {
        id: `equipment-${index}`,
        title: `${category} ${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)} Set ${index}`,
        description: `High-quality ${category.toLowerCase()} ${equipmentType} equipment for professional use`,
        fullDescription: `Professional-grade ${equipmentType} equipment perfect for commercial and personal projects. Includes all necessary accessories and comes with detailed instructions. Ideal for professionals and enthusiasts alike.`,
        price: Math.floor(Math.random() * 150) + 25,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 40) + 3,
        image: `/placeholder.svg?height=300&width=400&text=${category}+${equipmentType}`,
        images: Array.from(
          { length: 4 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${category}+${equipmentType}+${imgIndex + 1}`,
        ),
        amenities: ["Professional Grade", "Accessories Included", "Instructions", "Carrying Case", "Warranty"],
        available: Math.random() > 0.15,
        category: "equipment",
        owner: {
          name: `Equipment Owner ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Owner`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.1,
        },
      }
    }),
  ],
  events: [
    {
      id: "15",
      title: "Elegant Wedding Venue",
      description: "Beautiful venue perfect for weddings and special celebrations",
      fullDescription:
        "Stunning wedding venue with capacity for 200 guests. Features beautiful gardens, elegant ballroom, and full catering kitchen. Includes tables, chairs, and basic lighting setup.",
      price: 850,
      location: "Garden District",
      rating: 4.9,
      reviews: 45,
      image: "/elegant-wedding-venue.png",
      images: ["/elegant-wedding-venue.png"],
      amenities: ["200 Capacity", "Garden", "Catering Kitchen", "Tables & Chairs", "Parking"],
      available: true,
      category: "events",
      owner: {
        name: "Victoria Adams",
        avatar: "/event-planner-profile.jpg",
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: "16",
      title: "Corporate Conference Room",
      description: "Modern conference room with AV equipment for business meetings",
      fullDescription:
        "Professional conference room equipped with state-of-the-art AV equipment, high-speed internet, and comfortable seating for up to 50 people. Perfect for corporate meetings, presentations, and seminars.",
      price: 185,
      location: "Business District",
      rating: 4.6,
      reviews: 33,
      image: "/modern-conference-room.png",
      images: ["/modern-conference-room.png"],
      amenities: ["AV Equipment", "High-speed WiFi", "50 Capacity", "Catering Available", "Parking"],
      available: true,
      category: "events",
      owner: {
        name: "Corporate Solutions Inc.",
        avatar: "/corporate-profile.jpg",
        rating: 4.7,
        verified: true,
      },
    },
    ...Array.from({ length: 848 }, (_, i) => {
      const index = i + 3 // Start after existing 2 listings
      const venueTypes = [
        "ballroom",
        "garden",
        "rooftop",
        "conference",
        "gallery",
        "theater",
        "warehouse",
        "restaurant",
      ]
      const styles = ["Elegant", "Modern", "Rustic", "Luxury", "Industrial", "Classic", "Contemporary", "Boutique"]
      const locations = [
        "Garden District",
        "Business District",
        "Downtown",
        "Waterfront",
        "Historic District",
        "Arts District",
      ]

      const venueType = venueTypes[index % venueTypes.length]
      const style = styles[index % styles.length]
      const location = locations[index % locations.length]
      const capacity = [50, 100, 150, 200, 300, 500][index % 6]

      return {
        id: `event-${index}`,
        title: `${style} ${venueType.charAt(0).toUpperCase() + venueType.slice(1)} Venue ${index}`,
        description: `${style} ${venueType} perfect for events and celebrations`,
        fullDescription: `Host your special event in this ${style.toLowerCase()} ${venueType} venue. Features professional lighting, sound system, and flexible seating arrangements. Perfect for weddings, corporate events, parties, and special celebrations.`,
        price: Math.floor(Math.random() * 800) + 200,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 80) + 10,
        image: `/placeholder.svg?height=300&width=400&text=${style}+${venueType}`,
        images: Array.from(
          { length: 5 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${style}+${venueType}+${imgIndex + 1}`,
        ),
        amenities: [
          `${capacity} Capacity`,
          "Sound System",
          "Lighting",
          "Tables & Chairs",
          "Parking",
          "Catering Available",
        ],
        available: Math.random() > 0.2,
        category: "events",
        owner: {
          name: `Venue Manager ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Manager`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.1,
        },
      }
    }),
  ],
  tech: [
    {
      id: "8",
      title: "Gaming Setup",
      description: "Complete gaming setup with high-end PC and peripherals",
      fullDescription:
        "Dive into the world of gaming with this complete high-end gaming setup. Featuring a powerful PC, top-tier peripherals, and a comfortable gaming chair. Perfect for gamers looking for the ultimate gaming experience.",
      price: 75,
      location: "Tech Hub",
      rating: 4.8,
      reviews: 18,
      image: "/placeholder.svg?key=gaming456",
      images: [
        "/placeholder.svg?key=gaming456",
        "/gaming-setup-pc.png",
        "/gaming-setup-chair.jpg",
        "/gaming-setup-peripherals.png",
      ],
      amenities: ["High-end PC", "Gaming Chair", "Peripherals", "Surround Sound"],
      available: true,
      category: "tech",
      owner: {
        name: "Jane Lee",
        avatar: "/gamer-profile.png",
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: "19",
      title: "VR Headset & Setup",
      description: "Complete virtual reality setup for immersive experiences",
      fullDescription:
        "Experience the future with this complete VR setup including headset, controllers, and tracking system. Perfect for gaming, training, or virtual meetings. Includes popular VR games and applications.",
      price: 55,
      location: "Tech Hub",
      rating: 4.7,
      reviews: 24,
      image: "/vr-headset-setup.jpg",
      images: ["/vr-headset-setup.jpg"],
      amenities: ["VR Headset", "Controllers", "Tracking System", "Game Library", "Setup Support"],
      available: true,
      category: "tech",
      owner: {
        name: "Tech Innovations",
        avatar: "/tech-company-profile.jpg",
        rating: 4.8,
        verified: true,
      },
    },
    ...Array.from({ length: 948 }, (_, i) => {
      const index = i + 3 // Start after existing 2 listings
      const techTypes = ["laptop", "tablet", "camera", "drone", "headset", "speaker", "monitor", "projector", "console"]
      const brands = ["Apple", "Samsung", "Sony", "Microsoft", "Google", "Dell", "HP", "Canon", "Bose"]
      const locations = ["Tech Hub", "Business District", "Downtown", "Creative District", "University Area"]

      const techType = techTypes[index % techTypes.length]
      const brand = brands[index % brands.length]
      const location = locations[index % locations.length]

      return {
        id: `tech-${index}`,
        title: `${brand} ${techType.charAt(0).toUpperCase() + techType.slice(1)} ${index}`,
        description: `Latest ${brand} ${techType} with premium features`,
        fullDescription: `Experience cutting-edge technology with this ${brand} ${techType}. Features the latest specifications, premium build quality, and excellent performance. Perfect for professionals, students, and tech enthusiasts.`,
        price: Math.floor(Math.random() * 120) + 30,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 35) + 5,
        image: `/placeholder.svg?height=300&width=400&text=${brand}+${techType}`,
        images: Array.from(
          { length: 4 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${brand}+${techType}+${imgIndex + 1}`,
        ),
        amenities: ["Latest Model", "Premium Quality", "Accessories Included", "Setup Support", "Insurance Covered"],
        available: Math.random() > 0.1,
        category: "tech",
        owner: {
          name: `Tech Owner ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Owner`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.05,
        },
      }
    }),
  ],
  fashion: [
    {
      id: "17",
      title: "Designer Evening Gown",
      description: "Elegant designer gown perfect for formal events",
      fullDescription:
        "Stunning designer evening gown in midnight blue. Features intricate beadwork and flowing silhouette. Available in multiple sizes. Perfect for galas, weddings, and formal events.",
      price: 95,
      location: "Fashion District",
      rating: 4.8,
      reviews: 12,
      image: "/elegant-evening-gown.png",
      images: ["/elegant-evening-gown.png"],
      amenities: ["Designer Brand", "Multiple Sizes", "Professional Cleaning", "Accessories Available"],
      available: true,
      category: "fashion",
      owner: {
        name: "Sophia Chen",
        avatar: "/fashion-designer-profile.jpg",
        rating: 4.9,
        verified: true,
      },
    },
    {
      id: "18",
      title: "Luxury Watch Collection",
      description: "Premium watches for special occasions and business meetings",
      fullDescription:
        "Curated collection of luxury watches including Rolex, Omega, and other premium brands. Perfect for special occasions, business meetings, or when you want to make a statement.",
      price: 125,
      location: "Luxury District",
      rating: 4.9,
      reviews: 27,
      image: "/luxury-watches.jpg",
      images: ["/luxury-watches.jpg"],
      amenities: ["Premium Brands", "Multiple Styles", "Authentication Included", "Insurance Covered"],
      available: true,
      category: "fashion",
      owner: {
        name: "Alexander Luxury",
        avatar: "/luxury-dealer-profile.jpg",
        rating: 5.0,
        verified: true,
      },
    },
    ...Array.from({ length: 698 }, (_, i) => {
      const index = i + 3 // Start after existing 2 listings
      const fashionTypes = ["dress", "suit", "gown", "tuxedo", "jacket", "shoes", "accessories", "jewelry", "handbag"]
      const styles = ["Designer", "Luxury", "Vintage", "Contemporary", "Classic", "Elegant", "Trendy", "Premium"]
      const locations = ["Fashion District", "Luxury District", "Downtown", "Boutique Area", "Shopping District"]

      const fashionType = fashionTypes[index % fashionTypes.length]
      const style = styles[index % styles.length]
      const location = locations[index % locations.length]

      return {
        id: `fashion-${index}`,
        title: `${style} ${fashionType.charAt(0).toUpperCase() + fashionType.slice(1)} ${index}`,
        description: `${style} ${fashionType} perfect for special occasions`,
        fullDescription: `Make a statement with this ${style.toLowerCase()} ${fashionType}. Features premium materials, excellent craftsmanship, and timeless design. Perfect for weddings, galas, business events, and special occasions.`,
        price: Math.floor(Math.random() * 180) + 40,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 25) + 3,
        image: `/placeholder.svg?height=300&width=400&text=${style}+${fashionType}`,
        images: Array.from(
          { length: 3 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${style}+${fashionType}+${imgIndex + 1}`,
        ),
        amenities: [
          "Designer Brand",
          "Multiple Sizes",
          "Professional Cleaning",
          "Styling Advice",
          "Accessories Available",
        ],
        available: Math.random() > 0.15,
        category: "fashion",
        owner: {
          name: `Fashion Owner ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Owner`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.1,
        },
      }
    }),
  ],
  tools: [
    {
      id: "tools-1",
      title: "Professional Drill Set",
      description: "Complete drill set with multiple bits and accessories",
      fullDescription:
        "Professional-grade drill set perfect for construction, home improvement, and DIY projects. Includes cordless drill, impact driver, multiple drill bits, screwdriver bits, and carrying case. Features long-lasting battery and fast charging capability.",
      price: 35,
      location: "Hardware District",
      rating: 4.6,
      reviews: 23,
      image: "/professional-drill-set.jpg",
      images: [
        "/professional-drill-set.jpg",
        "/drill-bits-collection.jpg",
        "/cordless-drill-action.jpg",
        "/drill-carrying-case.jpg",
      ],
      amenities: ["Cordless", "Multiple Bits", "Carrying Case", "Fast Charging", "LED Light"],
      available: true,
      category: "tools",
      owner: {
        name: "Tool Master Inc.",
        avatar: "/tool-shop-profile.jpg",
        rating: 4.7,
        verified: true,
      },
    },
    {
      id: "tools-2",
      title: "Circular Saw Kit",
      description: "Heavy-duty circular saw with guide rails and blades",
      fullDescription:
        "Professional circular saw kit ideal for woodworking and construction projects. Includes precision guide rails, multiple blade types, dust collection system, and safety equipment. Perfect for accurate cuts and professional results.",
      price: 55,
      location: "Construction Zone",
      rating: 4.8,
      reviews: 31,
      image: "/circular-saw-kit.jpg",
      images: ["/circular-saw-kit.jpg"],
      amenities: ["Guide Rails", "Multiple Blades", "Dust Collection", "Safety Equipment", "Precision Cutting"],
      available: true,
      category: "tools",
      owner: {
        name: "Pro Construction Tools",
        avatar: "/construction-tools-profile.jpg",
        rating: 4.9,
        verified: true,
      },
    },
    ...Array.from({ length: 898 }, (_, i) => {
      const index = i + 3 // Start after existing 2 listings
      const toolTypes = [
        "drill",
        "saw",
        "hammer",
        "wrench",
        "screwdriver",
        "pliers",
        "level",
        "measuring",
        "sander",
        "grinder",
      ]
      const brands = ["DeWalt", "Makita", "Bosch", "Milwaukee", "Ryobi", "Black+Decker", "Craftsman", "Stanley"]
      const locations = ["Hardware District", "Construction Zone", "Tool Center", "Industrial Area", "Workshop Hub"]

      const toolType = toolTypes[index % toolTypes.length]
      const brand = brands[index % brands.length]
      const location = locations[index % locations.length]

      return {
        id: `tools-${index}`,
        title: `${brand} ${toolType.charAt(0).toUpperCase() + toolType.slice(1)} Set ${index}`,
        description: `Professional ${brand} ${toolType} set for construction and DIY projects`,
        fullDescription: `High-quality ${brand} ${toolType} set perfect for professional contractors and DIY enthusiasts. Features durable construction, ergonomic design, and excellent performance. Includes all necessary accessories and carrying case.`,
        price: Math.floor(Math.random() * 80) + 20,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 40) + 5,
        image: `/placeholder.svg?height=300&width=400&text=${brand}+${toolType}`,
        images: Array.from(
          { length: 3 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${brand}+${toolType}+${imgIndex + 1}`,
        ),
        amenities: ["Professional Grade", "Durable Construction", "Ergonomic Design", "Carrying Case", "Warranty"],
        available: Math.random() > 0.1,
        category: "tools",
        owner: {
          name: `Tool Owner ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Owner`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.1,
        },
      }
    }),
  ],
  sports: [
    {
      id: "7",
      title: "Mountain Bike",
      description: "High-quality mountain bike perfect for trails",
      fullDescription:
        "Experience the thrill of the trails with this high-quality mountain bike. Designed for rugged terrain, it offers reliable performance and comfort for long rides. Perfect for outdoor enthusiasts and adventure seekers.",
      price: 35,
      location: "Mountain Trails",
      rating: 4.7,
      reviews: 10,
      image: "/placeholder.svg?key=bike123",
      images: ["/placeholder.svg?key=bike123", "/mountain-bike-closeup.png", "/mountain-bike-in-action.jpg"],
      amenities: ["Suspension", "Wide tires", "Water bottle holder", "Lightweight"],
      available: true,
      category: "sports",
      owner: {
        name: "John Smith",
        avatar: "/sportsman-profile.png",
        rating: 4.5,
        verified: true,
      },
    },
    {
      id: "20",
      title: "Surfboard & Wetsuit",
      description: "Complete surfing gear for beach adventures",
      fullDescription:
        "Hit the waves with this professional surfboard and wetsuit combo. Includes 9ft longboard perfect for beginners and intermediates, plus full wetsuit and safety leash.",
      price: 45,
      location: "Beach Area",
      rating: 4.6,
      reviews: 18,
      image: "/surfboard-wetsuit.jpg",
      images: ["/surfboard-wetsuit.jpg"],
      amenities: ["9ft Longboard", "Wetsuit", "Safety Leash", "Wax Included", "Beach Delivery"],
      available: true,
      category: "sports",
      owner: {
        name: "Ocean Adventures",
        avatar: "/surfer-profile.jpg",
        rating: 4.7,
        verified: true,
      },
    },
    {
      id: "21",
      title: "Tennis Racket Set",
      description: "Professional tennis equipment for court play",
      fullDescription:
        "Complete tennis set including professional rackets, balls, and court accessories. Perfect for recreational play or serious training. Includes multiple racket options for different skill levels.",
      price: 25,
      location: "Sports Complex",
      rating: 4.4,
      reviews: 14,
      image: "/tennis-racket-set.jpg",
      images: ["/tennis-racket-set.jpg"],
      amenities: ["Multiple Rackets", "Tennis Balls", "Carrying Bag", "Different Weights"],
      available: true,
      category: "sports",
      owner: {
        name: "Tennis Pro Shop",
        avatar: "/tennis-coach-profile.jpg",
        rating: 4.5,
        verified: true,
      },
    },
    ...Array.from({ length: 1197 }, (_, i) => {
      const index = i + 4 // Start after existing 3 listings
      const sportsTypes = ["bike", "surfboard", "skis", "tennis", "golf", "kayak", "climbing", "fitness", "camping"]
      const brands = ["Nike", "Adidas", "Wilson", "Spalding", "Trek", "Specialized", "Burton", "Rossignol"]
      const locations = ["Sports Complex", "Beach Area", "Mountain Trails", "Recreation Center", "Outdoor Center"]

      const sportsType = sportsTypes[index % sportsTypes.length]
      const brand = brands[index % brands.length]
      const location = locations[index % locations.length]

      return {
        id: `sports-${index}`,
        title: `${brand} ${sportsType.charAt(0).toUpperCase() + sportsType.slice(1)} Equipment ${index}`,
        description: `Professional ${brand} ${sportsType} equipment for sports enthusiasts`,
        fullDescription: `Get active with this professional ${brand} ${sportsType} equipment. Features high-quality construction, excellent performance, and durability. Perfect for beginners and experienced athletes alike.`,
        price: Math.floor(Math.random() * 80) + 20,
        location,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 30) + 5,
        image: `/placeholder.svg?height=300&width=400&text=${brand}+${sportsType}`,
        images: Array.from(
          { length: 3 },
          (_, imgIndex) => `/placeholder.svg?height=300&width=400&text=${brand}+${sportsType}+${imgIndex + 1}`,
        ),
        amenities: ["Professional Grade", "Safety Equipment", "Instructions Included", "Maintenance Included"],
        available: Math.random() > 0.1,
        category: "sports",
        owner: {
          name: `Sports Owner ${index}`,
          avatar: `/placeholder.svg?height=50&width=50&text=Owner`,
          rating: Number((Math.random() * 1 + 4).toFixed(1)),
          verified: Math.random() > 0.1,
        },
      }
    }),
  ],
}

// Helper function to get listing by ID
export function getListingById(id: string): Listing | undefined {
  for (const category of Object.values(mockListings)) {
    const listing = category.find((item) => item.id === id)
    if (listing) return normalizeListingImages(listing)
  }
  return undefined
}

// Helper function to get listings by category
export function getListingsByCategory(category: string): Listing[] {
  const list = mockListings[category] || []
  return list.map(normalizeListingImages)
}

// Ensure listings have a valid image (fallback to category/default images when necessary)
function normalizeListingImages(listing: Listing): Listing {
  const makePicsumUrl = (seed: string, w = 800, h = 600) =>
    `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

  // Deterministic hash -> integer helper
  const hashToInt = (s: string, min = 0, max = 100) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
    const v = Math.abs(h)
    return min + (v % (max - min + 1))
  }

  const baseSeed = `${listing.category}-${listing.id ?? listing.title ?? Math.random()}`

  // Category-specific pool sizes (how many distinct picsum seeds per category)
  const CATEGORY_POOL_SIZE: Record<string, number> = {
    homes: 30,
    vehicles: 40,
    equipment: 30,
    events: 30,
    tech: 30,
    fashion: 30,
    tools: 30,
    sports: 30,
  }

  // Map images to deterministic picsum seeds drawn from a category pool so
  // all 'vehicles' listings use seeds in the vehicles pool, 'tools' use the tools pool, etc.
  const poolSize = CATEGORY_POOL_SIZE[listing.category] || 30

  // Pick a stable starting index from the listing id/title so images remain consistent
  // Deterministically derive some numeric fields from the listing id so
  // server-rendered HTML matches client rendering and avoids hydration errors.
  const hashString = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  const seed = hashString(listing.id || listing.title || "0")

  const stableBase = hashString(listing.id || listing.title || String(seed))
  const startIndex = (stableBase % poolSize) + 1

  const sourceImages = listing.images && listing.images.length > 0 ? listing.images : [listing.image]

  // For each image slot, pick the next seed in the category pool (wrap around)
  const mappedImages = sourceImages.map((_, idx) => {
    const poolIndex = ((startIndex - 1 + idx) % poolSize) + 1
    const seed = `${listing.category}-${poolIndex}`
    return makePicsumUrl(seed)
  })

  const primary = mappedImages[0] || makePicsumUrl(`${listing.category}-1`)
  // Deterministically derive some numeric fields from the listing id so
  // server-rendered HTML matches client rendering and avoids hydration errors.
  // Deterministic numeric fields (price, rating, reviews, availability, owner fields)
  const deterministicRating = Number(((3.5 + ((seed % 15) / 10))).toFixed(1))
  const deterministicReviews = seed % 500 // up to 499 reviews
  const deterministicPrice = (() => {
    // Provide a price range depending on category
    const ranges: Record<string, [number, number]> = {
      homes: [50, 500],
      vehicles: [30, 400],
      equipment: [20, 300],
      events: [100, 1500],
      tech: [10, 200],
      fashion: [10, 200],
      tools: [10, 150],
      sports: [10, 200],
    }
    const [min, max] = ranges[listing.category] || [20, 300]
    return hashToInt(listing.id ?? listing.title ?? String(seed), min, max)
  })()

  const deterministicAvailable = (hashToInt(listing.id ?? listing.title ?? String(seed), 0, 100) % 100) > 10
  const ownerRating = Number((4 + ((seed % 10) / 10)).toFixed(1))
  const ownerVerified = (seed % 10) > 1

  return {
    ...listing,
    image: primary,
    images: mappedImages,
    // Override numeric/display fields deterministically so SSR and client match
    price: deterministicPrice,
    rating: deterministicRating,
    reviews: deterministicReviews,
    available: deterministicAvailable,
    owner: {
      ...listing.owner,
      rating: ownerRating,
      verified: ownerVerified,
    },
  }
}

// Mock user profile data
export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  avatar: string
  joinDate: string
  rating: number
  totalBookings: number
  totalListings: number
  bio: string
}

export interface UserListing {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
  status: "active" | "inactive"
  bookings: number
  rating: number
  views: number
}

export interface UserBooking {
  id: string
  listingTitle: string
  listingImage: string
  owner: string
  dates: string
  totalPrice: number
  status: "confirmed" | "completed" | "pending" | "cancelled"
  category: string
}

export const mockUserProfile: UserProfile = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  avatar: "/user-avatar.jpg",
  joinDate: "January 2024",
  rating: 4.8,
  totalBookings: 12,
  totalListings: 3,
  bio: "Passionate about sharing great experiences through rentals. I love photography, travel, and outdoor adventures.",
}

export const mockUserListings: UserListing[] = [
  {
    id: "user-listing-1",
    title: "Vintage Camera Collection",
    description: "Professional vintage cameras for photography enthusiasts",
    price: 35,
    category: "equipment",
    image: "/professional-camera-equipment.jpg",
    status: "active",
    bookings: 8,
    rating: 4.9,
    views: 156,
  },
  {
    id: "user-listing-2",
    title: "Mountain Bike",
    description: "High-quality mountain bike perfect for trails",
    price: 25,
    category: "sports",
    image: "/placeholder.svg?key=bike123",
    status: "active",
    bookings: 5,
    rating: 4.7,
    views: 89,
  },
  {
    id: "user-listing-3",
    title: "Gaming Setup",
    description: "Complete gaming setup with high-end PC and peripherals",
    price: 45,
    category: "tech",
    image: "/placeholder.svg?key=gaming456",
    status: "inactive",
    bookings: 12,
    rating: 4.8,
    views: 234,
  },
]

export const mockUserBookings: UserBooking[] = [
  {
    id: "booking-1",
    listingTitle: "Tesla Model 3",
    listingImage: "/tesla-model-3.png",
    owner: "David Kim",
    dates: "Dec 15-18, 2024",
    totalPrice: 340,
    status: "confirmed",
    category: "vehicles",
  },
  {
    id: "booking-2",
    listingTitle: "Modern Downtown Apartment",
    listingImage: "/modern-apartment.png",
    owner: "Sarah Johnson",
    dates: "Nov 20-25, 2024",
    totalPrice: 720,
    status: "completed",
    category: "homes",
  },
  {
    id: "booking-3",
    listingTitle: "Professional Camera Kit",
    listingImage: "/professional-camera-equipment.jpg",
    owner: "Alex Rivera",
    dates: "Jan 10-12, 2025",
    totalPrice: 135,
    status: "pending",
    category: "equipment",
  },
]
