import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { collection_id, client_name, client_job_title, audio_url } = await req.json();
    
    let transcriptText = null;

    if (audio_url && process.env.GROQ_API_KEY) {
      try {
        const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
        
        await new Promise((resolve, reject) => {
          https.get(audio_url, (res) => {
             if (res.statusCode !== 200) return reject(new Error(`Failed to download audio: ${res.statusCode}`));
             const fileStream = fs.createWriteStream(tempFilePath);
             res.pipe(fileStream);
             fileStream.on('finish', () => resolve(true));
             fileStream.on('error', reject);
          }).on('error', reject);
        });

        const transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: "whisper-large-v3",
          response_format: "json",
          language: "pt", 
        });

        transcriptText = transcription.text;
        fs.unlinkSync(tempFilePath);
      } catch (aiError) {
        console.error("AI Transcription Serverless failed:", aiError);
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert([{ collection_id, client_name, client_job_title, audio_url, transcript: transcriptText }])
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
