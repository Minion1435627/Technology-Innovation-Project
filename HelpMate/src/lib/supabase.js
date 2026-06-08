import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://qdmnbeiysoooqhjvczmx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1vu6ODYsVZV_x90mLlaZew_0Gi90khz';
export const GOOGLE_CLIENT_ID = '825901365537-7vfd11s15kctuo6h6ii9du1d19tsllbm.apps.googleusercontent.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
  db: { schema: 'HelpMate' },
});
