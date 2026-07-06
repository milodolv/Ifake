-- Schéma Supabase pour iFake
-- Exécuter dans l'éditeur SQL Supabase

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL,
  user_id TEXT DEFAULT 'default'
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON templates
  FOR ALL USING (true) WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('conversation-images', 'conversation-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read conversation-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'conversation-images');

CREATE POLICY "Public upload conversation-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'conversation-images');
