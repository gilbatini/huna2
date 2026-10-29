// Public values: safe to ship to the browser. Access is enforced in the database.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '__SUPABASE_URL__';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '__SUPABASE_KEY__';
