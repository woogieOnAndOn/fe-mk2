import { TreeState } from "./states";

export enum TreeActionType {
  SET_SEARCH_CONDITION = 'SET_SEARCH_CONDITION',
  SET_SEARCH_RESULT = 'SET_SEARCH_RESULT', 
  SET_TARGET_TREE_AND_ACTION_TYPE = 'SET_TARGET_TREE_AND_ACTION_TYPE', 
  SET_UPSERT_TREE = 'SET_UPSERT_TREE',
  SET_SHOW_SELECT_BUTTON = 'SET_SHOW_SELECT_BUTTON',
}

export interface TreeAction extends TreeState {
  type: TreeActionType;
}