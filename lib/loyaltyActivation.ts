import { supabaseAdmin } from '@/lib/supabase'

export async function activateLoyaltyMembership(intentId: string) {
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const { data: updatedMember } = await supabaseAdmin
    .from('loyalty_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('ziina_intent_id', intentId)
    .select()
    .single()

  // loyalty_members has no customer_id column — match by email instead,
  // and write the membership_id back onto the customer record. This is the
  // step that was missing: without it, /api/auth/me's join can never find
  // an active membership for this customer.
  if (updatedMember?.email) {
    await supabaseAdmin
      .from('customers')
      .update({ membership_id: updatedMember.membership_id })
      .eq('email', updatedMember.email)
  }

  return updatedMember
}
