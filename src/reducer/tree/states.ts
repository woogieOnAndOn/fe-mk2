import { Tree, TreeSearchCondition, ActionType } from "../../model/tree.model";

export interface TreeState {
  searchCondition: TreeSearchCondition;
  searchIndex: number;
  datas: Tree[];
  showActionBtns: boolean;
  actionType: ActionType;
  targetTree?: Tree;
  upsertTree: Tree;
}