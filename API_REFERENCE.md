# API Reference for Real-Time Analytics System

## Overview

This document provides a comprehensive API reference for the real-time analytics system, including database operations, real-time subscriptions, and component interfaces.

## Database API

### Analytics Table Operations

#### Insert Analytics Data

```typescript
// Insert single analytics record
const { data, error } = await supabase
  .from('analytics')
  .insert({
    project_id: 'project-uuid',
    end_client_id: 'client-uuid',
    metric_type: 'view',
    metric_value: 100,
    date: '2025-10-18'
  });

// Insert multiple analytics records
const { data, error } = await supabase
  .from('analytics')
  .insert([
    {
      project_id: 'project-uuid',
      end_client_id: 'client-uuid',
      metric_type: 'view',
      metric_value: 100,
      date: '2025-10-18'
    },
    {
      project_id: 'project-uuid',
      end_client_id: 'client-uuid',
      metric_type: 'unique_visitor',
      metric_value: 50,
      date: '2025-10-18'
    }
  ]);
```

#### Query Analytics Data

```typescript
// Get analytics for specific client
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('end_client_id', 'client-uuid')
  .order('date', { ascending: false });

// Get analytics for specific project
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('project_id', 'project-uuid')
  .order('date', { ascending: false });

// Get analytics with date range
const { data, error } = await supabase
  .from('analytics')
  .select('*')
  .eq('end_client_id', 'client-uuid')
  .gte('date', '2025-10-01')
  .lte('date', '2025-10-31')
  .order('date', { ascending: false });
```

#### Delete Analytics Data

```typescript
// Delete analytics for specific client
const { error } = await supabase
  .from('analytics')
  .delete()
  .eq('end_client_id', 'client-uuid');

// Delete analytics for specific project
const { error } = await supabase
  .from('analytics')
  .delete()
  .eq('project_id', 'project-uuid');

// Delete specific analytics record
const { error } = await supabase
  .from('analytics')
  .delete()
  .eq('id', 'analytics-uuid');
```

### Imported Analytics Table Operations

#### Insert Imported Analytics Data

```typescript
// Insert single imported analytics record
const { data, error } = await supabase
  .from('imported_analytics')
  .insert({
    project_id: 'project-uuid',
    end_client_id: 'client-uuid',
    creator_id: 'creator-uuid',
    date: '2025-10-18',
    resource_code: 'ABC123',
    pv: 100,
    uv: 50,
    duration: 300,
    avg_duration: 150
  });

// Insert multiple imported analytics records
const { data, error } = await supabase
  .from('imported_analytics')
  .insert([
    {
      project_id: 'project-uuid',
      end_client_id: 'client-uuid',
      creator_id: 'creator-uuid',
      date: '2025-10-18',
      resource_code: 'ABC123',
      pv: 100,
      uv: 50,
      duration: 300,
      avg_duration: 150
    },
    {
      project_id: 'project-uuid',
      end_client_id: 'client-uuid',
      creator_id: 'creator-uuid',
      date: '2025-10-17',
      resource_code: 'ABC123',
      pv: 80,
      uv: 40,
      duration: 250,
      avg_duration: 125
    }
  ]);
```

#### Query Imported Analytics Data

```typescript
// Get imported analytics for specific client
const { data, error } = await supabase
  .from('imported_analytics')
  .select('*')
  .eq('end_client_id', 'client-uuid')
  .order('date', { ascending: false });

// Get imported analytics for specific project
const { data, error } = await supabase
  .from('imported_analytics')
  .select('*')
  .eq('project_id', 'project-uuid')
  .order('date', { ascending: false });

// Get imported analytics for specific creator
const { data, error } = await supabase
  .from('imported_analytics')
  .select('*')
  .eq('creator_id', 'creator-uuid')
  .order('date', { ascending: false });
```

#### Delete Imported Analytics Data

```typescript
// Delete imported analytics for specific client
const { error } = await supabase
  .from('imported_analytics')
  .delete()
  .eq('end_client_id', 'client-uuid');

// Delete imported analytics for specific project
const { error } = await supabase
  .from('imported_analytics')
  .delete()
  .eq('project_id', 'project-uuid');

// Delete imported analytics for specific creator
const { error } = await supabase
  .from('imported_analytics')
  .delete()
  .eq('creator_id', 'creator-uuid');
```

## Real-Time Subscriptions API

### Basic Real-Time Subscription

