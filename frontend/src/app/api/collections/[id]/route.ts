import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Testimonials will be cascade-deleted by Supabase, but we must manually clean audio files!
    const { data: testimonials } = await supabaseAdmin
      .from('testimonials')
      .select('audio_url')
      .eq('collection_id', id);

    const { error } = await supabaseAdmin.from('collections').delete().eq('id', id);
    if (error) throw error;
    
    if (testimonials && testimonials.length > 0) {
      const filesToRemove = testimonials.map(t => {
        const parts = t.audio_url.split('/');
        return `${id}/${parts[parts.length - 1]}`;
      });
      await supabaseAdmin.storage.from('testimonials').remove(filesToRemove).catch(e => console.error(e));
    }
    
    return NextResponse.json({ message: 'Collection and files deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
