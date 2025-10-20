# 🤖 **CURSOR PROMPT: Admin Dashboard - Technical Architecture & Data Flow**

## **PROJECT OVERVIEW**
You need to build a comprehensive admin dashboard for managing chatbot requests with proper technical architecture, data flow connections, and database integrations. This focuses on the technical implementation, data flow, and system architecture.

## **CURRENT SYSTEM STATUS**

### ✅ **What's Already Working:**
- **Database**: Complete `chatbot_requests` table with all required fields
- **Basic Admin Component**: `src/components/AdminChatbotRequests.tsx` exists
- **Database Schema**: All fields properly configured with relationships
- **Creator Integration**: Form submission and request tracking working

### ❌ **What Needs Technical Enhancement:**
- **Data Flow Architecture**: Proper state management and data flow
- **Database Connections**: Optimized queries and real-time subscriptions
- **API Layer**: Centralized data access and business logic
- **Real-Time System**: WebSocket connections and live updates
- **Caching Strategy**: Performance optimization and data caching
- **Error Handling**: Robust error management and recovery
- **Type Safety**: Complete TypeScript implementation

---

## **TECHNICAL ARCHITECTURE**

### **1. Data Flow Architecture**

```typescript
// Data Flow Diagram
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin UI      │    │   API Layer     │    │   Database      │
│   Components    │◄──►│   Services      │◄──►│   Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   State Mgmt    │    │   Real-Time     │    │   RLS Policies  │
│   Zustand/Redux │    │   Subscriptions │    │   & Security    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **2. Database Connection Strategy**

**File:** `src/services/adminService.ts`
```typescript
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Admin-specific Supabase client with elevated permissions
const adminSupabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ADMIN_KEY!, // Admin service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// RPC function for admin access (bypasses RLS)
export const getAdminChatbotRequests = async () => {
  const { data, error } = await supabase.rpc('get_all_chatbot_requests');
  if (error) throw error;
  return data;
};