```typescript
// Create a real-time channel
const channel = supabase
  .channel('analytics-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analytics'
  }, (payload) => {
    console.log('Analytics change:', payload);
    // Handle the change
  })
  .subscribe();

// Clean up subscription
supabase.removeChannel(channel);
```

### Filtered Real-Time Subscriptions

```typescript
// Subscribe to changes for specific client
const channel = supabase
  .channel('client-analytics-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analytics',
    filter: `end_client_id=eq.${clientId}`
  }, (payload) => {
    console.log('Client analytics change:', payload);
    // Handle the change
  })
  .subscribe();

// Subscribe to changes for specific project
const channel = supabase
  .channel('project-analytics-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analytics',
    filter: `project_id=eq.${projectId}`
  }, (payload) => {
    console.log('Project analytics change:', payload);
    // Handle the change
  })
  .subscribe();
```

### Multiple Table Subscriptions

```typescript
// Subscribe to multiple tables
const channel = supabase
  .channel('dashboard-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analytics'
  }, (payload) => {
    console.log('Analytics change:', payload);
    handleAnalyticsChange(payload);
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'imported_analytics'
  }, (payload) => {
    console.log('Imported analytics change:', payload);
    handleImportedAnalyticsChange(payload);
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects'
  }, (payload) => {
    console.log('Project change:', payload);
    handleProjectChange(payload);
  })
  .subscribe();
```

## Custom Hooks API

### useCreatorDashboard Hook

```typescript
interface CreatorDashboardData {
  creator: Creator | null;
  clients: EndClient[];
  projects: Project[];
  chatbots: Chatbot[];
  leads: Lead[];
  analytics: Analytics[];
  requests: Request[];
  assets: Asset[];
  stats: {
    totalClients: number;
    totalProjects: number;
    totalChatbots: number;
    totalLeads: number;
    totalViews: number;
    activeProjects: number;
  };
  isLoading: boolean;
  error: string | null;
}

const useCreatorDashboard = (userId: string) => {
  const { 
    creator, 
    clients, 
    projects, 
    chatbots, 
    leads, 
    analytics, 
    requests, 
    assets, 
    stats, 
    isLoading, 
    error 
  } = useCreatorDashboard(userId);
  
  return {
    creator,
    clients,
    projects,
    chatbots,
    leads,
    analytics,
    requests,
    assets,
    stats,
    isLoading,
    error
  };
};
```

### useCreatorDashboardFast Hook

```typescript
interface DashboardData {
  creator: Creator | null;
  clients: Client[];
  projects: Project[];
  chatbots: Chatbot[];
  analytics: Analytics[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

const useCreatorDashboardFast = (userId: string) => {
  const { 
    creator, 
    clients, 
    projects, 
    chatbots, 
    analytics, 
    isLoading, 
    error, 
    refreshData 
  } = useCreatorDashboardFast(userId);
  
  return {
    creator,
    clients,
    projects,
    chatbots,
    analytics,
    isLoading,
    error,
    refreshData
  };
};
```

### useRecentActivity Hook

```typescript
interface UseRecentActivityOptions {
  clientId?: string;
  projectId?: string;
  creatorId?: string;
  limit?: number;
  filters?: ActivityFilters;
}

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
  icon: {
    component: string;
    color: string;
    bgColor: string;
  };
  priority: 'high' | 'medium' | 'low';
}

const useRecentActivity = (options: UseRecentActivityOptions = {}) => {
  const { 
    activities, 
    loading, 
    error, 
    refresh 
  } = useRecentActivity({
    clientId: 'client-uuid',
    projectId: 'project-uuid',
    creatorId: 'creator-uuid',
    limit: 50
  });
  
  return {
    activities,
    loading,
    error,
    refresh
  };
};
```

## Component Props API

### ClientDashboard Component

```typescript
interface ClientDashboardProps {
  client?: Client;
  onBack?: () => void;
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  client, 
  onBack 
}) => {
  // Component implementation
};
```

### ImportAnalyticsDialog Component

```typescript
interface ImportAnalyticsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[], projectName: string) => void;
  client: Client;
}

const ImportAnalyticsDialog: React.FC<ImportAnalyticsDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  client
}) => {
  // Component implementation
};
```

### ResetAnalyticsDialog Component

```typescript
interface ResetAnalyticsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => Promise<void>;
  client: Client;
}

const ResetAnalyticsDialog: React.FC<ResetAnalyticsDialogProps> = ({
  isOpen,
  onClose,
  onReset,
  client
}) => {
  // Component implementation
};
```

## Database Functions API

### get_client_analytics Function

