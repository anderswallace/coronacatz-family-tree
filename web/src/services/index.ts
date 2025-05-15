import { createSupabaseClient } from "../lib/supabaseClient";
import { createNodeService } from "./nodeService";
import type { NodeService } from "./nodeService";

export interface AppServices {
  nodeService: NodeService;
}

export function createServices(): AppServices {
  const supabase = createSupabaseClient();

  return {
    nodeService: createNodeService(supabase),
  };
}
