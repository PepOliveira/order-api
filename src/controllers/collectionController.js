const supabase = require('../config/supabase');

const collectionController = {
  // Create a new collection
  createCollection: async (req, res) => {
    try {
      const { user_id, name, public_slug } = req.body;
      
      const { data, error } = await supabase
        .from('collections')
        .insert([{ user_id, name, public_slug }])
        .select()
        .single();
        
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all collections for a user
  getUserCollections: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteCollection: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
      res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single collection by public slug
  getCollectionBySlug: async (req, res) => {
    try {
      const { slug } = req.params;
      
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('public_slug', slug)
        .single();
        
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Collection not found' });
      
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single collection by ID
  getCollectionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Collection not found' });
      
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = collectionController;