```sql
-- Function signature
CREATE OR REPLACE FUNCTION public.get_client_analytics(client_id UUID)
RETURNS TABLE (
  total_views BIGINT,
  total_visitors BIGINT,
  avg_duration NUMERIC,
  total_duration BIGINT
)
```

```typescript
// Usage in TypeScript
const { data, error } = await supabase
  .rpc('get_client_analytics', { client_id: 'client-uuid' });

if (data) {
  const { total_views, total_visitors, avg_duration, total_duration } = data[0];
  console.log('Client analytics:', {
    totalViews: total_views,
    totalVisitors: total_visitors,
    avgDuration: avg_duration,
    totalDuration: total_duration
  });
}
```

## Error Handling API

### Standard Error Response

```typescript
interface ErrorResponse {
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
}

// Example error handling
try {
  const { data, error } = await supabase
    .from('analytics')
    .insert(analyticsData);
    
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data;
} catch (error) {
  console.error('Analytics insert error:', error);
  throw error;
}
```

### Real-Time Subscription Error Handling

```typescript
const channel = supabase
  .channel('analytics-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analytics'
  }, (payload) => {
    console.log('Analytics change:', payload);
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to analytics updates');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to analytics updates');
    } else if (status === 'TIMED_OUT') {
      console.error('Analytics subscription timed out');
    } else if (status === 'CLOSED') {
      console.log('Analytics subscription closed');
    }
  });
```

## File Import API

### CSV Import

```typescript
// Parse CSV file
import Papa from 'papaparse';

const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Usage
const handleFileImport = async (file: File) => {
  try {
    const data = await parseCSV(file);
    console.log('Parsed CSV data:', data);
  } catch (error) {
    console.error('CSV import error:', error);
  }
};
```

### Excel Import

```typescript
// Parse Excel file
import * as XLSX from 'xlsx';

const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

// Usage
const handleFileImport = async (file: File) => {
  try {
    const data = await parseExcel(file);
    console.log('Parsed Excel data:', data);
  } catch (error) {
    console.error('Excel import error:', error);
  }
};
```

## Performance Monitoring API

### Query Performance Monitoring

```typescript
// Monitor query performance
const monitorQuery = async (queryName: string, queryFn: () => Promise<any>) => {
  const startTime = performance.now();
  
  try {
    const result = await queryFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Query ${queryName} completed in ${duration.toFixed(2)}ms`);
    
    if (duration > 1000) {
      console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`Query ${queryName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// Usage
const result = await monitorQuery('getClientAnalytics', async () => {
  return await supabase
    .from('analytics')
    .select('*')
    .eq('end_client_id', clientId);
});
```

### Real-Time Subscription Monitoring

```typescript
// Monitor real-time subscription health
const monitorSubscription = (channel: any, channelName: string) => {
  let lastActivity = Date.now();
  let isHealthy = true;
  
  const healthCheck = setInterval(() => {
    const timeSinceLastActivity = Date.now() - lastActivity;
    
    if (timeSinceLastActivity > 30000) { // 30 seconds
      if (isHealthy) {
        console.warn(`Real-time subscription ${channelName} appears to be inactive`);
        isHealthy = false;
      }
    } else {
      if (!isHealthy) {
        console.log(`Real-time subscription ${channelName} is active again`);
        isHealthy = true;
      }
    }
  }, 10000); // Check every 10 seconds
  
  // Update last activity on any event
  channel.on('postgres_changes', () => {
    lastActivity = Date.now();
  });
  
  return () => {
    clearInterval(healthCheck);
  };
};
```

## Security API

### Row Level Security (RLS) Policies

```sql
-- Check current RLS policies
SELECT * FROM pg_policies WHERE tablename = 'analytics';
SELECT * FROM pg_policies WHERE tablename = 'imported_analytics';

-- Test RLS policy access
SELECT * FROM public.analytics WHERE end_client_id = 'client-uuid';
SELECT * FROM public.imported_analytics WHERE end_client_id = 'client-uuid';
```

### Permission Checking

```typescript
// Check if user has permission to access client data
const checkClientAccess = async (clientId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('end_clients')
    .select(`
      id,
      creators!inner(
        user_id
      )
    `)
    .eq('id', clientId)
    .eq('creators.user_id', userId)
    .single();
    
  if (error) {
    console.error('Client access check failed:', error);
    return false;
  }
  
  return !!data;
};

// Usage
const hasAccess = await checkClientAccess('client-uuid', 'user-uuid');
if (!hasAccess) {
  throw new Error('Access denied: You do not have permission to access this client data');
}
```


