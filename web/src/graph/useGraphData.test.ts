import { describe, test, expect, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { Node } from "../types/node";
import { GraphEdge, GraphNode } from "../types/graph";
import { useGraphData } from "./useGraphData";
import { act } from "react";
import * as graphBuilder from "./graphBuilder";

const mockFetchAllNodes = vi.fn<() => Promise<Node[]>>();

vi.mock("../contexts/ServiceContext", () => ({
  useServices: () => ({
    nodeService: { fetchAllNodes: mockFetchAllNodes },
  }),
}));

// helper function to control promise resolution for AbortController testing
function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useGraphData", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("useGraphData should load data and create valid edges and nodes", async () => {
    // mocked return data from fetchAllNodes()
    const rawNodes: Node[] = [
      {
        userId: "mock-userid-1",
        name: "user-1-name",
        parentId: "mock-user1-parent",
        group: "mock-group-1",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: "mock-userid-2",
        name: "user-2-name",
        parentId: "mock-user2-parent",
        group: "mock-group-2",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // expected data that buildGraphFromNodes should create
    const graph = {
      nodes: [
        { id: "mock-userid-1", label: "user-1-name", color: "#ffffff" },
        { id: "mock-userid-2", label: "user-2-name", color: "#ffffff" },
      ] as GraphNode[],
      edges: [
        { id: "edge-0", from: "mock-user1-parent", to: "mock-userid-1" },
        { id: "edge-1", from: "mock-user2-parent", to: "mock-userid-2" },
      ] as GraphEdge[],
    };

    mockFetchAllNodes.mockResolvedValue(rawNodes);

    const { result } = renderHook(() => useGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.nodes).toEqual(graph.nodes);
    expect(result.current.edges).toEqual(graph.edges);
    expect(result.current.error).toBe(null);

    expect(mockFetchAllNodes).toHaveBeenCalledTimes(1);
  });

  test("useGraphData should set error flag if operation throws an error", async () => {
    const testError = new Error("fetchAllNodes error");
    mockFetchAllNodes.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useGraphData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(testError);
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);

    expect(mockFetchAllNodes).toHaveBeenCalledTimes(1);
  });

  test("useGraphData should not update state once the component has unmounted", async () => {
    const buildGraphSpy = vi.spyOn(graphBuilder, "buildGraphFromNodes");

    const { promise, resolve } = deferred<Node[]>();
    mockFetchAllNodes.mockReturnValue(promise);

    const rawNodes: Node[] = [
      {
        userId: "mock-userid-1",
        name: "user-1-name",
        parentId: "mock-user1-parent",
        group: "mock-group-1",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: "mock-userid-2",
        name: "user-2-name",
        parentId: "mock-user2-parent",
        group: "mock-group-2",
        color: "#ffffff",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // mount -> unmount -> THEN resolve promise to trigger controller.signal.aborted
    const { result, unmount } = renderHook(() => useGraphData());
    unmount();

    await act(async () => {
      resolve(rawNodes);
      await promise;
    });

    expect(buildGraphSpy).not.toHaveBeenCalled();
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
  });
});
