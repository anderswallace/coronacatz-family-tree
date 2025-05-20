import { useGraphData } from "../../graph/useGraphData";
import { GraphComponent } from "./GraphComponent";

// Component to house GraphComponent, which draws a graph using provided nodes and edges
export function GraphViewer() {
  const { nodes, edges, loading, error } = useGraphData();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading graph: {error.message}</p>;
  }

  return <GraphComponent nodes={nodes} edges={edges}></GraphComponent>;
}
