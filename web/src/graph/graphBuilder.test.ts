import { describe, test, expect, vi, afterEach } from "vitest";
import { Node } from "../types/node";
import { buildGraphFromNodes } from "./graphBuilder";

describe("buildGraphFromNodes", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("buildGraphFromNodes should construct valid nodes and edges from raw data", () => {
    const rawNodes: Node[] = [
      {
        userId: "mockUser1",
        name: "mock-name-1",
        parentId: "mock-parent-id-1",
        group: "mock-group-1",
        color: "mock-color-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: "mockUser2",
        name: "mock-name-2",
        parentId: "mock-parent-id-2",
        group: "mock-group-2",
        color: "mock-color-2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const expectedNodes = [
      { id: "mockUser1", label: "mock-name-1", color: "mock-color-1" },
      { id: "mockUser2", label: "mock-name-2", color: "mock-color-2" },
    ];

    const expectedEdges = [
      { id: "edge-0", from: "mock-parent-id-1", to: "mockUser1" },
      { id: "edge-1", from: "mock-parent-id-2", to: "mockUser2" },
    ];

    const { nodes, edges } = buildGraphFromNodes(rawNodes);

    expect(nodes).toEqual(expectedNodes);
    expect(edges).toEqual(expectedEdges);
  });
});
