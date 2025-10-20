# Real-Time Analytics System Documentation

## Overview

The TourCompanion application now features a comprehensive real-time analytics system that automatically synchronizes data across all dashboards when analytics are imported, modified, or reset.

## Key Features

### 1. Real-Time Data Synchronization
- **Automatic Updates**: All dashboards update automatically when analytics data changes
- **Debounced Refresh**: Changes are debounced by 1 second to prevent excessive API calls
- **Client-Specific Updates**: Client dashboards only update when data for that specific client changes

### 2. Dual Analytics Storage
- **Original Analytics Table**: Stores standard analytics data (`analytics`)
- **Imported Analytics Table**: Stores imported CSV/Excel data (`imported_analytics`)
- **Combined Display**: Both data sources are combined and displayed together

### 3. Import System
- **File Support**: CSV and Excel (.xlsx, .xls) files
- **Data Validation**: Automatic validation of imported data format
- **Client Association**: Imported data is automatically associated with the correct client
- **Visual Feedback**: Real-time preview of imported data before confirmation

## Database Schema

### Analytics Table (`public.analytics`)
```sql
CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  end_client_id UUID REFERENCES public.end_clients(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  date DATE NOT NULL
);
```

### Imported Analytics Table (`public.imported_analytics`)
```sql
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

## Real-Time Subscriptions

### Components with Real-Time Updates

#### 1. Client Management Dashboard (`useCreatorDashboard`)
- **Tables Monitored**: `analytics`, `imported_analytics`, `end_clients`, `chatbots`
- **Updates**: Total views, unique visitors, engagement time, leads, conversion rate, satisfaction
- **Channel**: `creator-dashboard-updates`

#### 2. Project Cards (`useCreatorDashboardFast`)
- **Tables Monitored**: `analytics`, `imported_analytics`, `projects`, `end_clients`
- **Updates**: Individual project metrics, dashboard statistics
- **Channel**: `fast-dashboard-updates`

#### 3. Recent Activity Feed (`useRecentActivity`)
- **Tables Monitored**: `analytics`, `imported_analytics`, `projects`, `chatbots`
- **Updates**: Activity timeline, recent changes
- **Channel**: `recent-activity-updates`

#### 4. Client Dashboard (`ClientDashboard`)
- **Tables Monitored**: `analytics`, `imported_analytics` (filtered by client)
- **Updates**: Client-specific analytics, charts, metrics
- **Channel**: `client-dashboard-updates`

## Import Data Format

### CSV Format
```csv
date,resource_code,pv,uv,duration,avg_duration
2025-10-14,5DBkbNlOKsgYp3T9mg,1,1,75,75
2025-09-30,5DBkbNlOKsgYp3T9mg,1,1,102,102
```

### Excel Format
Same columns as CSV format.

### Required Fields
- **date**: Date in YYYY-MM-DD format
- **resource_code**: Unique identifier for the resource
- **pv**: Page views (integer)
- **uv**: Unique visitors (integer)
- **duration**: Total duration in seconds (integer)
- **avg_duration**: Average duration in seconds (integer)

## Usage Guide

### Importing Analytics Data

1. **Navigate to Client Dashboard**
   - Go to the client management section
   - Select a client
   - Click "Import Data" button

2. **Select File**
   - Choose CSV or Excel file
   - File size limit: 10MB
   - Supported formats: .csv, .xlsx, .xls

3. **Review Data**
   - Preview imported data
   - Verify metrics and dates
   - Confirm import

4. **Real-Time Updates**
   - All dashboards update automatically
   - No page refresh required
   - Changes visible immediately

### Resetting Analytics Data

1. **Access Reset Function**
   - Click "Reset Analytics" button
   - Confirm deletion in popup dialog

2. **Data Removal**
   - Deletes from both `analytics` and `imported_analytics` tables
   - Removes all client-specific data
   - Clears charts and visualizations

3. **Real-Time Updates**
   - All dashboards show zeros immediately
   - Charts clear automatically
   - Activity feed shows reset event

## Technical Implementation

### Real-Time Subscription Setup
```typescript
const channel = supabase
  .channel('dashboard-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'analytics',
  }, (payload) => {
    debouncedRefresh();
  })
  .subscribe();
```

### Debounced Refresh Pattern
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

### Data Combination Logic
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
    // ... similar for uv and avg_duration
  });
}
```

## Security & Permissions

### Row Level Security (RLS) Policies

#### Analytics Table
- **Creators can view**: Their own clients' analytics
- **Creators can insert**: Analytics for their clients
- **Public can view**: Analytics for client portal access

#### Imported Analytics Table
- **Creators can view**: Their own imported analytics
- **Creators can insert**: Imported analytics for their clients
- **Creators can delete**: Their own imported analytics
- **Public can view**: Imported analytics for client portal access

## Performance Considerations

### Caching Strategy
- **30-second cache** for dashboard data
- **Force refresh** on real-time updates
- **Debounced updates** to prevent excessive API calls

### Database Optimization
- **Indexes** on `end_client_id` and `project_id`
- **Composite indexes** for common query patterns
- **Efficient joins** for related data

## Troubleshooting

### Common Issues

#### 1. Real-Time Updates Not Working
- **Check**: Supabase real-time is enabled
- **Verify**: User has proper permissions
- **Debug**: Check browser console for subscription errors

#### 2. Import Data Not Showing
- **Verify**: File format matches required schema
- **Check**: Data validation passed
- **Confirm**: Import completed successfully

#### 3. Reset Not Working
- **Check**: User has delete permissions
- **Verify**: Client ID is correct
- **Debug**: Check database constraints

### Debug Logging
All components include comprehensive logging:
- `[CreatorDashboard]` - Main dashboard updates
- `[Fast Dashboard]` - Project cards updates
- `[RecentActivity]` - Activity feed updates
- `[ClientDashboard]` - Client-specific updates

## Future Enhancements

### Planned Features
1. **Bulk Import**: Multiple files at once
2. **Data Export**: Export analytics to CSV/Excel
3. **Advanced Filtering**: Date ranges, metric types
4. **Data Validation**: Enhanced validation rules
5. **Audit Trail**: Track all import/reset operations

### Performance Improvements
1. **Incremental Updates**: Only update changed data
2. **WebSocket Optimization**: Reduce connection overhead
3. **Data Compression**: Compress large datasets
4. **Background Processing**: Async data processing

## Support

For technical support or questions about the real-time analytics system:
- Check browser console for error messages
- Verify database permissions and RLS policies
- Ensure Supabase real-time is properly configured
- Review import file format and validation rules


