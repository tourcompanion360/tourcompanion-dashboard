# Component Architecture for Real-Time Analytics

## Overview

This document outlines the component architecture and data flow for the real-time analytics system in TourCompanion.

## Component Hierarchy

```
App.tsx
├── Layout.tsx
│   ├── Sidebar Navigation
│   └── Main Content Area
├── ClientManagement.tsx (Dashboard)
│   ├── useCreatorDashboard Hook
│   ├── Analytics Cards
│   └── Client List
├── TourVirtuali.tsx (Project Overview)
│   ├── useCreatorDashboardFast Hook
│   ├── Project Cards
│   └── Dashboard Statistics
├── ClientDashboard.tsx (Individual Client)
│   ├── Import/Reset Functionality
│   ├── Analytics Display
│   └── Charts & Visualizations
└── ClientPortalAnalytics.tsx (Public Client Portal)
    ├── Real-time Data Loading
    ├── Analytics Display
    └── Contact Information
```

## Data Flow Architecture

### 1. Real-Time Data Flow

```
Database Changes → Supabase Real-time → Component Subscriptions → State Updates → UI Re-render
```

### 2. Import Data Flow

```
File Upload → Validation → Parse Data → Database Insert → Real-time Trigger → Dashboard Updates
```

### 3. Reset Data Flow

```
Reset Request → Database Delete → Real-time Trigger → Dashboard Updates → UI Clear
```

## Core Hooks

### 1. useCreatorDashboard

**Purpose**: Main dashboard data management with real-time updates

**Location**: `src/hooks/useCreatorDashboard.ts`

**Features**:
- Loads creator, clients, projects, chatbots, leads, analytics, requests, assets
- Real-time subscriptions for all related tables
- Debounced refresh to prevent excessive API calls
- Combines data from both `analytics` and `imported_analytics` tables

**Real-time Subscriptions**:
```typescript
const channel = supabase
  .channel('creator-dashboard-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics' })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'imported_analytics' })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'end_clients' })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'chatbots' })
  .subscribe();
```

**Data Combination Logic**:
```typescript
// Combine analytics from both tables
const allAnalytics = [];

// Add original analytics data
if (analyticsResult.data) {
  allAnalytics.push(...analyticsResult.data);
}

// Add imported analytics data (convert to same format)
if (importedResult.data) {
  importedResult.data.forEach(item => {
    if (item.pv > 0) {
      allAnalytics.push({
        id: `${item.id}_pv`,
        metric_type: 'view',
        metric_value: item.pv,
        date: item.date,
        project_id: item.project_id,
        end_client_id: item.end_client_id
      });
    }
    // Similar for uv and avg_duration
  });
}
```

### 2. useCreatorDashboardFast

**Purpose**: Optimized dashboard data for project cards and statistics

**Location**: `src/hooks/useCreatorDashboardFast.ts`

**Features**:
- Fast data loading with caching
- Real-time subscriptions for analytics updates
- Enhanced with mock data for demonstration
- Optimized for performance

**Caching Strategy**:
```typescript
const CACHE_DURATION = 30000; // 30 seconds cache

// Check cache first (unless force refresh)
if (!forceRefresh && dataCache.data && dataCache.userId === userId) {
  const cacheAge = Date.now() - dataCache.timestamp;
  if (cacheAge < CACHE_DURATION) {
    console.log('📦 [Fast Dashboard] Using cached data');
    setData(dataCache.data);
    return;
  }
}
```

### 3. useRecentActivity

**Purpose**: Recent activity feed with real-time updates

**Location**: `src/hooks/useRecentActivity.ts`

**Features**:
- Loads recent projects, chatbots, analytics, requests
- Real-time subscriptions for activity updates
- Filters activities by client, project, or creator
- Combines data from both analytics tables

**Activity Processing**:
```typescript
// Convert analytics to activities
allAnalytics?.forEach(analytics => {
  let title = '';
  let description = '';
  let icon = { component: 'BarChart3', color: 'text-blue-600', bgColor: 'bg-blue-100' };

  if (analytics.metric_type === 'view') {
    title = `${analytics.metric_value} views on "${analytics.projects.title}"`;
    description = `Project received traffic`;
    icon = { component: 'Eye', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  }
  // Similar for other metric types
});
```

## Component Architecture

### 1. ClientManagement Component

**Location**: `src/components/ClientManagement.tsx`

**Responsibilities**:
- Display client management dashboard
- Show analytics overview cards
- List all clients with their metrics
- Handle client selection

**Data Sources**:
- `useCreatorDashboard` hook for main data
- `useRecentActivity` hook for activity feed
- Real-time updates for all metrics

**Key Features**:
```typescript
const { clients: realClients, projects, analytics, isLoading, error, refreshData } = useCreatorDashboard(user?.id || '');

// Filter clients to only show those with at least one active project
const clientsWithProjects = clients.filter(client => {
  const hasProjects = projects?.some(project => project.end_client_id === client.id);
  return hasProjects;
});

// Calculate dashboard statistics
const dashboardStats = useMemo(() => {
  const totalViews = analytics
    .filter(a => a.metric_type === 'view')
    .reduce((sum, a) => sum + a.metric_value, 0);
  
  const totalVisitors = analytics
    .filter(a => a.metric_type === 'unique_visitor')
    .reduce((sum, a) => sum + a.metric_value, 0);
  
  // Similar calculations for other metrics
}, [analytics]);
```

### 2. TourVirtuali Component

**Location**: `src/components/TourVirtuali.tsx`

**Responsibilities**:
- Display project overview dashboard
- Show project cards with metrics
- Display dashboard statistics
- Handle project interactions

