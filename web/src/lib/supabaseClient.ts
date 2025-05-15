import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getConfig } from "../config/config";

export function createSupabaseClient(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getConfig(import.meta.env);
  return createClient(supabaseUrl, supabaseAnonKey);
}
