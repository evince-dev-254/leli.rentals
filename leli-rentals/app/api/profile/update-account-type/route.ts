import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
    try {
        const { userId, accountType } = await request.json()

        if (!userId || !accountType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Update account type in user_profiles table
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ account_type: accountType })
            .eq('user_id', userId)
            .select()

        if (error) {
            console.error('Error updating account type:', error)
            return NextResponse.json(
                { error: 'Failed to update account type', details: error.message },
                { status: 500 }
            )
        }

        console.log('✅ Account type updated in database:', userId, accountType)

        return NextResponse.json({
            success: true,
            accountType,
            updated: data
        })

    } catch (error: any) {
        console.error('Account type update error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update account type' },
            { status: 500 }
        )
    }
}
