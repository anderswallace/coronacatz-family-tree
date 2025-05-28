export type GraphNode = {
  id: string;
  label: string;
  color: string;
  font: {
    color: string;
  };
};

export type GraphEdge = {
  id?: string;
  from: string;
  to: string;
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
