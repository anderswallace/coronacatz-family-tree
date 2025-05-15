export type Node = {
  // Discord ID of a user
  userId: string;
  // Assigned nickname of a user, if no nickname is assigned this defaults to global name or username
  name: string;
  // Discord ID of a 'parent' user to this node
  parentId: string;
  // Name of root node of the tree this user belongs to, used to group users into subtrees under the 'Founders'
  group: string;
  // Color of this node, groups will share the same color
  color: string;
  createdAt: Date;
  updatedAt: Date;
};
