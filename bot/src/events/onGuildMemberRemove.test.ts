import { describe, expect, test, vi, afterEach, Mock } from "vitest";
import { GuildMember, User } from "discord.js";
import { ServiceContainer } from "../services/index.js";
import { createOnGuildMemberRemove } from "./onGuildMemberRemove.js";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { PrismaOperationError } from "../errors/customErrors.js";

const { emitMock } = vi.hoisted(() => {
  return { emitMock: vi.fn() };
});

vi.mock("@opentelemetry/api-logs", async () => {
  const real = await vi.importActual<typeof import("@opentelemetry/api-logs")>(
    "@opentelemetry/api-logs",
  );

  return {
    ...real,
    logs: {
      getLogger: vi.fn(() => ({ emit: emitMock })),
    },
  };
});

const removeNode = vi.fn();

const mockServices = {
  databaseService: {
    removeNode,
  },
} as unknown as ServiceContainer;

describe("onGuildMemberRemove", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("onGuildMemberRemove should call removeNode when valid user returned", async () => {
    const mockUser = {
      id: "mock-user",
      username: "mock-username",
    } as User;

    const mockGuildMember = {
      user: mockUser,
    } as GuildMember;

    const onGuildMemberRemove = createOnGuildMemberRemove(mockServices);
    await onGuildMemberRemove(mockGuildMember);

    expect(mockServices.databaseService.removeNode).toHaveBeenCalledWith(
      mockUser.id,
    );
    expect(emitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severityNumber: SeverityNumber.INFO,
        body: expect.stringContaining("removed from DB"),
        attributes: expect.objectContaining({ userId: "mock-user" }),
      }),
    );
  });

  test("onGuildMemberRemove should log error when PrismaError occurs", async () => {
    const mockUser = {
      id: "mock-user",
      username: "mock-username",
    } as User;

    const mockGuildMember = {
      user: mockUser,
    } as GuildMember;

    const errorMessage = "Some PrismaError";

    removeNode.mockRejectedValue(new PrismaOperationError(errorMessage));

    const onGuildMemberRemove = createOnGuildMemberRemove(mockServices);
    await onGuildMemberRemove(mockGuildMember);

    expect(mockServices.databaseService.removeNode).toHaveBeenCalledWith(
      mockUser.id,
    );
    expect(emitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severityNumber: SeverityNumber.ERROR,
        body: expect.stringContaining(errorMessage),
        attributes: expect.objectContaining({ userId: "mock-user" }),
      }),
    );
  });

  test("onGuildMemberRemove should log error when unknown error occurs", async () => {
    const mockUser = {
      id: "mock-user",
      username: "mock-username",
    } as User;

    const mockGuildMember = {
      user: mockUser,
    } as GuildMember;

    removeNode.mockRejectedValue("Some unexpected value");

    const onGuildMemberRemove = createOnGuildMemberRemove(mockServices);
    await onGuildMemberRemove(mockGuildMember);

    expect(mockServices.databaseService.removeNode).toHaveBeenCalledWith(
      mockUser.id,
    );
    expect(emitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        severityNumber: SeverityNumber.ERROR2,
        body: expect.stringContaining("Unknown"),
        attributes: expect.objectContaining({ userId: "mock-user" }),
      }),
    );
  });
});
