import type { SupabaseClient } from "@supabase/supabase-js";
import type { Node } from "../types/node";

export interface NodeService {
  fetchAllNodes(): Promise<Node[]>;
}

async function fetchAllNodes(client: SupabaseClient): Promise<Node[]> {
  const { data, error } = await client.from("nodes").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export function createNodeService(client: SupabaseClient): NodeService {
  return { fetchAllNodes: () => fetchAllNodes(client) };
}
