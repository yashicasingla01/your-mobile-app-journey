import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
export const AccountContext = createContext<{ user: User | null; signOut: () => Promise<void> }>({ user: null, signOut: async () => {} });
export const useAccount = () => useContext(AccountContext);