**Data Sources**:
- `useCreatorDashboardFast` hook for optimized data
- Real-time updates for project metrics

**Key Features**:
```typescript
const { clients, projects, chatbots, analytics, isLoading, error, refreshData } = useCreatorDashboardFast(user?.id || '');

// Calculate project analytics
const projectAnalytics = useMemo(() => {
  return projects.map(project => {
    const projectAnalytics = analytics.filter(a => a.project_id === project.id);
    
    const totalViews = projectAnalytics
      .filter(a => a.metric_type === 'view')
      .reduce((sum, a) => sum + a.metric_value, 0);
    
    const uniqueVisitors = projectAnalytics
      .filter(a => a.metric_type === 'unique_visitor')
      .reduce((sum, a) => sum + a.metric_value, 0);
    
    // Similar calculations for other metrics
    
    return {
      ...project,
      analytics: {
        totalViews,
        uniqueVisitors,
        avgSessionDuration,
        conversionRate
      }
    };
  });
}, [projects, analytics]);
```

### 3. ClientDashboard Component

**Location**: `src/components/ClientDashboard.tsx`

**Responsibilities**:
- Display individual client dashboard
- Handle data import functionality
- Handle data reset functionality
- Show client-specific analytics

**Data Sources**:
- Direct database queries for client data
- Real-time subscriptions for analytics updates
- Import/reset functionality

**Key Features**:
```typescript
// Real-time subscriptions for client-specific updates
useEffect(() => {
  if (!client?.id) return;

  const channel = supabase
    .channel('client-dashboard-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'analytics',
      filter: `end_client_id=eq.${client.id}`,
    }, (payload) => {
      debouncedRefresh();
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'imported_analytics',
      filter: `end_client_id=eq.${client.id}`,
    }, (payload) => {
      debouncedRefresh();
    })
    .subscribe();

  return () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
  };
}, [client?.id, debouncedRefresh]);
```

### 4. Import/Reset Dialogs

**ImportAnalyticsDialog**: `src/components/ImportAnalyticsDialog.tsx`
- File selection and validation
- Data preview and confirmation
- Import progress tracking

**ResetAnalyticsDialog**: `src/components/ResetAnalyticsDialog.tsx`
- Confirmation dialog for data reset
- Progress tracking during reset
- Success/error feedback

## State Management

### 1. Local State

Each component manages its own local state for:
- Loading states
- Error states
- UI interactions
- Form data

### 2. Shared State

Shared state is managed through:
- React Context (AgencyProvider, NotificationProvider)
- Custom hooks with real-time subscriptions
- Supabase real-time channels

### 3. Data Flow

```
Database → Supabase Real-time → Custom Hooks → Component State → UI Updates
```

## Performance Optimizations

### 1. Debounced Updates

All real-time updates are debounced to prevent excessive API calls:

```typescript
const debouncedRefresh = useCallback(() => {
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }
  debounceTimeoutRef.current = setTimeout(() => {
    fetchData(true); // Force refresh
  }, 1000); // 1 second debounce
}, [fetchData]);
```

### 2. Caching Strategy

Fast dashboard hook implements caching:

```typescript
const CACHE_DURATION = 30000; // 30 seconds cache

// Check cache first (unless force refresh)
if (!forceRefresh && dataCache.data && dataCache.userId === userId) {
  const cacheAge = Date.now() - dataCache.timestamp;
  if (cacheAge < CACHE_DURATION) {
    setData(dataCache.data);
    return;
  }
}
```

### 3. Parallel Queries

Data is fetched in parallel where possible:

```typescript
const [analyticsResult, importedResult] = await Promise.all([
  supabase.from('analytics').select('*').in('project_id', projectIds),
  supabase.from('imported_analytics').select('*').in('project_id', projectIds)
]);
```

## Error Handling

### 1. Component Level

Each component handles errors gracefully:

```typescript
try {
  // Data operations
} catch (error) {
  console.error('Error:', error);
  setData(prev => ({
    ...prev,
    isLoading: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
  }));
}
```

### 2. Hook Level

Custom hooks provide error states:

```typescript
const [data, setData] = useState({
  // ... other state
  error: null,
});

// Error handling in fetch operations
if (error) {
  setData(prev => ({
    ...prev,
    error: error.message,
    isLoading: false,
  }));
}
```

### 3. Real-time Error Handling

Real-time subscriptions include error handling:

```typescript
.subscribe((status) => {
  console.log('Subscription status:', status);
  if (status === 'SUBSCRIBED') {
    console.log('Successfully subscribed to real-time updates');
  } else if (status === 'CHANNEL_ERROR') {
    console.error('Real-time subscription error');
  }
});
```

## Testing Strategy

### 1. Unit Tests

Test individual components and hooks:
- Data loading and error states
- Real-time subscription setup
- Data combination logic
- Import/reset functionality

### 2. Integration Tests

Test component interactions:
- Real-time updates across components
- Data flow between components
- Error propagation

### 3. End-to-End Tests

Test complete user workflows:
- Import data and verify updates
- Reset data and verify clearing
- Real-time synchronization

## Future Enhancements

### 1. Component Improvements

- **Virtual Scrolling**: For large client lists
- **Lazy Loading**: Load data on demand
- **Progressive Enhancement**: Graceful degradation

### 2. Performance Optimizations

- **Memoization**: Optimize expensive calculations
- **Code Splitting**: Load components on demand
- **Service Workers**: Offline functionality

### 3. User Experience

- **Loading States**: Better loading indicators
- **Error Recovery**: Automatic retry mechanisms
- **Accessibility**: Improved screen reader support


