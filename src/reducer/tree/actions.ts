import { Tree, TreeSearchCondition, ActionType } from "../../model/tree.model";

export enum TreeActionType {
  SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION',
  SET_SEARCH_INDEX = 'SET_SEARCH_INDEX',
  SET_SEARCH_RESULT = 'SET_SEARCH_RESULT', 
  SET_TARGET_TREE_AND_ACTION_TYPE = 'SET_TARGET_TREE_AND_ACTION_TYPE', 
  SET_UPSERT_TREE = 'SET_UPSERT_TREE',
  SET_SHOW_ACTION_BTNS = 'SET_SHOW_ACTION_BTNS',
}

export type TreeAction = {
  type: TreeActionType;
  searchCondition: TreeSearchCondition;
  searchIndex: number;
  datas: Tree[];
  showActionBtns: boolean;
  actionType: ActionType;
  targetTree?: Tree;
  upsertTree: Tree;
}