// Direct admin queries (bypass RLS)
export const adminQueries = {
  // Get all requests with full relationships
  getAllRequests: async () => {
    const { data, error } = await adminSupabase
      .from('chatbot_requests')
      .select(`
        *,
        projects!inner(
          id,
          title,
          description,
          end_clients!inner(
            id,
            name,
            email,
            company,
            creators!inner(
              id,
              agency_name,
              contact_email,
              user_id
            )
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update request status with admin notes
  updateRequestStatus: async (requestId: string, updates: {
    status: string;
    admin_notes?: string;
    chatbot_link?: string;
    estimated_completion_date?: string;
  }) => {
    const { data, error } = await adminSupabase
      .from('chatbot_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Bulk operations
  bulkUpdateRequests: async (requestIds: string[], updates: any) => {
    const { data, error } = await adminSupabase
      .from('chatbot_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', requestIds)
      .select();
    
    if (error) throw error;
    return data;
  }
};
```

### **3. Real-Time Data Flow**

**File:** `src/hooks/useAdminRealTime.ts`
```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealTimeData {
  requests: ChatbotRequest[];
  lastUpdated: Date;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  newRequestsCount: number;
}

export const useAdminRealTime = () => {
  const [data, setData] = useState<RealTimeData>({
    requests: [],
    lastUpdated: new Date(),
    connectionStatus: 'disconnected',
    newRequestsCount: 0
  });

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Initialize real-time subscription
  useEffect(() => {
    const setupRealTime = async () => {
      // Create channel for chatbot_requests table
      const newChannel = supabase
        .channel('admin_chatbot_requests')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_requests'
        }, (payload) => {
          console.log('New request received:', payload);
          setData(prev => ({
            ...prev,
            requests: [payload.new, ...prev.requests],
            newRequestsCount: prev.newRequestsCount + 1,
            lastUpdated: new Date()
          }));
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chatbot_requests'
        }, (payload) => {
          console.log('Request updated:', payload);
          setData(prev => ({
            ...prev,
            requests: prev.requests.map(req => 
              req.id === payload.new.id ? payload.new : req
            ),
            lastUpdated: new Date()
          }));
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'chatbot_requests'
        }, (payload) => {
          console.log('Request deleted:', payload);
          setData(prev => ({
            ...prev,
            requests: prev.requests.filter(req => req.id !== payload.old.id),
            lastUpdated: new Date()
          }));
        })
        .subscribe((status) => {
          console.log('Real-time status:', status);
          setData(prev => ({
            ...prev,
            connectionStatus: status === 'SUBSCRIBED' ? 'connected' : 'disconnected'
          }));
        });

      setChannel(newChannel);
    };

    setupRealTime();

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    try {
      const requests = await adminQueries.getAllRequests();
      setData(prev => ({
        ...prev,
        requests,
        lastUpdated: new Date(),
        newRequestsCount: 0
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, []);

  return {
    ...data,
    refreshData,
    clearNewRequestsCount: () => setData(prev => ({ ...prev, newRequestsCount: 0 }))
  };
};
```

### **4. State Management Architecture**

**File:** `src/store/adminStore.ts`
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AdminState {
  // Data
  requests: ChatbotRequest[];
  selectedRequests: string[];
  filters: {
    searchTerm: string;
    statusFilter: string;
    priorityFilter: string;
    dateRange: { from: Date | null; to: Date | null };
    creatorFilter: string;
  };
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedRequest: ChatbotRequest | null;
  showBulkActions: boolean;
  
  // Actions
  setRequests: (requests: ChatbotRequest[]) => void;
  addRequest: (request: ChatbotRequest) => void;
  updateRequest: (id: string, updates: Partial<ChatbotRequest>) => void;
  removeRequest: (id: string) => void;
  
  // Selection
  selectRequest: (id: string) => void;
  deselectRequest: (id: string) => void;
  selectAllRequests: () => void;
  clearSelection: () => void;
  
  // Filters
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  setCreatorFilter: (creator: string) => void;
  clearFilters: () => void;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedRequest: (request: ChatbotRequest | null) => void;
  setShowBulkActions: (show: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        requests: [],
        selectedRequests: [],
        filters: {
          searchTerm: '',
          statusFilter: 'all',
          priorityFilter: 'all',
          dateRange: { from: null, to: null },
          creatorFilter: 'all'
        },
        loading: false,
        error: null,
        selectedRequest: null,
        showBulkActions: false,

        // Data actions
        setRequests: (requests) => set({ requests }),
        addRequest: (request) => set((state) => ({ 
          requests: [request, ...state.requests] 
        })),
        updateRequest: (id, updates) => set((state) => ({
          requests: state.requests.map(req => 
            req.id === id ? { ...req, ...updates } : req
          )
        })),
        removeRequest: (id) => set((state) => ({
          requests: state.requests.filter(req => req.id !== id)
        })),

        // Selection actions
        selectRequest: (id) => set((state) => ({
          selectedRequests: [...state.selectedRequests, id],
          showBulkActions: true
        })),
        deselectRequest: (id) => set((state) => ({
          selectedRequests: state.selectedRequests.filter(reqId => reqId !== id),
          showBulkActions: state.selectedRequests.length > 1
        })),
        selectAllRequests: () => set((state) => ({
          selectedRequests: state.requests.map(req => req.id),
          showBulkActions: true
        })),
        clearSelection: () => set({ 
          selectedRequests: [], 
          showBulkActions: false 
        }),

        // Filter actions
        setSearchTerm: (term) => set((state) => ({
          filters: { ...state.filters, searchTerm: term }
        })),
        setStatusFilter: (status) => set((state) => ({
          filters: { ...state.filters, statusFilter: status }
        })),
        setPriorityFilter: (priority) => set((state) => ({
          filters: { ...state.filters, priorityFilter: priority }
        })),
        setDateRange: (range) => set((state) => ({
          filters: { ...state.filters, dateRange: range }
        })),
        setCreatorFilter: (creator) => set((state) => ({
          filters: { ...state.filters, creatorFilter: creator }
        })),
        clearFilters: () => set((state) => ({
          filters: {
            searchTerm: '',
            statusFilter: 'all',
            priorityFilter: 'all',
            dateRange: { from: null, to: null },
            creatorFilter: 'all'
          }
        })),

        // UI actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setSelectedRequest: (request) => set({ selectedRequest: request }),
        setShowBulkActions: (show) => set({ showBulkActions: show })
      }),
      {
        name: 'admin-store',
        partialize: (state) => ({ 
          filters: state.filters 
        })
      }
    ),
    { name: 'AdminStore' }
  )
);
```

### **5. Database Schema Enhancements**

**File:** `supabase/migrations/20250119000002_enhance_admin_features.sql`
```sql
-- Add admin activity tracking
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES chatbot_requests(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'status_change', 'note_added', 'bulk_action', etc.
  details JSONB, -- Additional action details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_requests_status_created ON chatbot_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_requests_priority ON chatbot_requests(priority);
CREATE INDEX IF NOT EXISTS idx_chatbot_requests_creator ON chatbot_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_request ON admin_activity_log(request_id);

-- Enhanced RPC function for admin access
CREATE OR REPLACE FUNCTION get_all_chatbot_requests()
RETURNS TABLE (
  id UUID,
  project_id UUID,
  end_client_id UUID,
  title TEXT,
  description TEXT,
  request_type TEXT,
  priority TEXT,
  status TEXT,
  chatbot_name TEXT,
  chatbot_purpose TEXT,
  target_audience TEXT,
  language TEXT,
  website_url TEXT,
  existing_content TEXT,
  specific_questions TEXT,
  business_info TEXT,
  tone TEXT,
  response_style TEXT,
  special_instructions TEXT,
  preferred_contact_method TEXT,
  timeline TEXT,
  additional_notes TEXT,
  file_links TEXT,
  uploaded_files JSONB,
  admin_notes TEXT,
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  chatbot_url TEXT,
  chatbot_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  project_title TEXT,
  client_name TEXT,
  client_email TEXT,
  client_company TEXT,
  creator_agency TEXT,
  creator_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.project_id,
    cr.end_client_id,
    cr.title,
    cr.description,
    cr.request_type,
    cr.priority,
    cr.status,
    cr.chatbot_name,
    cr.chatbot_purpose,
    cr.target_audience,
    cr.language,
    cr.website_url,
    cr.existing_content,
    cr.specific_questions,
    cr.business_info,
    cr.tone,
    cr.response_style,
    cr.special_instructions,
    cr.preferred_contact_method,
    cr.timeline,
    cr.additional_notes,
    cr.file_links,
    cr.uploaded_files,
    cr.admin_notes,
    cr.estimated_completion_date,
    cr.chatbot_url,
    cr.chatbot_link,
    cr.created_at,
    cr.updated_at,
    p.title as project_title,
    ec.name as client_name,
    ec.email as client_email,
    ec.company as client_company,
    c.agency_name as creator_agency,
    c.contact_email as creator_email
  FROM chatbot_requests cr
  INNER JOIN projects p ON cr.project_id = p.id
  INNER JOIN end_clients ec ON cr.end_client_id = ec.id
  INNER JOIN creators c ON ec.creator_id = c.id
  ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_chatbot_requests() TO authenticated;
```

### **6. API Layer with Error Handling**

**File:** `src/services/adminApi.ts`
```typescript
import { adminQueries } from './adminService';
import { useAdminStore } from '@/store/adminStore';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

class AdminApiService {
  private retryCount = 3;
  private retryDelay = 1000;

  // Generic API call with retry logic
  private async apiCall<T>(
    operation: () => Promise<T>,
    retries = this.retryCount
  ): Promise<ApiResponse<T>> {
    try {
      const data = await operation();
      return { data, error: null, loading: false };
    } catch (error: any) {
      console.error('API Error:', error);
      
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.apiCall(operation, retries - 1);
      }
      
      return { 
        data: null, 
        error: error.message || 'An unexpected error occurred',
        loading: false 
      };
    }
  }

  private isRetryableError(error: any): boolean {
    return error.code === 'PGRST301' || // Connection error
           error.code === 'PGRST116' || // Timeout
           error.message?.includes('network');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Request management
  async getAllRequests(): Promise<ApiResponse<ChatbotRequest[]>> {
    return this.apiCall(() => adminQueries.getAllRequests());
  }

  async updateRequestStatus(
    requestId: string, 
    updates: any
  ): Promise<ApiResponse<ChatbotRequest>> {
    return this.apiCall(() => 
      adminQueries.updateRequestStatus(requestId, updates)
    );
  }

  async bulkUpdateRequests(
    requestIds: string[], 
    updates: any
  ): Promise<ApiResponse<ChatbotRequest[]>> {
    return this.apiCall(() => 
      adminQueries.bulkUpdateRequests(requestIds, updates)
    );
  }

  // Analytics
  async getRequestAnalytics(): Promise<ApiResponse<any>> {
    return this.apiCall(async () => {
      const { data, error } = await supabase.rpc('get_request_analytics');
      if (error) throw error;
      return data;
    });
  }
}

export const adminApi = new AdminApiService();
```

### **7. Real-Time Integration Hook**

**File:** `src/hooks/useAdminDashboard.ts`
```typescript
import { useEffect, useCallback } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { useAdminRealTime } from './useAdminRealTime';
import { adminApi } from '@/services/adminApi';

export const useAdminDashboard = () => {
  const {
    requests,
    setRequests,
    addRequest,
    updateRequest,
    removeRequest,
    setLoading,
    setError,
    clearSelection
  } = useAdminStore();

  const {
    requests: realTimeRequests,
    connectionStatus,
    newRequestsCount,
    refreshData,
    clearNewRequestsCount
  } = useAdminRealTime();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const response = await adminApi.getAllRequests();
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setRequests(response.data);
      }
      setLoading(false);
    };

    loadInitialData();
  }, [setRequests, setLoading, setError]);

  // Sync real-time data with store
  useEffect(() => {
    if (realTimeRequests.length > 0) {
      setRequests(realTimeRequests);
    }
  }, [realTimeRequests, setRequests]);

  // Status update function
  const updateRequestStatus = useCallback(async (
    requestId: string,
    updates: {
      status: string;
      admin_notes?: string;
      chatbot_link?: string;
      estimated_completion_date?: string;
    }
  ) => {
    const response = await adminApi.updateRequestStatus(requestId, updates);
    
    if (response.error) {
      setError(response.error);
      return false;
    }
    
    if (response.data) {
      updateRequest(requestId, response.data);
      return true;
    }
    
    return false;
  }, [updateRequest, setError]);

  // Bulk operations
  const bulkUpdateRequests = useCallback(async (
    requestIds: string[],
    updates: any
  ) => {
    const response = await adminApi.bulkUpdateRequests(requestIds, updates);
    
    if (response.error) {
      setError(response.error);
      return false;
    }
    
    if (response.data) {
      response.data.forEach(request => {
        updateRequest(request.id, request);
      });
      clearSelection();
      return true;
    }
    
    return false;
  }, [updateRequest, setError, clearSelection]);

  return {
    requests,
    connectionStatus,
    newRequestsCount,
    updateRequestStatus,
    bulkUpdateRequests,
    refreshData,
    clearNewRequestsCount
  };
};
```

### **8. Performance Optimization**

**File:** `src/utils/performance.ts`
```typescript
import { useMemo } from 'react';
import { ChatbotRequest } from '@/types/admin';

