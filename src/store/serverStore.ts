import {create} from 'zustand';
import {supabase} from '../services/supabase';
import {
  getServers,
  createServer,
  updateServerStatus,
  deleteServer,
  type Server,
} from '../services/server';

interface ServerState {
  servers: Server[];
  loading: boolean;
  error: string | null;
  fetchServers: (userId: string) => Promise<void>;
  addServer: (userId: string, name: string, region: string) => Promise<void>;
  removeServer: (id: string) => Promise<void>;
  toggleServer: (id: string, currentStatus: Server['status']) => Promise<void>;
  subscribeRealtime: (userId: string) => () => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  loading: false,
  error: null,

  fetchServers: async (userId: string) => {
    set({loading: true, error: null});
    try {
      const servers = await getServers(userId);
      set({servers, loading: false});
    } catch (e: any) {
      set({error: e.message, loading: false});
    }
  },

  addServer: async (userId, name, region) => {
    const server = await createServer(userId, name, region);
    set(state => ({servers: [server, ...state.servers]}));
  },

  removeServer: async (id: string) => {
    await deleteServer(id);
    set(state => ({servers: state.servers.filter(s => s.id !== id)}));
  },

  toggleServer: async (id, currentStatus) => {
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running';
    await updateServerStatus(id, newStatus);
    set(state => ({
      servers: state.servers.map(s =>
        s.id === id ? {...s, status: newStatus} : s,
      ),
    }));
  },

  subscribeRealtime: (userId: string) => {
    const channel = supabase
      .channel('servers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'servers',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            set(state => ({
              servers: [payload.new as Server, ...state.servers],
            }));
          } else if (payload.eventType === 'UPDATE') {
            set(state => ({
              servers: state.servers.map(s =>
                s.id === payload.new.id ? (payload.new as Server) : s,
              ),
            }));
          } else if (payload.eventType === 'DELETE') {
            set(state => ({
              servers: state.servers.filter(s => s.id !== payload.old.id),
            }));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
