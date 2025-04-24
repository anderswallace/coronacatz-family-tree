import { z } from "zod";

export const TreeSchema = z.object({
  userId: z.string(),
  name: z.string(),
  parentId: z.string(),
  group: z.string(),
  color: z.string().regex(/^#[0-9a-f]{6}$s/i, "Color must be a hex code"),
});

export type Node = z.infer<typeof TreeSchema>;
