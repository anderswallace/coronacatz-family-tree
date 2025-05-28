// single edge (parent -> child) relationship between two nodes in the family tree
export type Edge = {
  // nickname of parent user
  parent: string;
  // nickname of child user
  child: string;
};

// a constructed edge, where an Edge is replaced with the Discord IDs of the parent and child
export type ConstructedEdge = {
  // Discord ID of child user
  childId: string;
  // Discord ID of parent user
  parentId: string;
  // nickname of child user, who is the user being added to the family tree
  name: string;
};
