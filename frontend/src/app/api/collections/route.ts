import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { user_id, name } = await req.json();
    const public_slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(3).toString('hex');
    
    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert([{ user_id, name, public_slug }])
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
