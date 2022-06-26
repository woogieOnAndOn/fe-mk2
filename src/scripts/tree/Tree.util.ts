import * as Tree from "../../model/tree.model";

export const findAndUpdateTree = (trees: Tree.RetrieveRes[], targetTree: Tree.RetrieveRes): Tree.RetrieveRes[] => {
  let find = false;
  for (let i = 0; i < trees.length; i ++) {
    if (trees[i].id === targetTree.id) {
      find = true;
      trees[i] = targetTree;
    }
  }
  if (find) {
    return trees;
  } else {
    for (let tree of trees) {
      if (tree.children) {
        tree.children = findAndUpdateTree(tree.children, targetTree);
      }
    }
    return trees;
  }
}

export const findTreeById = (trees: Tree.RetrieveRes[], targetId: number): Tree.RetrieveRes | null => {
  let find = false;
  for (let i = 0; i < trees.length; i ++) {
    if (trees[i].id === targetId) {
      find = true;
      return trees[i];
    }
  }

  if (!find) {
    for (let tree of trees) {
      if (tree.children) {
        const result: Tree.RetrieveRes | null = findTreeById(tree.children, targetId);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
}

export const findTreePathById = (trees: Tree.RetrieveRes[], targetId: number): string[] => {
  const paths: string[] = [];
  const targetTree: Tree.RetrieveRes | null = findTreeById(trees, targetId);

  if (!targetTree) {
    return [];
  }

  let parentId = targetTree.parent;

  while(parentId !== 0) {
    const parentTree: Tree.RetrieveRes | null = findTreeById(trees, parentId);
    if (!parentTree) break;

    paths.unshift(parentTree.name);
    parentId = parentTree.parent;
  }
  
  return paths;
}

export const findIndexById = (trees: Tree.RetrieveRes[], targetId: number): number => {
  let targetIndex = 0;
  trees.forEach((tree: Tree.RetrieveRes, index: number) => {
    tree.id === targetId && (targetIndex = index);
  });
  return targetIndex;
}