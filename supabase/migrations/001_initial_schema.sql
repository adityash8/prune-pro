-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create sites table
CREATE TABLE sites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Create urls table
CREATE TABLE urls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'noindex', 'redirect', 'deleted')),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    backlinks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, url)
);

-- Create metrics table
CREATE TABLE metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    position DECIMAL(10,2) DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url_id, day)
);

-- Create clusters table
CREATE TABLE clusters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    centroid_vector VECTOR(1536), -- OpenAI embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create url_clusters table
CREATE TABLE url_clusters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
    similarity DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(url_id, cluster_id)
);

-- Create actions table
CREATE TABLE actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('keep', 'refresh', 'consolidate', 'prune', 'redirect')),
    rationale TEXT NOT NULL,
    risk INTEGER NOT NULL CHECK (risk >= 0 AND risk <= 100),
    guard_flags JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'applied', 'rolled_back')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create changes table
CREATE TABLE changes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
    rollback_token TEXT NOT NULL,
    diff JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_urls_site_id ON urls(site_id);
CREATE INDEX idx_urls_status ON urls(status);
CREATE INDEX idx_metrics_url_id ON metrics(url_id);
CREATE INDEX idx_metrics_day ON metrics(day);
CREATE INDEX idx_clusters_site_id ON clusters(site_id);
CREATE INDEX idx_url_clusters_url_id ON url_clusters(url_id);
CREATE INDEX idx_url_clusters_cluster_id ON url_clusters(cluster_id);
CREATE INDEX idx_actions_url_id ON actions(url_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_type ON actions(type);
CREATE INDEX idx_changes_action_id ON changes(action_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urls_updated_at BEFORE UPDATE ON urls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE changes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - will be enhanced with auth)
CREATE POLICY "Users can view their own sites" ON sites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sites" ON sites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sites" ON sites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view urls for their sites" ON urls
    FOR SELECT USING (
        site_id IN (
            SELECT id FROM sites WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert urls for their sites" ON urls
    FOR INSERT WITH CHECK (
        site_id IN (
            SELECT id FROM sites WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update urls for their sites" ON urls
    FOR UPDATE USING (
        site_id IN (
            SELECT id FROM sites WHERE user_id = auth.uid()
        )
    );

-- Similar policies for other tables...
CREATE POLICY "Users can view metrics for their urls" ON metrics
    FOR SELECT USING (
        url_id IN (
            SELECT u.id FROM urls u
            JOIN sites s ON u.site_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert metrics for their urls" ON metrics
    FOR INSERT WITH CHECK (
        url_id IN (
            SELECT u.id FROM urls u
            JOIN sites s ON u.site_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view actions for their urls" ON actions
    FOR SELECT USING (
        url_id IN (
            SELECT u.id FROM urls u
            JOIN sites s ON u.site_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert actions for their urls" ON actions
    FOR INSERT WITH CHECK (
        url_id IN (
            SELECT u.id FROM urls u
            JOIN sites s ON u.site_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update actions for their urls" ON actions
    FOR UPDATE USING (
        url_id IN (
            SELECT u.id FROM urls u
            JOIN sites s ON u.site_id = s.id
            WHERE s.user_id = auth.uid()
        )
    );
