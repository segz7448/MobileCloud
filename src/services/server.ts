import {supabase} from './supabase';

export interface Server {
  id: string;
  user_id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'building';
  region: string;
  ip_address: string;
  port: number;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  server_id: string;
  user_id: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  github_repo: string;
  branch: string;
  commit_hash: string;
  build_logs: string;
  deployed_at: string;
  created_at: string;
}

export const getServers = async (userId: string): Promise<Server[]> => {
  const {data, error} = await supabase
    .from('servers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data || [];
};

export const createServer = async (
  userId: string,
  name: string,
  region: string,
): Promise<Server> => {
  const {data, error} = await supabase
    .from('servers')
    .insert({user_id: userId, name, region, status: 'stopped'})
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateServerStatus = async (
  id: string,
  status: Server['status'],
): Promise<void> => {
  const {error} = await supabase
    .from('servers')
    .update({status, updated_at: new Date().toISOString()})
    .eq('id', id);
  if (error) throw error;
};

export const deleteServer = async (id: string): Promise<void> => {
  const {error} = await supabase.from('servers').delete().eq('id', id);
  if (error) throw error;
};

export const getDeployments = async (serverId: string): Promise<Deployment[]> => {
  const {data, error} = await supabase
    .from('deployments')
    .select('*')
    .eq('server_id', serverId)
    .order('created_at', {ascending: false});
  if (error) throw error;
  return data || [];
};

export const createDeployment = async (
  serverId: string,
  userId: string,
  githubRepo: string,
  branch: string,
): Promise<Deployment> => {
  const {data, error} = await supabase
    .from('deployments')
    .insert({
      server_id: serverId,
      user_id: userId,
      github_repo: githubRepo,
      branch,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getLogs = async (serverId: string, limit = 100) => {
  const {data, error} = await supabase
    .from('logs')
    .select('*')
    .eq('server_id', serverId)
    .order('created_at', {ascending: false})
    .limit(limit);
  if (error) throw error;
  return data || [];
};

export const getDomains = async (userId: string) => {
  const {data, error} = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

export const addDomain = async (
  serverId: string,
  userId: string,
  domain: string,
) => {
  const {data, error} = await supabase
    .from('domains')
    .insert({server_id: serverId, user_id: userId, domain})
    .select()
    .single();
  if (error) throw error;
  return data;
};
