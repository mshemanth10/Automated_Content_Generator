import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import Storage from './AsyncStorage';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const supabaseUrl = "https://vlyonpxvesvzxvelihro.supabase.co"
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZseW9ucHh2ZXN2enh2ZWxpaHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTY1NzcsImV4cCI6MjA1MDI3MjU3N30.xPVf5NWSJuSJDEH2LXc-jAz4y2YqA6exIW2S79rjmng"


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for non-browser environments
  },
});

if (typeof window !== 'undefined') {

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}