import { TreeState } from './states';
import { TreeAction, TreeActionType } from './actions';
import { ActionType } from '../../model/tree.model';

export const initialState: TreeState = {
  searchCondition: {
    depth: 0,
    parent: 0,
    secret: 0,
  },
  searchIndex: 0,
  datas: [],
  showActionBtns: false,
  actionType: ActionType.CREATE,
  targetTree: {
    id: 0,
    type: 20,
    name: '',
    content: '',
    depth: 0,
    parent: {},
    parentId: 0,
    secret: 0,
    children: [],
    upperIndex: [],
    upperName: [],
  },
  upsertTree: {
    id: 0,
    type: 20,
    name: '',
    content: '',
    depth: 0,
    parent: {},
    parentId: 0,
    secret: 0,
    children: [],
    upperIndex: [],
    upperName: [],
  }
}

export const reducer = (treeState: TreeState, action: TreeAction) => {
  switch (action.type) {
    case TreeActionType.SET_SEARCH_CONDITION: {
      return {
        ...treeState,
        searchCondition: action.searchCondition,
      };
    }
    case TreeActionType.SET_SEARCH_INDEX: {
      return {
        ...treeState,
        searchIndex: action.searchIndex
      }
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
    case TreeActionType.SET_UPSERT_TREE: {
      return {
        ...treeState,
        searchCondition: action.searchCondition,
        searchIndex: action.searchIndex,
        upsertTree: action.upsertTree,
      };
    }
    case TreeActionType.SET_SHOW_ACTION_BTNS: {
      return {
        ...treeState,
        showActionBtns: action.showActionBtns
      };
    }
    default:
      return treeState;
  }
};