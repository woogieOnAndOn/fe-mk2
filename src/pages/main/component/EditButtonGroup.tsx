/* eslint-disable @typescript-eslint/no-unused-vars */
import { Icon, Button, Checkbox, SemanticFLOATS } from 'semantic-ui-react'
import React, { useState, useEffect, useContext, FormEvent } from 'react';
import { TreeContext, TreeProvider } from '../../../contexts/TreeContext';
import { TreeActionType } from '../../../reducer/tree/actions';
import TreeService from '../../../service/tree.service';

import { Message } from '../../../model/common.model';
import * as Tree from '../../../model/tree.model';
import { findAndUpdateTree, findIndexById, findTreeById } from '../../../scripts/tree/Tree.util';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';

interface PropTypes { 
  targetTree: Tree.RetrieveRes;
  showButtonList: Tree.ActionType[],
  targetTreeIndex?: number;
  folderTotalCount?: number;
  fileTotalCount?: number;
  selectedTrees?: Tree.RetrieveRes[],
  floated?: SemanticFLOATS;
  setSelectedTrees?: Function;
  showDirectories?: Function;
}

const EditButtonGroup: React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const deleteTree = async (data: Tree.RetrieveRes) => {
    const request = {
      id: data.id,
      type: data.type,
    };

    const result: Message = await treeService.deleteTree(request);
    ApiResultExecutor(result, true, () => {
      const parentTree: Tree.RetrieveRes | null = findTreeById(treeState.datas, data.parent);
      if (parentTree) {
        const children: Tree.RetrieveRes[] = parentTree.children;
        children.splice(findIndexById(children, data.id), 1);
        parentTree.children = children;

        const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, parentTree);
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: updatedTrees
        });
      } else {
        const tmpState = [...treeState.datas];
        tmpState.splice(findIndexById(tmpState, data.id), 1);
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: tmpState
        });
      }
    });
  }

  const showCreate = async (data: Tree.RetrieveRes) => {
    treeDispatch({
      type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
      targetTree: data,
      actionType: Tree.ActionType.CREATE
    });
  }

  const showEdit = async (data: Tree.RetrieveRes) => {
    treeDispatch({
      type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
      targetTree: data,
      actionType: Tree.ActionType.UPDATE
    });
  }

  const showDelete = (data: Tree.RetrieveRes) => {
    let result;
    if (data.type === Tree.Type.FORDER)      result = window.confirm('선택 폴더를 삭제하시겠습니까?\n해당 폴더의 하위 파일들이 모두 삭제됩니다.');
    else if (data.type === Tree.Type.FILE) result = window.confirm('선택 파일을 삭제하시겠습니까?');

    if (result) {
      deleteTree(data);
    }
  }

  const upTree = async (data: Tree.RetrieveRes) => {
    const request: Tree.UpdateSeqReq = {
      id: data.id,
      type: data.type,
      parent: data.parent,
      upDown: Tree.UpDown.UP,
    }

    const result: Message = await treeService.updateSeqTree(request);
    ApiResultExecutor(result, false, () => {
      const parentTree: Tree.RetrieveRes | null = findTreeById(treeState.datas, data.parent);
      relocateAfterUpAndDown(parentTree, true, data);
    });
  };

  const downTree = async (data: Tree.RetrieveRes) => {
    const request: Tree.UpdateSeqReq = {
      id: data.id,
      type: data.type,
      parent: data.parent,
      upDown: Tree.UpDown.DOWN,
    }

    const result: Message = await treeService.updateSeqTree(request);
    ApiResultExecutor(result, false, () => {
      const parentTree: Tree.RetrieveRes | null = findTreeById(treeState.datas, data.parent);
      relocateAfterUpAndDown(parentTree, false, data);
    });
  };

  const relocateAfterUpAndDown = (parentTree: Tree.RetrieveRes | null, isUp: boolean, targetTree: Tree.RetrieveRes) => {
    const calculationNumber = isUp ? -1 : 1;
    if (parentTree) {
      const children: Tree.RetrieveRes[] = parentTree.children;
      let targetIndex = findIndexById(children, targetTree.id);
      children[targetIndex] = children[targetIndex + calculationNumber];
      children[targetIndex + calculationNumber] = targetTree;
      parentTree.children = children;
      
      const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, parentTree);
      treeDispatch({
        type: TreeActionType.SET_SEARCH_RESULT,
        datas: updatedTrees
      });
    } else {
      const tmpState = [...treeState.datas];
        let targetIndex = findIndexById(tmpState, targetTree.id);
        tmpState[targetIndex] = tmpState[targetIndex + calculationNumber];
        tmpState[targetIndex + calculationNumber] = targetTree;
        
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: tmpState
        });
    }
  }

  const updateLocationTree = async (data: Tree.RetrieveRes) => {
    const selectedTreeForReq: Tree.RetrieveRes[] = [];
    const selectedTreeIds = props.selectedTrees!.map((tree: Tree.RetrieveRes) => tree.id);

    props.selectedTrees!.forEach((tree: Tree.RetrieveRes) => {
      if (!selectedTreeIds.includes(tree.parent)) {
        selectedTreeForReq.push(tree);
      }
    })

    if (selectedTreeForReq.length === 0) return;

    const request: Tree.UpdateLocationReq = {
      parent: data.id,
      ids: selectedTreeForReq.map((tree: Tree.RetrieveRes) => tree.id),
    }

    const result: Message = await treeService.updateLocationTree(request);
    ApiResultExecutor(result, true, () => {
      selectedTreeForReq.forEach((movedTree: Tree.RetrieveRes) => {
        const parentTree: Tree.RetrieveRes | null = findTreeById(treeState.datas, movedTree.parent);
        if (parentTree) {
          parentTree.children = parentTree.children.filter((tree: Tree.RetrieveRes) => {
            return tree.id !== movedTree.id;
          })

          const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, parentTree);
          treeDispatch({
            type: TreeActionType.SET_SEARCH_RESULT,
            datas: updatedTrees
          });
        }
      });

      props.showDirectories!(props.targetTree);
      props.setSelectedTrees!([]);
    });
  }

  const showUpdateLocation = (data: Tree.RetrieveRes) => {
    const result = window.confirm(`선택 파일들을 ${data.name} 아래로 이동하시겠습니까?`);

    if (result) {
      updateLocationTree(data);
    }
  }

  return (
    <Button.Group basic size='mini' floated={props.floated!}>
      {!treeState.showSelectButton ?
        <span>
          {(props.showButtonList.includes(Tree.ActionType.CREATE) && props.targetTree.type === Tree.Type.FORDER) && <Button icon='plus square outline' onClick={() => showCreate(props.targetTree)} /> }
          {props.showButtonList.includes(Tree.ActionType.UPDATE) && <Button icon='edit outline' onClick={() => showEdit(props.targetTree)} />}
          {props.showButtonList.includes(Tree.ActionType.DELETE) && <Button icon='trash alternate outline' onClick={() => showDelete(props.targetTree)} />}
          {props.showButtonList.includes(Tree.ActionType.UP) && <Button icon='angle up' onClick={() => upTree(props.targetTree)} style={{display: props.targetTreeIndex === 0 && 'none'}} />}
          {props.showButtonList.includes(Tree.ActionType.DOWN) && <Button icon='angle down' onClick={() => downTree(props.targetTree)} style={{display: props.targetTreeIndex === (props.targetTree.type === Tree.Type.FORDER ? props.folderTotalCount!-1 : props.folderTotalCount!+props.fileTotalCount!-1) && 'none'}} />}
        </span>
        :
        !props.selectedTrees!.includes(props.targetTree) && <Button icon='caret square left outline' onClick={() => showUpdateLocation(props.targetTree)} />
      }
    </Button.Group>
  );
}

export default EditButtonGroup;