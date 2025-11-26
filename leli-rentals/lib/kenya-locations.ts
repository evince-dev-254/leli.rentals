// Kenya locations data for Leli Rentals
export interface Location {
  id: string
  name: string
  county: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  population?: number
  popular: boolean
}

export const kenyaCounties: Location[] = [
  // Nairobi County
  { id: "nairobi", name: "Nairobi", county: "Nairobi", region: "Central", coordinates: { latitude: -1.2921, longitude: 36.8219 }, population: 4397073, popular: true },
  { id: "westlands", name: "Westlands", county: "Nairobi", region: "Central", coordinates: { latitude: -1.2649, longitude: 36.8060 }, popular: true },
  { id: "karen", name: "Karen", county: "Nairobi", region: "Central", coordinates: { latitude: -1.3197, longitude: 36.6850 }, popular: true },
  { id: "kilimani", name: "Kilimani", county: "Nairobi", region: "Central", coordinates: { latitude: -1.3000, longitude: 36.7833 }, popular: true },
  { id: "runda", name: "Runda", county: "Nairobi", region: "Central", coordinates: { latitude: -1.2167, longitude: 36.8000 }, popular: true },
  { id: "langata", name: "Langata", county: "Nairobi", region: "Central", coordinates: { latitude: -1.3167, longitude: 36.8167 }, popular: true },
  { id: "kileleshwa", name: "Kileleshwa", county: "Nairobi", region: "Central", coordinates: { latitude: -1.2833, longitude: 36.7833 }, popular: true },
  { id: "lavington", name: "Lavington", county: "Nairobi", region: "Central", coordinates: { latitude: -1.2667, longitude: 36.7667 }, popular: true },

  // Mombasa County
  { id: "mombasa", name: "Mombasa", county: "Mombasa", region: "Coast", coordinates: { latitude: -4.0435, longitude: 39.6682 }, population: 1208333, popular: true },
  { id: "diani", name: "Diani", county: "Kwale", region: "Coast", coordinates: { latitude: -4.3167, longitude: 39.5833 }, popular: true },
  { id: "malindi", name: "Malindi", county: "Kilifi", region: "Coast", coordinates: { latitude: -3.2167, longitude: 40.1167 }, popular: true },
  { id: "watamu", name: "Watamu", county: "Kilifi", region: "Coast", coordinates: { latitude: -3.3500, longitude: 40.0167 }, popular: true },

  // Kisumu County
  { id: "kisumu", name: "Kisumu", county: "Kisumu", region: "Nyanza", coordinates: { latitude: -0.0917, longitude: 34.7680 }, population: 610082, popular: true },
  { id: "kakamega", name: "Kakamega", county: "Kakamega", region: "Western", coordinates: { latitude: 0.2833, longitude: 34.7500 }, popular: true },

  // Nakuru County
  { id: "nakuru", name: "Nakuru", county: "Nakuru", region: "Rift Valley", coordinates: { latitude: -0.3072, longitude: 36.0800 }, population: 1157873, popular: true },
  { id: "naivasha", name: "Naivasha", county: "Nakuru", region: "Rift Valley", coordinates: { latitude: -0.7167, longitude: 36.4333 }, popular: true },
  { id: "hells-gate", name: "Hell's Gate", county: "Nakuru", region: "Rift Valley", coordinates: { latitude: -0.9167, longitude: 36.3167 }, popular: true },

  // Eldoret County
  { id: "eldoret", name: "Eldoret", county: "Uasin Gishu", region: "Rift Valley", coordinates: { latitude: 0.5167, longitude: 35.2833 }, population: 475716, popular: true },

  // Thika County
  { id: "thika", name: "Thika", county: "Kiambu", region: "Central", coordinates: { latitude: -1.0500, longitude: 37.0833 }, population: 251407, popular: true },

  // Nyeri County
  { id: "nyeri", name: "Nyeri", county: "Nyeri", region: "Central", coordinates: { latitude: -0.4167, longitude: 36.9500 }, popular: true },

  // Meru County
  { id: "meru", name: "Meru", county: "Meru", region: "Eastern", coordinates: { latitude: 0.0500, longitude: 37.6500 }, popular: true },

  // Machakos County
  { id: "machakos", name: "Machakos", county: "Machakos", region: "Eastern", coordinates: { latitude: -1.5167, longitude: 37.2667 }, popular: true },

  // Kitui County
  { id: "kitui", name: "Kitui", county: "Kitui", region: "Eastern", coordinates: { latitude: -1.3667, longitude: 38.0167 }, popular: true },

  // Garissa County
  { id: "garissa", name: "Garissa", county: "Garissa", region: "North Eastern", coordinates: { latitude: -0.4500, longitude: 39.6500 }, popular: true },

  // Lamu County
  { id: "lamu", name: "Lamu", county: "Lamu", region: "Coast", coordinates: { latitude: -2.2667, longitude: 40.9000 }, popular: true },

  // Kericho County
  { id: "kericho", name: "Kericho", county: "Kericho", region: "Rift Valley", coordinates: { latitude: -0.3667, longitude: 35.2833 }, popular: true },

  // Bomet County
  { id: "bomet", name: "Bomet", county: "Bomet", region: "Rift Valley", coordinates: { latitude: -0.7833, longitude: 35.3333 }, popular: true },

  // Narok County
  { id: "narok", name: "Narok", county: "Narok", region: "Rift Valley", coordinates: { latitude: -1.0833, longitude: 35.8667 }, popular: true },
  { id: "maasai-mara", name: "Maasai Mara", county: "Narok", region: "Rift Valley", coordinates: { latitude: -1.5000, longitude: 35.0000 }, popular: true },

  // Kajiado County
  { id: "kajiado", name: "Kajiado", county: "Kajiado", region: "Rift Valley", coordinates: { latitude: -1.8500, longitude: 36.7833 }, popular: true },

  // Laikipia County
  { id: "laikipia", name: "Laikipia", county: "Laikipia", region: "Rift Valley", coordinates: { latitude: 0.2000, longitude: 36.8000 }, popular: true },

  // Samburu County
  { id: "samburu", name: "Samburu", county: "Samburu", region: "Rift Valley", coordinates: { latitude: 1.1167, longitude: 36.6833 }, popular: true },

  // Turkana County
  { id: "lodwar", name: "Lodwar", county: "Turkana", region: "Rift Valley", coordinates: { latitude: 3.1167, longitude: 35.6000 }, popular: true },

  // West Pokot County
  { id: "kapenguria", name: "Kapenguria", county: "West Pokot", region: "Rift Valley", coordinates: { latitude: 1.2500, longitude: 35.1167 }, popular: true },

  // Baringo County
  { id: "kabarnet", name: "Kabarnet", county: "Baringo", region: "Rift Valley", coordinates: { latitude: 0.5000, longitude: 35.7500 }, popular: true },

  // Elgeyo Marakwet County
  { id: "iten", name: "Iten", county: "Elgeyo Marakwet", region: "Rift Valley", coordinates: { latitude: 0.6667, longitude: 35.5000 }, popular: true },

  // Nandi County
  { id: "kapsabet", name: "Kapsabet", county: "Nandi", region: "Rift Valley", coordinates: { latitude: 0.2000, longitude: 35.1000 }, popular: true },

  // Uasin Gishu County (additional)
  { id: "moi-bridge", name: "Moi Bridge", county: "Uasin Gishu", region: "Rift Valley", coordinates: { latitude: 0.5167, longitude: 35.2833 }, popular: true },

  // Trans Nzoia County
  { id: "kitale", name: "Kitale", county: "Trans Nzoia", region: "Rift Valley", coordinates: { latitude: 1.0167, longitude: 35.0000 }, popular: true },

  // Bungoma County
  { id: "bungoma", name: "Bungoma", county: "Bungoma", region: "Western", coordinates: { latitude: 0.5667, longitude: 34.5667 }, popular: true },

  // Busia County
  { id: "busia", name: "Busia", county: "Busia", region: "Western", coordinates: { latitude: 0.4667, longitude: 34.1167 }, popular: true },

  // Vihiga County
  { id: "vihiga", name: "Vihiga", county: "Vihiga", region: "Western", coordinates: { latitude: 0.0500, longitude: 34.7167 }, popular: true },

  // Siaya County
  { id: "siaya", name: "Siaya", county: "Siaya", region: "Nyanza", coordinates: { latitude: 0.0667, longitude: 34.2833 }, popular: true },

  // Kisii County
  { id: "kisii", name: "Kisii", county: "Kisii", region: "Nyanza", coordinates: { latitude: -0.6833, longitude: 34.7667 }, popular: true },

  // Nyamira County
  { id: "nyamira", name: "Nyamira", county: "Nyamira", region: "Nyanza", coordinates: { latitude: -0.5667, longitude: 34.9500 }, popular: true },

  // Migori County
  { id: "migori", name: "Migori", county: "Migori", region: "Nyanza", coordinates: { latitude: -1.0667, longitude: 34.4667 }, popular: true },

  // Homa Bay County
  { id: "homa-bay", name: "Homa Bay", county: "Homa Bay", region: "Nyanza", coordinates: { latitude: -0.5167, longitude: 34.4500 }, popular: true },

  // Embu County
  { id: "embu", name: "Embu", county: "Embu", region: "Eastern", coordinates: { latitude: -0.5333, longitude: 37.4500 }, popular: true },

  // Isiolo County
  { id: "isiolo", name: "Isiolo", county: "Isiolo", region: "Eastern", coordinates: { latitude: 0.3500, longitude: 37.5833 }, popular: true },

  // Marsabit County
  { id: "marsabit", name: "Marsabit", county: "Marsabit", region: "Eastern", coordinates: { latitude: 2.3333, longitude: 37.9833 }, popular: true },

  // Wajir County
  { id: "wajir", name: "Wajir", county: "Wajir", region: "North Eastern", coordinates: { latitude: 1.7500, longitude: 40.0667 }, popular: true },

  // Mandera County
  { id: "mandera", name: "Mandera", county: "Mandera", region: "North Eastern", coordinates: { latitude: 3.9333, longitude: 41.8667 }, popular: true },

  // Tana River County
  { id: "hola", name: "Hola", county: "Tana River", region: "Coast", coordinates: { latitude: -1.5000, longitude: 40.0333 }, popular: true },

  // Kilifi County (additional)
  { id: "kilifi", name: "Kilifi", county: "Kilifi", region: "Coast", coordinates: { latitude: -3.6333, longitude: 39.8500 }, popular: true },

  // Taita Taveta County
  { id: "voi", name: "Voi", county: "Taita Taveta", region: "Coast", coordinates: { latitude: -3.4000, longitude: 38.5667 }, popular: true },

  // Kwale County (additional)
  { id: "kwale", name: "Kwale", county: "Kwale", region: "Coast", coordinates: { latitude: -4.1833, longitude: 39.4500 }, popular: true },

  // Murang'a County
  { id: "muranga", name: "Murang'a", county: "Murang'a", region: "Central", coordinates: { latitude: -0.7167, longitude: 37.1500 }, popular: true },

  // Kiambu County (additional)
  { id: "kiambu", name: "Kiambu", county: "Kiambu", region: "Central", coordinates: { latitude: -1.1667, longitude: 36.8167 }, popular: true },

  // Kirinyaga County
  { id: "kerugoya", name: "Kerugoya", county: "Kirinyaga", region: "Central", coordinates: { latitude: -0.5000, longitude: 37.2833 }, popular: true },

  // Nyandarua County
  { id: "nyahururu", name: "Nyahururu", county: "Nyandarua", region: "Central", coordinates: { latitude: 0.0333, longitude: 36.3667 }, popular: true },

  // Nyeri County (additional)
  { id: "karatina", name: "Karatina", county: "Nyeri", region: "Central", coordinates: { latitude: -0.4833, longitude: 37.1333 }, popular: true }
]

export const getLocationsByRegion = (region: string): Location[] => {
  return kenyaCounties.filter(location => location.region === region)
}

export const getPopularLocations = (): Location[] => {
  return kenyaCounties.filter(location => location.popular)
}

export const searchLocations = (query: string): Location[] => {
  const lowercaseQuery = query.toLowerCase()
  return kenyaCounties.filter(location => 
    location.name.toLowerCase().includes(lowercaseQuery) ||
    location.county.toLowerCase().includes(lowercaseQuery) ||
    location.region.toLowerCase().includes(lowercaseQuery)
  )
}

export const getRegions = (): string[] => {
  return Array.from(new Set(kenyaCounties.map(location => location.region)))
}

export const getCounties = (): string[] => {
  return Array.from(new Set(kenyaCounties.map(location => location.county)))
}