// Memoized filtering and sorting
export const useFilteredRequests = (
  requests: ChatbotRequest[],
  filters: any
) => {
  return useMemo(() => {
    let filtered = [...requests];

    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(request =>
        request.chatbot_name?.toLowerCase().includes(term) ||
        request.client_name?.toLowerCase().includes(term) ||
        request.project_title?.toLowerCase().includes(term) ||
        request.creator_agency?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === filters.statusFilter);
    }

    // Priority filter
    if (filters.priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === filters.priorityFilter);
    }

    // Date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at);
        return requestDate >= filters.dateRange.from && requestDate <= filters.dateRange.to;
      });
    }

    // Creator filter
    if (filters.creatorFilter !== 'all') {
      filtered = filtered.filter(request => request.creator_agency === filters.creatorFilter);
    }

    return filtered;
  }, [requests, filters]);
};

// Virtual scrolling for large lists
export const useVirtualizedList = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const totalHeight = items.length * itemHeight;
    
    return {
      visibleCount,
      totalHeight,
      getVisibleItems: (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleCount, items.length);
        
        return {
          items: items.slice(startIndex, endIndex),
          startIndex,
          endIndex
        };
      }
    };
  }, [items, itemHeight, containerHeight]);
};
```

### **9. TypeScript Types**

**File:** `src/types/admin.ts`
```typescript
export interface ChatbotRequest {
  id: string;
  project_id: string;
  end_client_id: string;
  
