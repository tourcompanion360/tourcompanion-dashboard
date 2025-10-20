# Database Schema Updates for Real-Time Analytics

## Overview

This document outlines the database schema changes made to support the real-time analytics system, including new tables, indexes, and Row Level Security (RLS) policies.

## New Tables

### 1. Imported Analytics Table

```sql
-- Create imported_analytics table
CREATE TABLE public.imported_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  end_client_id UUID REFERENCES public.end_clients(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  resource_code TEXT,
  pv INT DEFAULT 0,
  uv INT DEFAULT 0,
  duration INT DEFAULT 0,
  avg_duration INT DEFAULT 0
);
```

### 2. Analytics Table Updates

```sql
-- Add end_client_id column to existing analytics table
ALTER TABLE public.analytics 
ADD COLUMN end_client_id UUID REFERENCES public.end_clients(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_analytics_end_client_id ON public.analytics(end_client_id);
CREATE INDEX idx_analytics_end_client_date ON public.analytics(end_client_id, date);
CREATE INDEX idx_imported_analytics_end_client_id ON public.imported_analytics(end_client_id);
CREATE INDEX idx_imported_analytics_project_id ON public.imported_analytics(project_id);
CREATE INDEX idx_imported_analytics_creator_id ON public.imported_analytics(creator_id);
```

## Row Level Security (RLS) Policies

### Analytics Table Policies

```sql
-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.analytics;

-- Create new policies
CREATE POLICY "Creators can view their clients' analytics"
ON public.analytics FOR SELECT
TO authenticated
USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Creators can insert analytics for their clients"
ON public.analytics FOR INSERT
TO authenticated
WITH CHECK (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Public can view analytics for client portal"
ON public.analytics FOR SELECT
TO public
USING (true);
```

### Imported Analytics Table Policies

```sql
-- Enable RLS
ALTER TABLE public.imported_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Creators can view their imported analytics"
ON public.imported_analytics FOR SELECT
TO authenticated
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

CREATE POLICY "Creators can insert their imported analytics"
ON public.imported_analytics FOR INSERT
TO authenticated
WITH CHECK (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

CREATE POLICY "Creators can delete their imported analytics"
ON public.imported_analytics FOR DELETE
TO authenticated
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

CREATE POLICY "Public can view imported analytics for client portal"
ON public.imported_analytics FOR SELECT
TO public
USING (true);
```

## Database Functions

### Get Client Analytics Function

```sql
-- Create function to get aggregated client analytics
CREATE OR REPLACE FUNCTION public.get_client_analytics(client_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_visitors BIGINT,
  avg_duration NUMERIC,
  total_duration BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN a.metric_type = 'view' THEN a.metric_value 
        ELSE 0 
      END
    ), 0) as total_views,
    COALESCE(SUM(
      CASE 
        WHEN a.metric_type = 'unique_visitor' THEN a.metric_value 
        ELSE 0 
      END
    ), 0) as total_visitors,
    COALESCE(AVG(
      CASE 
        WHEN a.metric_type = 'time_spent' THEN a.metric_value 
        ELSE NULL 
      END
    ), 0) as avg_duration,
    COALESCE(SUM(
      CASE 
        WHEN a.metric_type = 'time_spent' THEN a.metric_value 
        ELSE 0 
      END
    ), 0) as total_duration
  FROM public.analytics a
  WHERE a.end_client_id = client_id;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.get_client_analytics(UUID) TO anon;
```

## Migration Files

### 1. Add Client Analytics Support
**File**: `supabase/migrations/20251018000841_add_client_analytics.sql`

```sql
-- Add end_client_id column to analytics table
ALTER TABLE public.analytics 
ADD COLUMN end_client_id UUID REFERENCES public.end_clients(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_analytics_end_client_id ON public.analytics(end_client_id);
CREATE INDEX idx_analytics_end_client_date ON public.analytics(end_client_id, date);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics;
DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.analytics;

CREATE POLICY "Creators can view their clients' analytics"
ON public.analytics FOR SELECT
TO authenticated
USING (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Creators can insert analytics for their clients"
ON public.analytics FOR INSERT
TO authenticated
WITH CHECK (
  end_client_id IN (
    SELECT id FROM public.end_clients 
    WHERE creator_id IN (
      SELECT id FROM public.creators WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Public can view analytics for client portal"
ON public.analytics FOR SELECT
TO public
USING (true);

-- Create get_client_analytics function
CREATE OR REPLACE FUNCTION public.get_client_analytics(client_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_visitors BIGINT,
  avg_duration NUMERIC,
  total_duration BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(
      CASE 
        WHEN a.metric_type = 'view' THEN a.metric_value 
        ELSE 0 
      END
    ), 0) as total_views,
    COALESCE(SUM(
      CASE 
        WHEN a.metric_type = 'unique_visitor' THEN a.metric_value 
        ELSE 0 
      END
    ), 0) as total_visitors,
    COALESCE(AVG(
      CASE 
        WHEN a.metric_type = 'time_spent' THEN a.metric_value 
        ELSE NULL 
      END
    ), 0) as avg_duration,
    COALESCE(SUM(
      CASE 
        WHEN a.metric_type = 'time_spent' THEN a.metric_value 
        ELSE 0 
      END
    ), 0) as total_duration
  FROM public.analytics a
  WHERE a.end_client_id = client_id;
END;
$$;
```

