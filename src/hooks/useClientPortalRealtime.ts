import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to subscribe to real-time updates for a client portal
 * When the creator changes projects, assets, requests, or chatbots,
 * the client portal will automatically refresh
 */
export function useClientPortalRealtime(projectId: string, onUpdate: () => void) {
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`client-portal-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        () => {
          console.log('Project updated');
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          console.log('Assets updated');
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chatbots',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          console.log('Chatbot updated');
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          console.log('Requests updated');
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          console.log('Analytics updated');
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, onUpdate]);
}



