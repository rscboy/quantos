import { useState, useEffect } from 'react';

export interface SharedProfile {
  dateOfBirth?: string;
  dateServiceComp?: string;
  dateRetire?: string;
  bCSRS?: string;
  bLawEnforce?: string;
  bAirTraffic?: string;
  bCustomsBorderPatrol?: string;
  bPhasedRetire?: string;
  email?: string;
}

const STORAGE_KEY = 'myfedplan_shared_profile';

export function useSharedProfile() {
  const [profile, setProfile] = useState<SharedProfile>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load shared profile', e);
    }
  }, []);

  // Update profile and save to localStorage
  const updateProfile = (updates: Partial<SharedProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch (e) {
        console.error('Failed to save shared profile', e);
      }
      return newProfile;
    });
  };

  // Clear profile
  const clearProfile = () => {
    setProfile({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear shared profile', e);
    }
  };

  return { profile, updateProfile, clearProfile };
}
