import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, TrendingUp, Eye, Users, Clock } from 'lucide-react';

interface ClientPortalAnalyticsProps {
  projectId: string;
}

const ClientPortalAnalytics: React.FC<ClientPortalAnalyticsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    avgTimeSpent: 0,
    totalInteractions: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [projectId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get all analytics for this project (RLS will automatically filter by project_id)
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: true });

      if (error) throw error;

      setAnalytics(data || []);

      // Calculate stats
      const totalViews = data?.filter(a => a.metric_type === 'view').reduce((sum, a) => sum + a.metric_value, 0) || 0;
      const uniqueVisitors = data?.filter(a => a.metric_type === 'unique_visitor').reduce((sum, a) => sum + a.metric_value, 0) || 0;
      const timeSpentRecords = data?.filter(a => a.metric_type === 'time_spent') || [];
      const avgTimeSpent = timeSpentRecords.length > 0
        ? timeSpentRecords.reduce((sum, a) => sum + a.metric_value, 0) / timeSpentRecords.length
        : 0;
      const totalInteractions = data?.filter(a => a.metric_type === 'chatbot_interaction').reduce((sum, a) => sum + a.metric_value, 0) || 0;
      const totalHotspotClicks = data?.filter(a => a.metric_type === 'hotspot_click').reduce((sum, a) => sum + a.metric_value, 0) || 0;
      const totalLeads = data?.filter(a => a.metric_type === 'lead_generated').reduce((sum, a) => sum + a.metric_value, 0) || 0;

      setStats({
        totalViews,
        uniqueVisitors,
        avgTimeSpent: Math.round(avgTimeSpent),
        totalInteractions,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group analytics by date for charts
  const chartData = analytics.reduce((acc: any[], item) => {
    const existing = acc.find(d => d.date === item.date);
    if (existing) {
      existing[item.metric_type] = (existing[item.metric_type] || 0) + item.metric_value;
    } else {
      acc.push({
        date: item.date,
        [item.metric_type]: item.metric_value,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalViews > 0 ? 'Great engagement!' : 'No views yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.uniqueVisitors > 0 ? 'Growing audience' : 'Waiting for visitors'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTimeSpent}s</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgTimeSpent > 30 ? 'Excellent engagement' : 'Building engagement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalInteractions > 0 ? 'Active engagement' : 'No interactions yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Daily views and unique visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="view" stroke="#8884d8" name="Views" />
                  <Line type="monotone" dataKey="unique_visitor" stroke="#82ca9d" name="Unique Visitors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>Interactions and engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="chatbot_interaction" fill="#8884d8" name="Chatbot Interactions" />
                  <Bar dataKey="hotspot_click" fill="#82ca9d" name="Hotspot Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No analytics data yet</h3>
              <p className="text-muted-foreground">
                Analytics will appear here once your virtual tour starts receiving visitors.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientPortalAnalytics;



