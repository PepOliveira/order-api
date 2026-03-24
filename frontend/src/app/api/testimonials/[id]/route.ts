import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: testData } = await supabaseAdmin
      .from('testimonials')
      .select('audio_url, collection_id')
      .eq('id', id)
      .single();
    
    const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    
    if (testData && testData.audio_url) {
      const urlParts = testData.audio_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabaseAdmin.storage.from('testimonials').remove([`${testData.collection_id}/${fileName}`]).catch(e => console.error(e));
    }
    
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