  // Required fields from base schema
  title: string;
  description: string;
  request_type: 'hotspot_update' | 'content_change' | 'design_modification' | 'new_feature' | 'bug_fix';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  
  // Chatbot-specific fields
  chatbot_name?: string;
  chatbot_purpose?: string;
  target_audience?: string;
  language?: string;
  website_url?: string;
  existing_content?: string;
  specific_questions?: string;
  business_info?: string;
  tone?: string;
  response_style?: string;
  special_instructions?: string;
  preferred_contact_method?: string;
  timeline?: string;
  additional_notes?: string;
  file_links?: string;
  uploaded_files?: any[];
  
  // Admin fields
  admin_notes?: string;
  estimated_completion_date?: string;
  chatbot_url?: string;
  chatbot_link?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations (fetched via joins)
  project_title?: string;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  creator_agency?: string;
  creator_email?: string;
}

export interface AdminFilters {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  dateRange: { from: Date | null; to: Date | null };
  creatorFilter: string;
}

export interface BulkAction {
  type: 'start_work' | 'reject' | 'complete' | 'export';
  requestIds: string[];
  data?: any;
}

export interface AdminAnalytics {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  averageCompletionTime: number;
  requestsThisWeek: number;
  requestsThisMonth: number;
  topCreators: Array<{ name: string; count: number }>;
  priorityDistribution: Record<string, number>;
}
```

### **10. Main Admin Dashboard Component**

**File:** `src/components/admin/AdminDashboard.tsx`
```typescript
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAdminStore } from '@/store/adminStore';
import { useFilteredRequests } from '@/utils/performance';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';

