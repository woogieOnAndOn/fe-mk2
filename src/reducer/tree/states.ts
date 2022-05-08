import { Tree, ActionType } from "../../model/tree.model";

export interface TreeState {
  searchCondition: Tree;
  searchIndex: number;
  datas: Tree[];
  actionType: ActionType;
  targetTree: Tree;
  upsertTree: Tree;
  showSelectButton: boolean;
}