const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const testimonialController = {
  // Create a new testimonial
  createTestimonial: async (req, res) => {
    try {
      const { collection_id, client_name, client_job_title, audio_url } = req.body;
      
      let transcriptText = null;

      // 1. AI Transcription Flow
      if (audio_url && process.env.GROQ_API_KEY) {
        try {
          const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
          
          await new Promise((resolve, reject) => {
            https.get(audio_url, (res) => {
               if (res.statusCode !== 200) return reject(new Error(`Failed to download: ${res.statusCode}`));
               const fileStream = fs.createWriteStream(tempFilePath);
               res.pipe(fileStream);
               fileStream.on('finish', resolve);
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
          console.error("AI Transcription failed:", aiError);
          fs.writeFileSync(path.join(__dirname, '../../groq-error.log'), String(aiError.stack || aiError));
        }
      }
      
      const { data, error } = await supabase
        .from('testimonials')
        .insert([{ 
           collection_id, 
           client_name, 
           client_job_title, 
           audio_url,
           transcript: transcriptText
        }])
        .select()
        .single();
        
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all testimonials for a given collection
  getTestimonialsByCollection: async (req, res) => {
    try {
      const { collectionId } = req.params;
      
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  updateTestimonialStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const { data, error } = await supabase
        .from('testimonials')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteTestimonial: async (req, res) => {
    try {
      const { id } = req.params;
      const { data: testData } = await supabase.from('testimonials').select('audio_url, collection_id').eq('id', id).single();
      
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      
      if (testData && testData.audio_url) {
        const urlParts = testData.audio_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from('testimonials').remove([`${testData.collection_id}/${fileName}`]).catch(e => console.error('Storage cleanup skipped', e));
      }
      
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  getApprovedTestimonials: async (req, res) => {
    try {
      const { collectionId } = req.params;
      
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = testimonialController;
