-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    interceptor_id TEXT NOT NULL REFERENCES interceptors(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    proxy_url TEXT NOT NULL,
    method TEXT NOT NULL,
    headers JSONB NOT NULL,
    body TEXT,
    response_status INTEGER NOT NULL,
    response_headers JSONB NOT NULL,
    response_body TEXT,
    duration INTEGER NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS logs_interceptor_id_idx ON logs(interceptor_id);
CREATE INDEX IF NOT EXISTS logs_timestamp_idx ON logs(timestamp DESC);

-- Add RLS policies
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own logs
CREATE POLICY "Users can view their own logs"
    ON logs
    FOR SELECT
    USING (
        interceptor_id IN (
            SELECT id FROM interceptors
            WHERE user_id::text = auth.uid()::text
        )
    );

-- Policy for inserting logs (only from the worker)
CREATE POLICY "Worker can insert logs"
    ON logs
    FOR INSERT
    WITH CHECK (true);

-- Policy for deleting logs (only from the worker)
CREATE POLICY "Worker can delete logs"
    ON logs
    FOR DELETE
    USING (true); 