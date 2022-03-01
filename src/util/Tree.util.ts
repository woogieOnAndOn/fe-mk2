import { Tree } from "../model/tree.model";

export const findAndUpdateTree = (trees: Tree[], targetTree: Tree): Tree[] => {
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

export const findTreeById = (trees: Tree[], targetId: number): Tree | null => {
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
        const result: Tree | null = findTreeById(tree.children, targetId);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
}

export const findTreePathById = (trees: Tree[], targetId: number): string[] => {
  const paths: string[] = [];
  const targetTree: Tree | null = findTreeById(trees, targetId);

  if (!targetTree) {
    return [];
  }

  let depth = targetTree.depth;
  let parentId = targetTree.parent;

  while(depth > 0) {
    const parentTree: Tree | null = findTreeById(trees, parentId);
    if (!parentTree) break;

    paths.unshift(parentTree.name);
    depth -= 1;
    parentId = parentTree.parent;
  }
  
  return paths;
}