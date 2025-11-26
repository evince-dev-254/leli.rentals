import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('special_offers')
            .select('*')
            .eq('is_active', true)
            .gte('end_date', now)
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) {
            console.error('Error fetching active special offers:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Error in active special offers API:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
