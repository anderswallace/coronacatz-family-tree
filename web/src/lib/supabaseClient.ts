import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "../config/config";

export function createSupabaseClient(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getConfig();
  return createClient(supabaseUrl, supabaseAnonKey);
}
