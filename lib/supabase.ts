
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zclhfdqattplkpglfsop.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGhmZHFhdHRwbGtwZ2xmc29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzQ4MzcsImV4cCI6MjA4NTQxMDgzN30.V9-jClxqaB7rF2dXPE78U4pYqELzSuZEbBGLayIgHGg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logTimerUsage = async (userId: string, type: string, durationMs: number, category: string = 'General') => {
  if (!userId || userId === '') {
    console.warn('Sync skipped: No valid User ID provided.');
    return;
  }
  
  console.log(`Attempting to sync ${type} session: ${durationMs}ms`);
  
  const { data, error } = await supabase
    .from('timer_logs')
    .insert([
      { 
        user_id: userId, 
        timer_type: type, 
        duration_ms: durationMs, 
        category,
        created_at: new Date().toISOString()
      }
    ]);
    
  if (error) {
    console.error('Database Sync Error:', error.message);
    if (error.message.includes('403')) {
      console.error('Hint: Check RLS policies on timer_logs table.');
    }
  } else {
    console.log('Successfully synced session to Chronos Cloud.');
  }
};
