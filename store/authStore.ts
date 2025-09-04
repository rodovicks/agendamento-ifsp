import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { estabelecimentoService, Estabelecimento } from '../utils/estabelecimento';

type AuthState = {
  user: User | null;
  session: Session | null;
  estabelecimento: Estabelecimento | null;
  loading: boolean;
  signOut: () => Promise<void>;
  initialize: () => void;
  loadEstabelecimento: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  estabelecimento: null,
  loading: true,

  signOut: async () => {
    await supabase.auth.signOut();
    set({ estabelecimento: null });
  },

  loadEstabelecimento: async () => {
    try {
      const estabelecimento = await estabelecimentoService.verificarOuCriarEstabelecimento();
      set({ estabelecimento });
    } catch (error) {
      console.error('Erro ao carregar estabelecimento:', error);
    }
  },

  initialize: () => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({
        session,
        user: session?.user || null,
        loading: false,
      });

      // Carregar dados do estabelecimento quando usuário faz login
      if (session?.user) {
        get().loadEstabelecimento();
      } else {
        set({ estabelecimento: null });
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      set({
        session,
        user: session?.user || null,
        loading: false,
      });

      // Carregar dados do estabelecimento se já estiver logado
      if (session?.user) {
        get().loadEstabelecimento();
      }
    });
  },
}));
