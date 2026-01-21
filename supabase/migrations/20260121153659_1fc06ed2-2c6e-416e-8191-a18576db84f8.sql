-- Create ads storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('ads', 'ads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to ads bucket
CREATE POLICY "Admins can upload ads media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ads' 
  AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master'))
    OR EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND can_manage_ads = true)
  )
);

-- Allow public read access to ads media
CREATE POLICY "Public can view ads media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ads');

-- Allow admins to delete ads media
CREATE POLICY "Admins can delete ads media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ads' 
  AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master'))
    OR EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND can_manage_ads = true)
  )
);

-- Allow admins to update ads media
CREATE POLICY "Admins can update ads media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ads' 
  AND (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'master'))
    OR EXISTS (SELECT 1 FROM admin_permissions WHERE user_id = auth.uid() AND can_manage_ads = true)
  )
);

-- Add segmentation columns to advertisements table
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS target_unit_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_teams text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN advertisements.target_unit_ids IS 'Array of unit IDs to target. Empty means all units.';
COMMENT ON COLUMN advertisements.target_teams IS 'Array of team names to target. Empty means all teams.';