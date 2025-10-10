import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, MousePointer, TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TEXT } from '@/constants/text';
import { useToast } from '@/hooks/use-toast';

interface KPIData {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  conversionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  viewsChange: number;
  visitorsChange: number;
  clicksChange: number;
  conversionChange: number;
}

const AnalyticsKPI: React.FC = () => {
  const { toast } = useToast();
  const [kpiData, setKpiData] = useState<KPIData>({
    totalViews: 0,
    uniqueVisitors: 0,
    totalClicks: 0,
    conversionRate: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    viewsChange: 0,
    visitorsChange: 0,
    clicksChange: 0,
    conversionChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadKPIData();
  }, [timeRange]);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setDate(endDate.getDate() - 365);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Fetch analytics data from Supabase
      const { data: analyticsData, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate KPIs from the data
      const totalViews = analyticsData?.reduce((sum, record) => sum + (record.views || 0), 0) || 0;
      const uniqueVisitors = analyticsData?.reduce((sum, record) => sum + (record.unique_visitors || 0), 0) || 0;
      const totalClicks = analyticsData?.reduce((sum, record) => sum + (record.clicks || 0), 0) || 0;
      const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      const avgSessionDuration = analyticsData && analyticsData.length > 0 
        ? analyticsData.reduce((sum, record) => sum + (record.session_duration || 0), 0) / analyticsData.length 
        : 0;
      const bounceRate = analyticsData && analyticsData.length > 0 
        ? analyticsData.reduce((sum, record) => sum + (record.bounce_rate || 0), 0) / analyticsData.length 
        : 0;

      // Calculate changes (simplified - in real app, compare with previous period)
      const viewsChange = 0; // Production ready - no random data
      const visitorsChange = 0; // Production ready - no random data
      const clicksChange = 0; // Production ready - no random data
      const conversionChange = 0; // Production ready - no random data

      setKpiData({
        totalViews,
        uniqueVisitors,
        totalClicks,
        conversionRate,
        avgSessionDuration,
        bounceRate,
        viewsChange,
        visitorsChange,
        clicksChange,
        conversionChange
      });
    } catch (error) {
      console.error('Error loading KPI data:', error);
      setError(TEXT.ANALYTICS.ERROR_LOADING_ANALYTICS);
      toast({
        title: TEXT.TOAST.ERROR,
        description: TEXT.ANALYTICS.ERROR_LOADING_ANALYTICS,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) {
      return '0m 0s';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const kpiCards = [
    {
      title: TEXT.ANALYTICS.TOTAL_VIEWS,
      value: formatNumber(kpiData.totalViews),
      change: kpiData.viewsChange,
      icon: Eye,
      description: TEXT.ANALYTICS.PAGE_VIEWS_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.UNIQUE_VISITORS,
      value: formatNumber(kpiData.uniqueVisitors),
      change: kpiData.visitorsChange,
      icon: Users,
      description: TEXT.ANALYTICS.DISTINCT_USERS_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.TOTAL_CLICKS,
      value: formatNumber(kpiData.totalClicks),
      change: kpiData.clicksChange,
      icon: MousePointer,
      description: TEXT.ANALYTICS.INTERACTIVE_CLICKS_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.CONVERSION_RATE,
      value: isNaN(kpiData.conversionRate) ? '0.0%' : `${kpiData.conversionRate.toFixed(1)}%`,
      change: kpiData.conversionChange,
      icon: BarChart3,
      description: TEXT.ANALYTICS.CLICKS_PER_VIEW_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.AVG_SESSION_DURATION,
      value: formatDuration(kpiData.avgSessionDuration),
      change: 0, // Production ready - no random data
      icon: Clock,
      description: TEXT.ANALYTICS.AVG_TIME_SESSION_DESCRIPTION
    },
    {
      title: TEXT.ANALYTICS.BOUNCE_RATE,
      value: isNaN(kpiData.bounceRate) ? '0.0%' : `${kpiData.bounceRate.toFixed(1)}%`,
      change: 0, // Production ready - no random data
      icon: TrendingDown,
      description: TEXT.ANALYTICS.SINGLE_PAGE_SESSIONS_DESCRIPTION
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{TEXT.ANALYTICS.PERFORMANCE_ANALYTICS}</h2>
            <p className="text-foreground-secondary">{TEXT.ANALYTICS.KEY_METRICS}</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <Button
                key={range}
                variant="outline"
                size="sm"
                disabled
              >
                {range === '7d' ? TEXT.ANALYTICS.LAST_7_DAYS : 
                 range === '30d' ? TEXT.ANALYTICS.LAST_30_DAYS : 
                 range === '90d' ? TEXT.ANALYTICS.LAST_90_DAYS : 
                 TEXT.ANALYTICS.LAST_YEAR}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{TEXT.ANALYTICS.PERFORMANCE_ANALYTICS}</h2>
            <p className="text-foreground-secondary">{TEXT.ANALYTICS.KEY_METRICS}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-destructive mb-2">{error}</div>
              <Button onClick={loadKPIData} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{TEXT.ANALYTICS.PERFORMANCE_ANALYTICS}</h2>
          <p className="text-foreground-secondary">{TEXT.ANALYTICS.KEY_METRICS}</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? TEXT.ANALYTICS.LAST_7_DAYS : 
               range === '30d' ? TEXT.ANALYTICS.LAST_30_DAYS : 
               range === '90d' ? TEXT.ANALYTICS.LAST_90_DAYS : 
               TEXT.ANALYTICS.LAST_YEAR}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </div>
                <Badge 
                  variant={card.change >= 0 ? 'default' : 'secondary'}
                  className={`${getChangeColor(card.change)} flex items-center gap-1`}
                >
                  {getChangeIcon(card.change)}
                  {Math.abs(card.change).toFixed(1)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsKPI;
