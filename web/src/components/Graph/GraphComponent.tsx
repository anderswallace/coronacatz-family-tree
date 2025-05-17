import { useRef, useEffect } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import type { GraphNode, GraphEdge } from "../../types/graph";

interface GraphComponentProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphComponent({ nodes, edges }: GraphComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    console.log(edges);
    const data = {
      nodes: new DataSet(nodes),
      edges: new DataSet(edges),
    };

    const options = {
      layout: {
        hierarchical: {
          enabled: false,
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 200 },
        },
      },
      nodes: {
        shape: "box",
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        font: { color: "#333" },
      },
      edges: {
        arrows: {
          to: { enabled: false },
        },
        length: 100,
      },
      interaction: {
        hover: true,
        navigationButtons: true,
      },
    };

    networkRef.current = new Network(containerRef.current, data, options);

    return () => {
      networkRef.current?.destroy();
    };
  }, [nodes, edges]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        width: "100%",
      }}
    />
  );
}
