import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AgencySettings {
  agency_name: string;
  agency_logo: string;
  current_user_email: string;
}

interface AgencyContextType {
  agencySettings: AgencySettings;
  loading: boolean;
  updateAgencySettings: (settings: Partial<AgencySettings>) => Promise<void>;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (context === undefined) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    agency_name: 'TourCompanion',
    agency_logo: '/tourcompanion-logo.png',
    current_user_email: 'user@example.com'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgencySettings();
  }, []);

  const loadAgencySettings = async () => {
    try {
      // For now, we'll use default values since we removed auth
      // In a real implementation, this would fetch from user profile
      setAgencySettings({
        agency_name: 'TourCompanion',
        agency_logo: '/tourcompanion-logo.png',
        current_user_email: 'user@example.com'
      });
    } catch (error) {
      console.error('Error loading agency settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAgencySettings = async (settings: Partial<AgencySettings>) => {
    try {
      setAgencySettings(prev => ({ ...prev, ...settings }));
      // In a real implementation, this would save to Supabase
    } catch (error) {
      console.error('Error updating agency settings:', error);
    }
  };

  const value = {
    agencySettings,
    loading,
    updateAgencySettings
  };

  return (
    <AgencyContext.Provider value={value}>
      {children}
    </AgencyContext.Provider>
  );
};
