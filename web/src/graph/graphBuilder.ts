import type { Node } from "../types/node";

export function buildGraphFromNodes(raw: Node[]) {
  const graphNodes = raw.map((node) => ({
    id: node.userId,
    label: node.name,
    color: node.color,
  }));

  const graphEdges = raw
    .filter((node) => node.parentId)
    .map((node, i) => ({
      id: `edge-${i}`,
      from: node.parentId,
      to: node.userId,
    }));

  return { nodes: graphNodes, edges: graphEdges };
}
