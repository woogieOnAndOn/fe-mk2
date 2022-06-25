import { Tree, ActionType } from "../../model/tree.model";

export interface TreeState {
  searchCondition: Tree;
  datas: Tree[];
  actionType: ActionType;
  targetTree: Tree;
  showSelectButton: boolean;
}