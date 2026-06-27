import {supabase} from './supabase';
import {encrypt, decrypt} from '../utils/encryption';

export type CredentialType = 's3' | 'smtp' | 'ai' | 'maps' | 'stripe' | 'twilio' | 'custom';

export interface Credential {
  id: string;
  user_id: string;
  type: CredentialType;
  label: string;
  data: Record<string, string>;
  created_at: string;
}

export const saveCredential = async (
  userId: string,
  type: CredentialType,
  label: string,
  data: Record<string, string>,
): Promise<void> => {
  const encrypted_data = encrypt(data);
  const {error} = await supabase
    .from('credentials')
    .insert({user_id: userId, type, label, encrypted_data});
  if (error) throw error;
};

export const getCredentials = async (
  userId: string,
  type?: CredentialType,
): Promise<Credential[]> => {
  let query = supabase.from('credentials').select('*').eq('user_id', userId);
  if (type) query = query.eq('type', type);
  const {data, error} = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    ...row,
    data: decrypt(row.encrypted_data) as Record<string, string>,
  }));
};

export const deleteCredential = async (id: string): Promise<void> => {
  const {error} = await supabase.from('credentials').delete().eq('id', id);
  if (error) throw error;
};
