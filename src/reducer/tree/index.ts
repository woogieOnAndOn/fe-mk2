import { TreeState } from './states';
import { TreeAction, TreeActionType } from './actions';
import * as Tree from '../../model/tree.model';

export const initialState: TreeState = {
  searchCondition: {
    id: 0,
    type: 20,
    name: '',
    content: '',
    parent: 0,
    children: [],
  },
  datas: [],
  actionType: Tree.ActionType.CREATE,
  targetTree: {
    id: 0,
    type: 10,
    name: 'user',
    content: '',
    parent: 0,
    children: [],
  },
  showSelectButton: false,
}

export const reducer = (treeState: TreeState, action: TreeAction) => {
  switch (action.type) {
    case TreeActionType.SET_SEARCH_CONDITION: {
      return {
        ...treeState,
        searchCondition: action.searchCondition,
      };
    }
    case TreeActionType.SET_SEARCH_RESULT: {
      return {
        ...treeState,
        datas: action.datas,
      };
    }
    case TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE: {
      return {
        ...treeState,
        targetTree: action.targetTree,
        actionType: action.actionType,
      };
    }
    case TreeActionType.SET_SHOW_SELECT_BUTTON: {
      return {
        ...treeState,
        showSelectButton: action.showSelectButton,
      };
    }
    default:
      return treeState;
  }
};