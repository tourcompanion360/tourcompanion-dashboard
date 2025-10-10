import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Creator, EndClient, Project, Chatbot, Lead, Analytics, Request, Asset } from '@/integrations/supabase/types';

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

export const useCreatorDashboard = (userId: string | null) => {
  const [data, setData] = useState<CreatorDashboardData>({
    creator: null,
    clients: [],
    projects: [],
    chatbots: [],
    leads: [],
    analytics: [],
    requests: [],
    assets: [],
    stats: {
      totalClients: 0,
      totalProjects: 0,
      totalChatbots: 0,
      totalLeads: 0,
      totalViews: 0,
      activeProjects: 0,
    },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchCreatorData = async () => {
      try {
        setData(prev => ({ ...prev, isLoading: true, error: null }));

        // Get creator profile
        const { data: creator, error: creatorError } = await supabase
          .from('creators')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (creatorError) {
          throw new Error(`Failed to fetch creator: ${creatorError.message}`);
        }

        if (!creator) {
          throw new Error('Creator profile not found');
        }

        // Fetch end clients first
        const { data: clients, error: clientsError } = await supabase
          .from('end_clients')
          .select('*')
          .eq('creator_id', creator.id)
          .order('created_at', { ascending: false });

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        }

        const clientIds = clients?.map(c => c.id) || [];

        // Fetch projects for the clients
        const { data: projects, error: projectsError } = clientIds.length > 0
          ? await supabase
              .from('projects')
              .select('*')
              .in('end_client_id', clientIds)
              .order('created_at', { ascending: false })
          : { data: [], error: null };

        const projectIds = projects?.map(p => p.id) || [];

        // Fetch all related data in parallel
        const [
          { data: chatbots, error: chatbotsError },
          { data: leads, error: leadsError },
          { data: analytics, error: analyticsError },
          { data: requests, error: requestsError },
          { data: assets, error: assetsError },
        ] = await Promise.all([
          // Chatbots - query by project IDs
          projectIds.length > 0
            ? supabase
                .from('chatbots')
                .select('*')
                .in('project_id', projectIds)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null }),

          // Leads - query by chatbot IDs (need to fetch chatbots first, but for simplicity, skip for now)
          Promise.resolve({ data: [], error: null }),

          // Analytics - query by project IDs
          projectIds.length > 0
            ? supabase
                .from('analytics')
                .select('*')
                .in('project_id', projectIds)
                .order('date', { ascending: false })
            : Promise.resolve({ data: [], error: null }),

          // Requests - query by project IDs
          projectIds.length > 0
            ? supabase
                .from('requests')
                .select('*')
                .in('project_id', projectIds)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [], error: null }),

          // Assets - query by creator ID
          supabase
            .from('assets')
            .select('*')
            .eq('creator_id', creator.id)
            .order('created_at', { ascending: false }),
        ]);

        // Check for errors
        if (clientsError) throw new Error(`Failed to fetch clients: ${clientsError.message}`);
        if (projectsError) throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        if (chatbotsError) throw new Error(`Failed to fetch chatbots: ${chatbotsError.message}`);
        if (leadsError) throw new Error(`Failed to fetch leads: ${leadsError.message}`);
        if (analyticsError) throw new Error(`Failed to fetch analytics: ${analyticsError.message}`);
        if (requestsError) throw new Error(`Failed to fetch requests: ${requestsError.message}`);
        if (assetsError) throw new Error(`Failed to fetch assets: ${assetsError.message}`);

        // Calculate statistics
        const totalViews = analytics
          ?.filter(a => a.metric_type === 'view')
          .reduce((sum, a) => sum + a.metric_value, 0) || 0;

        const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

        setData({
          creator,
          clients: clients || [],
          projects: projects || [],
          chatbots: chatbots || [],
          leads: leads || [],
          analytics: analytics || [],
          requests: requests || [],
          assets: assets || [],
          stats: {
            totalClients: clients?.length || 0,
            totalProjects: projects?.length || 0,
            totalChatbots: chatbots?.length || 0,
            totalLeads: leads?.length || 0,
            totalViews,
            activeProjects,
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching creator dashboard data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        }));
      }
    };

    fetchCreatorData();
  }, [userId]);

  // Helper functions
  const getProjectsForClient = (clientId: string) => {
    return data.projects.filter(p => p.end_client_id === clientId);
  };

  const getChatbotsForProject = (projectId: string) => {
    return data.chatbots.filter(cb => cb.project_id === projectId);
  };

  const getLeadsForChatbot = (chatbotId: string) => {
    return data.leads.filter(l => l.chatbot_id === chatbotId);
  };

  const getRecentLeads = (limit: number = 10) => {
    return data.leads.slice(0, limit);
  };

  const getPendingRequests = () => {
    return data.requests.filter(r => r.status === 'open' || r.status === 'in_progress');
  };

  const refreshData = async () => {
    if (!userId) return;
    
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Get creator profile
      const { data: creator, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (creatorError || !creator) {
        throw new Error('Failed to fetch creator');
      }

      // Fetch end clients first
      const { data: clients, error: clientsError } = await supabase
        .from('end_clients')
        .select('*')
        .eq('creator_id', creator.id)
        .order('created_at', { ascending: false });

      const clientIds = clients?.map(c => c.id) || [];

      // Fetch projects for the clients
      const { data: projects, error: projectsError } = clientIds.length > 0
        ? await supabase
            .from('projects')
            .select('*')
            .in('end_client_id', clientIds)
            .order('created_at', { ascending: false })
        : { data: [], error: null };

      const projectIds = projects?.map(p => p.id) || [];

      // Fetch all related data in parallel
      const [
        { data: chatbots },
        { data: analytics },
        { data: requests },
        { data: assets },
      ] = await Promise.all([
        projectIds.length > 0
          ? supabase.from('chatbots').select('*').in('project_id', projectIds).order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        projectIds.length > 0
          ? supabase.from('analytics').select('*').in('project_id', projectIds).order('date', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        projectIds.length > 0
          ? supabase.from('requests').select('*').in('project_id', projectIds).order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase.from('assets').select('*').eq('creator_id', creator.id).order('created_at', { ascending: false }),
      ]);

      // Calculate statistics
      const totalViews = analytics
        ?.filter(a => a.metric_type === 'view')
        .reduce((sum, a) => sum + a.metric_value, 0) || 0;

      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;

      setData({
        creator,
        clients: clients || [],
        projects: projects || [],
        chatbots: chatbots || [],
        leads: [],
        analytics: analytics || [],
        requests: requests || [],
        assets: assets || [],
        stats: {
          totalClients: clients?.length || 0,
          totalProjects: projects?.length || 0,
          totalChatbots: chatbots?.length || 0,
          totalLeads: 0,
          totalViews,
          activeProjects,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
      }));
    }
  };

  return {
    ...data,
    getProjectsForClient,
    getChatbotsForProject,
    getLeadsForChatbot,
    getRecentLeads,
    getPendingRequests,
    refreshData,
  };
};
