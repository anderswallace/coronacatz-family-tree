import type { Node } from "../types/node";
import type { GraphData, GraphEdge, GraphNode } from "../types/graph";

// returns constructed arrays of GraphNodes and GraphEdges given an array of Node objects
export function buildGraphFromNodes(raw: Node[]): GraphData {
  const graphNodes: GraphNode[] = raw.map((node) => ({
    id: node.userId,
    label: node.name,
    color: node.color,
  }));

  const graphEdges: GraphEdge[] = raw
    .filter((node) => node.parentId)
    .map((node, i) => ({
      id: `edge-${i}`,
      from: node.parentId,
      to: node.userId,
    }));

  return { nodes: graphNodes, edges: graphEdges };
}
