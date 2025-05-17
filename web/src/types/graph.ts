export interface GraphNode {
  id: string;
  label: string;
  color?: string;
}

export interface GraphEdge {
  id?: string;
  from: string;
  to: string;
}
