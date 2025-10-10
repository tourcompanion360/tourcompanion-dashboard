import React from 'react';
import StatsChart from './StatsChart';
import DashboardHeader from './dashboard/DashboardHeader';
import CSVUpload from './dashboard/CSVUpload';
import AnalyticsKPI from './AnalyticsKPI';
import ConversationalIntelligence from './ConversationalIntelligence';
import useDashboardData from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { metrics, chartData, handleCSVUpload, hasData, csvData } = useDashboardData();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* CSV Upload Controls */}
      <div className="flex justify-start items-center">
        <CSVUpload onUpload={handleCSVUpload} dataCount={csvData.length} />
      </div>

      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Analytics KPI Cards */}
      <AnalyticsKPI />

      {/* Charts Section */}
      <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
        <StatsChart data={hasData ? chartData : undefined} />
      </div>

      {/* Conversational Intelligence */}
      <ConversationalIntelligence />
    </div>
  );
};
export default Dashboard;