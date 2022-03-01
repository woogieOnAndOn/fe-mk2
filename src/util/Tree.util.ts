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