const AdminDashboard = () => {
  const {
    requests,
    connectionStatus,
    newRequestsCount,
    updateRequestStatus,
    bulkUpdateRequests,
    refreshData,
    clearNewRequestsCount
  } = useAdminDashboard();

  const {
    filters,
    selectedRequests,
    showBulkActions,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    selectAllRequests,
    clearSelection
  } = useAdminStore();

  const filteredRequests = useFilteredRequests(requests, filters);

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRequests.length === 0) return;

    switch (action) {
      case 'start_work':
        await bulkUpdateRequests(selectedRequests, { status: 'in_progress' });
        break;
      case 'reject':
        await bulkUpdateRequests(selectedRequests, { status: 'rejected' });
        break;
      case 'export':
        // Export logic here
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage chatbot requests from tour creators
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {connectionStatus}
            </span>
          </div>

          {/* New Requests Notification */}
          {newRequestsCount > 0 && (
            <Button
              variant="outline"
              onClick={clearNewRequestsCount}
              className="relative"
            >
              <Bell className="h-4 w-4 mr-2" />
              {newRequestsCount} New
            </Button>
          )}

          {/* Refresh Button */}
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={filters.searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedRequests.length} requests selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction('start_work')}
                >
                  Start Work
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('reject')}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onStatusUpdate={updateRequestStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
```

---

## **IMPLEMENTATION CHECKLIST**

### **Database Layer:**
- [ ] Create admin activity log table
- [ ] Add performance indexes
- [ ] Create enhanced RPC functions
- [ ] Set up proper RLS policies
- [ ] Configure real-time subscriptions

### **API Layer:**
- [ ] Implement admin service with elevated permissions
- [ ] Add retry logic and error handling
- [ ] Create bulk operation endpoints
- [ ] Add analytics queries
- [ ] Implement caching strategy

### **State Management:**
- [ ] Set up Zustand store
- [ ] Implement real-time data sync
- [ ] Add filter and selection state
- [ ] Create action dispatchers
- [ ] Add persistence layer

### **Real-Time System:**
- [ ] Configure WebSocket connections
- [ ] Implement live data updates
- [ ] Add connection status monitoring
- [ ] Create notification system
- [ ] Handle reconnection logic

### **Performance:**
- [ ] Implement virtual scrolling
- [ ] Add data caching
- [ ] Optimize database queries
- [ ] Add loading states
- [ ] Implement error boundaries

---

## **REQUIRED DEPENDENCIES**

```json
{
  "zustand": "^4.4.7",
  "recharts": "^2.8.0",
  "xlsx": "^0.18.5",
  "jspdf": "^2.5.1",
  "date-fns": "^2.30.0",
  "react-hot-toast": "^2.4.1",
  "framer-motion": "^10.16.4"
}
```

---

**This technical architecture provides a robust, scalable foundation for the admin dashboard with proper data flow, real-time updates, and performance optimization.**


