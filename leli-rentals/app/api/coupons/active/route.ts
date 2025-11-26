import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('is_active', true)
            .gte('valid_until', now)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching active coupons:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Error in active coupons API:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
