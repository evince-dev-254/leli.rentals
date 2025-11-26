import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/clerk`, {
            headers: {
                'x-admin-token': process.env.ADMIN_INTERNAL_TOKEN || '',
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error proxying request:', error)
        return NextResponse.json(
            { error: 'Failed to fetch Clerk users', details: error.message },
            { status: 500 }
        )
    }
}
