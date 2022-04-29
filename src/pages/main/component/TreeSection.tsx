/* eslint-disable @typescript-eslint/no-unused-vars */
import { Icon, Button } from 'semantic-ui-react'
import React, { useState, useEffect, useContext } from 'react';
import { TreeContext, TreeProvider } from '../../../contexts/TreeContext';
import { TreeActionType } from '../../../reducer/tree/actions';
import TreeService from '../../../service/tree.service';

import { Message } from '../../../model/common.model';
import * as Tree from '../../../model/tree.model';
import { findAndUpdateTree, findTreeById } from '../../../scripts/tree/Tree.util';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';

interface PropTypes {  }

const TreeSection: React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const initialTree: Tree.RetrieveRes = {
    id: 0,
    type: Tree.Type.FORDER,
    name: '',
    content: '',
    parent: 0,
    children: [],
  };

  const folderTotalCount = treeState.datas && treeState.datas!.filter(data => data.type === Tree.Type.FORDER).length;
  const fileTotalCount = treeState.datas && treeState.datas!.filter(data => data.type === Tree.Type.FILE).length;

  const showDirectories = async (data: Tree.RetrieveRes) => {
    const newSearchCondition: Tree.RetrieveReq = {
      parent: data.id,
    };
    retrieveTree(newSearchCondition)
      .then(response => {
        let updatedTrees: Tree.RetrieveRes[] = [];
        if (newSearchCondition.parent === 0) {
          updatedTrees = response;
        } else {
          data.children = response;
          let tmpState: Tree.RetrieveRes[] = treeState.datas;
          updatedTrees = findAndUpdateTree(tmpState, data);
        }
        
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: updatedTrees
        });
      });
  };

  const retrieveTree = async (searchCondition: any) => {
    let response: Tree.RetrieveRes[] = [];
    const result: Message = await treeService.retrieveTree(searchCondition);
    ApiResultExecutor(result, false, () => {
      response = result.msObject;
    });
    return response;
  }

  const deleteTree = async (data: Tree.RetrieveRes) => {
    const request = {
      id: data.id,
      type: data.type,
    };

    const result: Message = await treeService.deleteTree(request);
    ApiResultExecutor(result, false, () => {
      const parentTree: Tree.RetrieveRes | null = findTreeById(treeState.datas, data.parent);
      if (parentTree) {
        const children: Tree.RetrieveRes[] = parentTree.children;
        let targetIndex = 0;
        children.forEach((tree: Tree.RetrieveRes, index: number) => {
          tree.id === data.id && (targetIndex = index);
        })
        children.splice(targetIndex, 1);
        parentTree.children = children;

        const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, parentTree);
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: updatedTrees
        });
      }
    });
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
      if (parentTree) {
        const children: Tree.RetrieveRes[] = parentTree.children;
        let targetIndex = 0;
        children.forEach((tree: Tree.RetrieveRes, index: number) => {
          tree.id === data.id && (targetIndex = index);
        })
        children[targetIndex] = children[targetIndex-1];
        children[targetIndex-1] = data;
        parentTree.children = children;
        
        const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, parentTree);
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: updatedTrees
        });
      }
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
      if (parentTree) {
        const children: Tree.RetrieveRes[] = parentTree.children;
        let targetIndex = 0;
        children.forEach((tree: Tree.RetrieveRes, index: number) => {
          tree.id === data.id && (targetIndex = index);
        })
        children[targetIndex] = children[targetIndex+1];
        children[targetIndex+1] = data;
        parentTree.children = children;
        
        const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, parentTree);
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: updatedTrees
        });
      }
    });
  };

  // show
  const showCreate = async (data: Tree.RetrieveRes) => {
    treeDispatch({
      type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
      targetTree: data,
      actionType: Tree.ActionType.CREATE
    });
  }

  const showFile = async (data: Tree.RetrieveRes) => {
    treeDispatch({
      type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
      targetTree: data,
      actionType: Tree.ActionType.READ
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

  const showButtonGroup = (e:any , data: Tree.RetrieveRes) => {
    e.preventDefault();
    data.showBtnGroup = !data.showBtnGroup;
    const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, data);
    treeDispatch({
      type: TreeActionType.SET_SEARCH_RESULT,
      datas: updatedTrees
    });
  }
  // -- show

  useEffect(() => {
    // console.log('useEffect');
    showDirectories(treeState.searchCondition);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeState.upsertTree]);

  type myType = { data: Tree.RetrieveRes, index: number, folderTotalCount: number, fileTotalCount: number};
  const RecursiveComponent = ({data, index, folderTotalCount, fileTotalCount}: myType) => {
    const hasChildren = data.children ? true : false;
    let childFolderTotalCount = 0;
    let childFileTotalCount = 0;
    if (hasChildren) {
      childFolderTotalCount = data.children.filter(data => data.type === Tree.Type.FORDER).length;
      childFileTotalCount = data.children.filter(data => data.type === Tree.Type.FILE).length;
    }

    return (
      <div key={data.id} style={{ margin: "5px 0px 5px 5px"}}>
        {
          {
            [Tree.Type.FORDER]:
              <div> 
                <Button color='orange' onClick={() => showDirectories(data)} onContextMenu={(e: any) => showButtonGroup(e, data)}>
                  <Icon name='folder open outline' />
                  {data.name}
                </Button>
                {data.showBtnGroup && 
                  <Button.Group basic size='mini'>
                    <Button icon='plus square outline' onClick={() => showCreate(data)} />
                    <Button icon='edit outline' onClick={() => showEdit(data)} />
                    <Button icon='trash alternate outline' onClick={() => showDelete(data)} />
                    <Button icon='angle up' onClick={() => upTree(data)} style={{display: index === 0 && 'none'}} />
                    <Button icon='angle down' onClick={() => downTree(data)} style={{display: index === folderTotalCount-1 && 'none'}} />
                  </Button.Group>
                }
              </div>
            ,
            [Tree.Type.FILE]:
              <div>
                <Button color='blue' onClick={() => showFile(data)} onContextMenu={(e: any) => showButtonGroup(e, data)}>
                  <Icon name='file alternate outline' />
                  {data.name}
                </Button>
                {data.showBtnGroup && 
                  <Button.Group basic size='mini'>
                    <Button icon='edit outline' onClick={() => showEdit(data)} />
                    <Button icon='trash alternate outline' onClick={() => showDelete(data)} />
                    <Button icon='angle up' onClick={() => upTree(data)} style={{display: index === folderTotalCount && 'none'}} />
                    <Button icon='angle down' onClick={() => downTree(data)} style={{display: index === folderTotalCount+fileTotalCount-1 && 'none'}} />
                  </Button.Group>
                }
              </div>
          }[data.type]
        }
        {hasChildren && data.children.map((item: any, idx: number) => (
          <div key={data.id + idx} style={{marginLeft: "20px"}}>
            <RecursiveComponent key={item.id} data={item} index={idx} folderTotalCount={childFolderTotalCount} fileTotalCount={childFileTotalCount}/>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Button color='black' onClick={() => showDirectories(initialTree)} >
        user
      </Button>
      <Button.Group basic size='mini'>
        <Button icon='plus square outline' onClick={() => showCreate(initialTree)} />
      </Button.Group>
      {treeState.datas && treeState.datas!.map((data, index) => (
        <RecursiveComponent key={index} data={data} index={index} folderTotalCount={folderTotalCount} fileTotalCount={fileTotalCount}/>
      ))}
    </>
  )
}

export default TreeSection;