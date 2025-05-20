import { useState, useEffect } from "react";
import { useServices } from "../contexts/ServiceContext";
import { buildGraphFromNodes } from "./graphBuilder";
import type { GraphEdge, GraphNode } from "../types/graph";

// function to fetch nodes from DB and construct nodes and edges to be drawn by GraphComponent
export function useGraphData() {
  const { nodeService } = useServices();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // use controller to avoid 'setState on unmounted component' warnings
    const controller = new AbortController();

    async function load() {
      try {
        const rawNodes = await nodeService.fetchAllNodes();
        if (controller.signal.aborted) {
          return;
        }

        const { nodes: graphNodes, edges: graphEdges } =
          buildGraphFromNodes(rawNodes);
        setNodes(graphNodes);
        setEdges(graphEdges);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err as Error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, []);

  return { nodes, edges, loading, error };
}