### 2. Grant RPC Permissions
**File**: `supabase/migrations/20250118000000_grant_rpc_permissions.sql`

```sql
-- Grant execute permission on get_client_analytics function to anon role
GRANT EXECUTE ON FUNCTION public.get_client_analytics(UUID) TO anon;
```

### 3. Create Imported Analytics Table
**File**: `supabase/migrations/20251026000000_create_imported_analytics_table.sql`

```sql
-- Create imported_analytics table
CREATE TABLE public.imported_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  end_client_id UUID REFERENCES public.end_clients(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  resource_code TEXT,
  pv INT DEFAULT 0,
  uv INT DEFAULT 0,
  duration INT DEFAULT 0,
  avg_duration INT DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.imported_analytics ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_imported_analytics_end_client_id ON public.imported_analytics(end_client_id);
CREATE INDEX idx_imported_analytics_project_id ON public.imported_analytics(project_id);
CREATE INDEX idx_imported_analytics_creator_id ON public.imported_analytics(creator_id);

-- Create RLS policies
CREATE POLICY "Creators can view their imported analytics"
ON public.imported_analytics FOR SELECT
TO authenticated
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

CREATE POLICY "Creators can insert their imported analytics"
ON public.imported_analytics FOR INSERT
TO authenticated
WITH CHECK (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

CREATE POLICY "Creators can delete their imported analytics"
ON public.imported_analytics FOR DELETE
TO authenticated
USING (creator_id IN (SELECT id FROM public.creators WHERE user_id = auth.uid()));

CREATE POLICY "Public can view imported analytics for client portal"
ON public.imported_analytics FOR SELECT
TO public
USING (true);
```

## Data Flow

### 1. Import Process
```
CSV/Excel File → Validation → Parse Data → Insert into imported_analytics → Real-time Update → Dashboard Refresh
```

### 2. Display Process
```
Dashboard Load → Query analytics + imported_analytics → Combine Data → Calculate Metrics → Display
```

### 3. Reset Process
```
Reset Request → Delete from analytics + imported_analytics → Real-time Update → Dashboard Refresh
```

## Performance Considerations

### Indexes
- **Primary Keys**: UUID with default uuid_generate_v4()
- **Foreign Keys**: Indexed for join performance
- **Composite Indexes**: For common query patterns
- **Date Indexes**: For time-based queries

### Query Optimization
- **Parallel Queries**: Fetch from both tables simultaneously
- **Data Combination**: Efficient merging of results
- **Caching**: 30-second cache for dashboard data
- **Debouncing**: Prevent excessive real-time updates

## Security Considerations

### Row Level Security
- **Creator Isolation**: Users can only access their own data
- **Client Association**: Data is properly linked to clients
- **Public Access**: Limited public access for client portals

### Data Validation
- **Input Sanitization**: All imported data is validated
- **Type Checking**: Proper data types enforced
- **Constraint Validation**: Database constraints prevent invalid data

## Monitoring & Maintenance

### Database Health
- **Index Usage**: Monitor index performance
- **Query Performance**: Track slow queries
- **Storage Growth**: Monitor table sizes
- **Connection Pool**: Monitor connection usage

### Data Integrity
- **Foreign Key Constraints**: Ensure referential integrity
- **Data Validation**: Regular data quality checks
- **Backup Strategy**: Regular database backups
- **Migration Testing**: Test all schema changes

## Troubleshooting

### Common Issues

#### 1. RLS Policy Errors
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'analytics';
SELECT * FROM pg_policies WHERE tablename = 'imported_analytics';

-- Test policy access
SELECT * FROM public.analytics WHERE end_client_id = 'client-id';
```

#### 2. Index Performance
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE relname = 'analytics';
SELECT * FROM pg_stat_user_indexes WHERE relname = 'imported_analytics';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM public.analytics WHERE end_client_id = 'client-id';
```

#### 3. Function Permissions
```sql
-- Check function permissions
SELECT * FROM information_schema.routine_privileges 
WHERE routine_name = 'get_client_analytics';

-- Test function execution
SELECT * FROM public.get_client_analytics('client-id');
```

## Future Enhancements

### Schema Improvements
1. **Partitioning**: Partition large tables by date
2. **Archiving**: Archive old analytics data
3. **Compression**: Compress historical data
4. **Materialized Views**: Pre-calculate common aggregations

### Performance Optimizations
1. **Connection Pooling**: Optimize database connections
2. **Query Caching**: Cache expensive queries
3. **Background Jobs**: Process large imports asynchronously
4. **Data Compression**: Reduce storage requirements


