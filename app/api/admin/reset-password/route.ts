import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminPassword } from '@/lib/adminRateLimit'

export async function POST(req: NextRequest) {
  try {
    const { customerId, newPassword, adminPassword } = await req.json()
    if (!verifyAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 })
    }
    const passwordHash = await bcrypt.hash(newPassword, 10)
    const { error } = await supabaseAdmin
      .from('customers')
      .update({ password_hash: passwordHash })
      .eq('customer_id', customerId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
