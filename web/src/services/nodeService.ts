import type { SupabaseClient } from "@supabase/supabase-js";
import type { Node } from "../types/Node";

export interface NodeService {
  fetchAllNodes(): Promise<Node[]>;
}

export function createNodeService(client: SupabaseClient): NodeService {
  return {
    async fetchAllNodes() {
      const { data, error } = await client.from("nodes").select("*");

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  };
}
