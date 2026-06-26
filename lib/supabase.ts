import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    )
  }
  return _supabase
}

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
      { auth: { persistSession: false } }
    )
  }
  return _supabaseAdmin
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_t, prop) => Reflect.get(getSupabase() as any, prop),
})

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get: (_t, prop) => Reflect.get(getSupabaseAdmin() as any, prop),
})
