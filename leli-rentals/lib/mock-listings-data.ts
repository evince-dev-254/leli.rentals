import { Listing } from "./listings-service"
import { Car, Home, Wrench, Music, Shirt, Laptop, Dumbbell } from "lucide-react"
import { generateUUID } from "./uuid"

// Generate comprehensive listings with 20+ items per category
export const generateMockListings = (): Listing[] => {
  const categories = [
    { id: "vehicles", name: "Vehicles", icon: Car },
    { id: "homes", name: "Homes & Apartments", icon: Home },
    { id: "equipment", name: "Equipment & Tools", icon: Wrench },
    { id: "events", name: "Event Spaces & Venues", icon: Music },
    { id: "fashion", name: "Fashion & Lifestyle", icon: Shirt },
    { id: "tech", name: "Tech & Gadgets", icon: Laptop },
    { id: "sports", name: "Sports & Recreation", icon: Dumbbell }
  ]

  const vehicleTitles = [
    "Luxury BMW X5 SUV", "Honda CB650R Motorbike", "Toyota Land Cruiser", "Mercedes-Benz C-Class",
    "Nissan Navara Pickup", "Kawasaki Ninja 650", "Volkswagen Golf", "Ford Ranger",
    "Suzuki Swift", "Hyundai Tucson", "Mazda CX-5", "Subaru Outback",
    "Audi A4", "BMW 3 Series", "Lexus RX", "Infiniti Q50",
    "Chevrolet Equinox", "Jeep Wrangler", "Land Rover Discovery", "Porsche Cayenne"
  ]

  const homeTitles = [
    "Modern 2-Bedroom Apartment", "Luxury Holiday Villa in Karen", "Studio Apartment Westlands",
    "3-Bedroom House Runda", "Penthouse Kilimani", "Serviced Apartment CBD",
    "Executive Suite Karen", "Townhouse Lavington", "Duplex Westlands", "Garden Apartment Kileleshwa",
    "Penthouse Riverside", "Villa Muthaiga", "Apartment Complex Thika Road", "House Karen",
    "Studio CBD", "2-Bedroom Lavington", "3-Bedroom Runda", "Penthouse Kilimani",
    "Villa Karen", "Apartment Westlands"
  ]

  const equipmentTitles = [
    "Professional Camera Kit", "Construction Tools Package", "Sound System Setup",
    "Drone Photography Kit", "Welding Equipment", "Power Tools Set", "Audio Mixing Board",
    "Lighting Equipment", "Generator Set", "Excavator Rental", "Crane Equipment",
    "Concrete Mixer", "Scaffolding Set", "Safety Equipment", "Measuring Tools",
    "Cutting Tools", "Drilling Equipment", "Painting Equipment", "Cleaning Equipment",
    "Office Equipment"
  ]

  const eventTitles = [
    "Elegant Wedding Hall", "Conference Center", "Outdoor Event Space", "Banquet Hall",
    "Garden Venue", "Rooftop Terrace", "Beach Venue", "Museum Venue", "Gallery Space",
    "Theater Hall", "Sports Complex", "Community Center", "Hotel Conference Room",
    "Restaurant Private Room", "Wine Bar Venue", "Cultural Center", "Exhibition Hall",
    "Convention Center", "Auditorium", "Chapel Venue"
  ]

  const fashionTitles = [
    "Designer Evening Gown", "Designer Handbag Collection", "Luxury Watch Collection",
    "Designer Shoes", "Jewelry Set", "Cocktail Dress", "Business Suit", "Wedding Dress",
    "Designer Jacket", "Luxury Scarf", "Designer Belt", "Evening Wear Set",
    "Formal Attire", "Designer Accessories", "Luxury Perfume", "Designer Sunglasses",
    "Fashion Jewelry", "Designer Hat", "Luxury Handbag", "Designer Coat"
  ]

  const techTitles = [
    "MacBook Pro M2", "Gaming Console Setup", "iPhone 15 Pro", "Samsung Galaxy S24",
    "iPad Pro", "Dell XPS Laptop", "HP Pavilion", "Lenovo ThinkPad", "ASUS ROG Gaming Laptop",
    "Microsoft Surface", "Apple Watch", "Samsung Galaxy Watch", "AirPods Pro",
    "Sony WH-1000XM5", "DJI Mavic Drone", "GoPro Hero", "Nintendo Switch",
    "PlayStation 5", "Xbox Series X", "VR Headset"
  ]

  const sportsTitles = [
    "Mountain Bike Package", "Professional Piano", "Treadmill", "Weight Bench Set",
    "Tennis Racket Set", "Golf Clubs", "Swimming Pool", "Basketball Court",
    "Football Equipment", "Cricket Set", "Badminton Set", "Table Tennis Set",
    "Yoga Mat Set", "Dumbbell Set", "Resistance Bands", "Elliptical Machine",
    "Rowing Machine", "Exercise Bike", "Boxing Equipment", "Skateboard"
  ]

  const locations = ["Nairobi, Kenya", "Mombasa, Kenya", "Kisumu, Kenya", "Nakuru, Kenya", "Eldoret, Kenya"]
  const owners = [
    { id: generateUUID(), name: "John Mwangi", rating: 4.9, verified: true, phone: "+254700123456" },
    { id: generateUUID(), name: "Sarah Kimani", rating: 4.8, verified: true, phone: "+254700234567" },
    { id: generateUUID(), name: "David Ochieng", rating: 4.7, verified: true, phone: "+254700345678" },
    { id: generateUUID(), name: "Mary Njeri", rating: 4.9, verified: true, phone: "+254700456789" },
    { id: generateUUID(), name: "Peter Kamau", rating: 4.6, verified: true, phone: "+254700567890" },
    { id: generateUUID(), name: "Grace Wanjiku", rating: 4.8, verified: true, phone: "+254700678901" },
    { id: generateUUID(), name: "Kevin Otieno", rating: 4.7, verified: true, phone: "+254700789012" },
    { id: generateUUID(), name: "James Mutua", rating: 4.9, verified: true, phone: "+254700890123" }
  ]

  const images = [
    "/images/Luxury Sports Car.jpg", "/luxury-cars-in-modern-showroom.jpg", "/modern-apartment-city-view.png",
    "/images/Vintage Camera Collection.jpg", "/professional-construction-and-industrial-equipment.jpg",
    "/elegant-event-venue-with-chandeliers-and-tables.jpg", "/designer-clothing-and-fashion-accessories.jpg",
    "/modern-electronics-and-tech-gadgets-display.jpg", "/images/Gaming Setup.jpg", "/images/Mountain Bike.jpg",
    "/images/Professional Camera Kit.jpg", "/images/Construction Tools.jpg", "/images/Sound System.jpg",
    "/images/Drone Kit.jpg", "/images/Welding Equipment.jpg", "/images/Power Tools.jpg",
    "/images/Audio Board.jpg", "/images/Lighting Equipment.jpg", "/images/Generator.jpg",
    "/images/Excavator.jpg", "/images/Crane.jpg", "/images/Concrete Mixer.jpg",
    "/images/Scaffolding.jpg", "/images/Safety Gear.jpg", "/images/Measuring Tools.jpg",
    "/images/Cutting Tools.jpg", "/images/Drilling Equipment.jpg", "/images/Painting Tools.jpg",
    "/images/Cleaning Equipment.jpg", "/images/Office Equipment.jpg", "/images/Wedding Hall.jpg",
    "/images/Conference Center.jpg", "/images/Outdoor Venue.jpg", "/images/Banquet Hall.jpg",
    "/images/Garden Venue.jpg", "/images/Rooftop Terrace.jpg", "/images/Beach Venue.jpg",
    "/images/Museum Venue.jpg", "/images/Gallery Space.jpg", "/images/Theater Hall.jpg",
    "/images/Sports Complex.jpg", "/images/Community Center.jpg", "/images/Hotel Conference.jpg",
    "/images/Restaurant Room.jpg", "/images/Wine Bar.jpg", "/images/Cultural Center.jpg",
    "/images/Exhibition Hall.jpg", "/images/Convention Center.jpg", "/images/Auditorium.jpg",
    "/images/Chapel.jpg", "/images/Evening Gown.jpg", "/images/Handbag Collection.jpg",
    "/images/Luxury Watch.jpg", "/images/Designer Shoes.jpg", "/images/Jewelry Set.jpg",
    "/images/Cocktail Dress.jpg", "/images/Business Suit.jpg", "/images/Wedding Dress.jpg",
    "/images/Designer Jacket.jpg", "/images/Luxury Scarf.jpg", "/images/Designer Belt.jpg",
    "/images/Evening Wear.jpg", "/images/Formal Attire.jpg", "/images/Designer Accessories.jpg",
    "/images/Luxury Perfume.jpg", "/images/Designer Sunglasses.jpg", "/images/Fashion Jewelry.jpg",
    "/images/Designer Hat.jpg", "/images/Luxury Handbag.jpg", "/images/Designer Coat.jpg",
    "/images/MacBook Pro.jpg", "/images/Gaming Console.jpg", "/images/iPhone.jpg",
    "/images/Samsung Galaxy.jpg", "/images/iPad Pro.jpg", "/images/Dell Laptop.jpg",
    "/images/HP Pavilion.jpg", "/images/Lenovo ThinkPad.jpg", "/images/ASUS Gaming.jpg",
    "/images/Microsoft Surface.jpg", "/images/Apple Watch.jpg", "/images/Samsung Watch.jpg",
    "/images/AirPods.jpg", "/images/Sony Headphones.jpg", "/images/DJI Drone.jpg",
    "/images/GoPro.jpg", "/images/Nintendo Switch.jpg", "/images/PlayStation.jpg",
    "/images/Xbox.jpg", "/images/VR Headset.jpg", "/images/Mountain Bike.jpg",
    "/images/Professional Piano.jpg", "/images/Treadmill.jpg", "/images/Weight Bench.jpg",
    "/images/Tennis Racket.jpg", "/images/Golf Clubs.jpg", "/images/Swimming Pool.jpg",
    "/images/Basketball Court.jpg", "/images/Football Equipment.jpg", "/images/Cricket Set.jpg",
    "/images/Badminton Set.jpg", "/images/Table Tennis.jpg", "/images/Yoga Mat.jpg",
    "/images/Dumbbell Set.jpg", "/images/Resistance Bands.jpg", "/images/Elliptical.jpg",
    "/images/Rowing Machine.jpg", "/images/Exercise Bike.jpg", "/images/Boxing Equipment.jpg",
    "/images/Skateboard.jpg"
  ]

  const listings: Listing[] = []

  categories.forEach(category => {
    let titles: string[] = []
    let amenities: string[] = []
    let basePrice = 5000

    switch (category.id) {
      case "vehicles":
        titles = vehicleTitles
        amenities = ["GPS Navigation", "Bluetooth", "Air Conditioning", "Insurance"]
        basePrice = 8000
        break
      case "homes":
        titles = homeTitles
        amenities = ["WiFi", "Parking", "Security", "Furnished"]
        basePrice = 15000
        break
      case "equipment":
        titles = equipmentTitles
        amenities = ["Professional Grade", "Maintenance Included", "Delivery Available", "Training Provided"]
        basePrice = 3000
        break
      case "events":
        titles = eventTitles
        amenities = ["Sound System", "Lighting", "Tables", "Chairs"]
        basePrice = 20000
        break
      case "fashion":
        titles = fashionTitles
        amenities = ["Authentic", "Dry Cleaned", "Size Available", "Accessories Included"]
        basePrice = 2000
        break
      case "tech":
        titles = techTitles
        amenities = ["Warranty", "Charger Included", "Case Included", "Setup Support"]
        basePrice = 4000
        break
      case "sports":
        titles = sportsTitles
        amenities = ["Equipment Included", "Safety Gear", "Maintenance", "Delivery Available"]
        basePrice = 3000
        break
    }

    titles.forEach((title, index) => {
      const owner = owners[index % owners.length]
      const image = images[index % images.length]
      const price = basePrice + (Math.random() * 10000)
      const rating = 4.0 + (Math.random() * 1.0)
      const reviews = Math.floor(Math.random() * 200) + 10
      const createdAt = new Date(2024, 0, Math.floor(Math.random() * 30) + 1)

      // Generate multiple images for each listing (2-5 images)
      const numImages = Math.floor(Math.random() * 4) + 2 // 2 to 5 images
      const listingImages = []
      for (let i = 0; i < numImages; i++) {
        const imageIndex = (index + i) % images.length
        listingImages.push(images[imageIndex])
      }

      listings.push({
        id: generateUUID(),
        title,
        description: `High-quality ${category.name.toLowerCase()} perfect for your needs`,
        price: Math.round(price),
        location: locations[index % locations.length],
        rating: Math.round(rating * 10) / 10,
        reviews,
        image,
        amenities,
        available: true,
        category: category.id,
        owner: { ...owner, avatar: "/placeholder-user.jpg" },
        images: listingImages,
        fullDescription: `Premium ${title.toLowerCase()} with all modern amenities and professional service. Perfect for your specific needs with excellent customer support.`,
        createdAt,
        updatedAt: createdAt
      })
    })
  })

  return listings
}

export const mockListings: Listing[] = generateMockListings()
