import { Tree, ActionType } from "../../model/tree.model";

export enum TreeActionType {
  SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION',
  SET_SEARCH_INDEX = 'SET_SEARCH_INDEX',
  SET_SEARCH_RESULT = 'SET_SEARCH_RESULT', 
  SET_TARGET_TREE_AND_ACTION_TYPE = 'SET_TARGET_TREE_AND_ACTION_TYPE', 
  SET_UPSERT_TREE = 'SET_UPSERT_TREE',
}

export type TreeAction = {
  type: TreeActionType;
  searchCondition: Tree;
  searchIndex: number;
  datas: Tree[];
  actionType: ActionType;
  targetTree: Tree;
  upsertTree: Tree;
}