import type { Node } from "../types/node";
import type { GraphData, GraphEdge, GraphNode } from "../types/graph";

function isColorDark(hexColor: string): boolean {
  // convert to rgb
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  // use luminance formula to determine brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128;
}

// returns constructed arrays of GraphNodes and GraphEdges given an array of Node objects
export function buildGraphFromNodes(raw: Node[]): GraphData {
  const graphNodes: GraphNode[] = raw.map((node) => {
    // dynamically set font to white or black depending on brightness of node color
    const fontColor = isColorDark(node.color) ? "#ffffff" : "#000000";

    return {
      id: node.userId,
      label: node.name,
      color: node.color,
      font: {
        color: fontColor,
      },
    };
  });

  const graphEdges: GraphEdge[] = raw
    .filter((node) => node.parentId)
    .map((node, i) => ({
      id: `edge-${i}`,
      from: node.parentId,
      to: node.userId,
    }));

  return { nodes: graphNodes, edges: graphEdges };
}
