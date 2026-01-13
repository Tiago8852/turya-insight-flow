-- Create storage bucket for analysis results
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-results', 'analysis-results', true);

-- Allow anyone to read analysis results (public bucket)
CREATE POLICY "Anyone can view analysis results"
ON storage.objects
FOR SELECT
USING (bucket_id = 'analysis-results');

-- Allow service role to insert analysis results (edge function will use service role)
CREATE POLICY "Service role can insert analysis results"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'analysis-results');