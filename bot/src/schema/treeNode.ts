import { z } from "zod";

export const TreeSchema = z.object({
  // Discord ID of a user
  userId: z.string(),
  // Assigned nickname of a user, if no assigned nickname provided this defaults to global name or username
  name: z.string(),
  // Discord ID of 'parent' user to this node
  parentId: z.string(),
  // Name of root node of the tree this user belongs to, used to group users into subtrees under the 'Founders'
  group: z.string(),
  // Color of this node, groups will share the same color
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Color must be a valid hex code"),
  // Array of Discord IDs who are 'descendants' of this user (i.e. leaf nodes of this subtree)
  children: z.string().array(),
});

export type Node = z.infer<typeof TreeSchema>;
