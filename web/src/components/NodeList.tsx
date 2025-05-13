import { useState, useEffect } from "react";
import { useServices } from "../contexts/ServiceContext";
import type { Node } from "../types/Node";

export function NodeList() {
  const { nodeService } = useServices();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNodes = async () => {
      try {
        const nodes = await nodeService.fetchAllNodes();
        setNodes(nodes);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadNodes();
  }, []);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error Message: {error}</p>}
      {!loading && !error && (
        <ul>
          {nodes.map((node) => (
            <li key={node.userId}>{node.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
