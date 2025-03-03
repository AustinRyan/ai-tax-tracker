/*
  # Storage setup for receipts

  1. New Storage Bucket
    - Creates a 'receipts' storage bucket for storing receipt images if it doesn't exist
  
  2. Security
    - Sets up Row Level Security policies for the storage bucket if they don't exist
    - Allows authenticated users to manage their own files
    - Allows public read access to all receipt files
*/

-- Create the receipts storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies with IF NOT EXISTS to avoid errors if they already exist
DO $$
BEGIN
    -- Check if the policy for uploading receipts exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to upload receipts'
    ) THEN
        CREATE POLICY "Allow authenticated users to upload receipts"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Check if the policy for updating receipts exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to update their own receipts'
    ) THEN
        CREATE POLICY "Allow authenticated users to update their own receipts"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Check if the policy for deleting receipts exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to delete their own receipts'
    ) THEN
        CREATE POLICY "Allow authenticated users to delete their own receipts"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Check if the policy for reading own receipts exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow authenticated users to read their own receipts'
    ) THEN
        CREATE POLICY "Allow authenticated users to read their own receipts"
        ON storage.objects
        FOR SELECT
        TO authenticated
        USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Check if the policy for public read access exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Allow public read access to receipts'
    ) THEN
        CREATE POLICY "Allow public read access to receipts"
        ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id = 'receipts');
    END IF;
END $$;