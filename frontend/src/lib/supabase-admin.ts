import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

// This client uses the Service Role Key. It bypassing Row Level Security.
// Do NOT export this to client components. Only use inside /app/api/... route handlers.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
