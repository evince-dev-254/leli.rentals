import { NextRequest, NextResponse } from 'next/server'

const MAIN_API_BASE =
  process.env.NEXT_PUBLIC_MAIN_API_URL ||
  process.env.MAIN_APP_API_URL ||
  'http://localhost:3000/api'

const ADMIN_INTERNAL_TOKEN = process.env.ADMIN_INTERNAL_TOKEN

export async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  if (!ADMIN_INTERNAL_TOKEN) {
    return NextResponse.json(
      { error: 'ADMIN_INTERNAL_TOKEN is not configured in admin app' },
      { status: 500 }
    )
  }

  const targetPath = Array.isArray(resolvedParams.path) ? resolvedParams.path.join('/') : ''
  const search = req.nextUrl.search || ''
  const targetUrl = `${MAIN_API_BASE.replace(/\/$/, '')}/${targetPath}${search}`

  const headers = new Headers(req.headers)
  headers.set('x-admin-token', ADMIN_INTERNAL_TOKEN)
  headers.delete('host')
  headers.delete('content-length')
  headers.delete('accept-encoding')

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  }

  if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer()
    init.body = body
  }

  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(targetUrl, init)
  } catch (err) {
    console.error('Proxy upstream fetch failed:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Upstream fetch failed', message: errorMessage },
      { status: 502 }
    )
  }

  const responseBody = await upstreamResponse.arrayBuffer()
  const response = new NextResponse(responseBody, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
  })

  upstreamResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'content-encoding') return
    response.headers.set(key, value)
  })

  return response
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as OPTIONS }

