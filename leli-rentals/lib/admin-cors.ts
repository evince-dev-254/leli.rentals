import { NextRequest, NextResponse } from 'next/server'

/**
 * Get the allowed origin for CORS requests
 * Allows requests from admin dashboard (admin.leli.rentals) to main app APIs (www.leli.rentals/api)
 */
function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin')
  const adminDashboardUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || 'http://localhost:3001'
  const mainSiteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_MAIN_API_URL || 'http://localhost:3000'
  
  // Production domains
  const productionDomains = [
    'https://www.leli.rentals',
    'https://leli.rentals',
    'http://www.leli.rentals',
    'http://leli.rentals'
  ]
  
  const adminDomains = [
    'https://admin.leli.rentals',
    'http://admin.leli.rentals'
  ]
  
  // Allow requests from admin dashboard (admin.leli.rentals) to main app APIs
  if (origin) {
    // Check admin dashboard domains first (production)
    for (const adminDomain of adminDomains) {
      if (origin === adminDomain || origin.startsWith(`${adminDomain}/`)) {
        return origin
      }
    }
    
    // Check production main site domains
    for (const domain of productionDomains) {
      if (origin === domain || origin.startsWith(`${domain}/`)) {
    return origin
      }
  }
  
    // Check admin dashboard from environment variable
    if (origin === adminDashboardUrl || origin.startsWith(`${adminDashboardUrl}/`)) {
    return origin
  }
  
    // Check main site from environment variable
    if (origin === mainSiteUrl || origin.startsWith(`${mainSiteUrl}/`)) {
    return origin
  }
  
  // For development, allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin
    }
  }
  
  return null
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse, req: NextRequest): NextResponse {
  const allowedOrigin = getAllowedOrigin(req)
  
  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  }
  
  return response
}

/**
 * Create OPTIONS response for CORS preflight
 */
export function createOptionsResponse(req: NextRequest): NextResponse {
  const allowedOrigin = getAllowedOrigin(req)
  
  if (!allowedOrigin) {
    return new NextResponse(null, { status: 403 })
  }
  
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

