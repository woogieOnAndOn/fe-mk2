/* eslint-disable @typescript-eslint/no-unused-vars */
import { Icon, Button, Checkbox } from 'semantic-ui-react'
import React, { useState, useEffect, useContext, FormEvent } from 'react';
import { TreeContext, TreeProvider } from '../../../contexts/TreeContext';
import { TreeActionType } from '../../../reducer/tree/actions';
import TreeService from '../../../service/tree.service';

import { Message } from '../../../model/common.model';
import * as Tree from '../../../model/tree.model';
import { findAndUpdateTree, findIndexById, findTreeById } from '../../../scripts/tree/Tree.util';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';

import EditButtonGroup from '../component/EditButtonGroup';
import { initialState } from '../../../reducer/tree/index';

interface PropTypes {  }

const TreeSection: React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const [selectedTrees, setSelectedTrees] = useState<Tree.RetrieveRes[]>([]);

  const folderTotalCount = treeState.datas && treeState.datas!.filter(data => data.type === Tree.Type.FORDER).length;
  const fileTotalCount = treeState.datas && treeState.datas!.filter(data => data.type === Tree.Type.FILE).length;

  const changeHandler = (checkedTree: Tree.RetrieveRes) => {
    const children = checkedTree.children ? checkedTree.children : [];
    if (selectedTrees.includes(checkedTree)) {
      setSelectedTrees(selectedTrees.filter((tree: Tree.RetrieveRes) => tree.id !== checkedTree.id && !children.map((child: Tree.RetrieveRes) => child.id).includes(tree.id)));
    } else {
      setSelectedTrees([...selectedTrees, checkedTree, ...children]);
    }
  };

  const retrieveTree = async (searchCondition: any) => {
    let response: Tree.RetrieveRes[] = [];
    const result: Message = await treeService.retrieveTree(searchCondition);
    ApiResultExecutor(result, false, () => {
      response = result.msObject;
    });
    return response;
  }

  // show
  const showFolder = (data: Tree.RetrieveRes) => {
    if (data.id !== 0 &&data.children && data.children.length > 0) {
      data.children = [];
      const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, data);
      treeDispatch({
        type: TreeActionType.SET_SEARCH_RESULT,
        datas: updatedTrees
      });
    } else {
      showDirectories(data);
    }
  }

  const showFile = async (data: Tree.RetrieveRes) => {
    treeDispatch({
      type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
      targetTree: data,
      actionType: Tree.ActionType.READ
    });
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

  const showDirectories = async (data: Tree.RetrieveRes) => {
    const newSearchCondition: Tree.RetrieveReq = {
      parent: data.id,
    };
    retrieveTree(newSearchCondition)
      .then(response => {
        let updatedTrees: Tree.RetrieveRes[] = [];
        if (newSearchCondition.parent === 0) {
          const initialTrees = [initialState.targetTree];
          initialTrees[0].children = response;
          updatedTrees = initialTrees;
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

  const showSelectButton = () => {
    treeDispatch({
      type: TreeActionType.SET_SHOW_SELECT_BUTTON,
      showSelectButton: !treeState.showSelectButton,
    });
  };

  useEffect(() => {
    // console.log('useEffect');
    showDirectories(treeState.searchCondition);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeState.searchCondition]);

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
      <div key={data.id} style={{ margin: "5px 0px 5px 0px"}}>
        <div>
          {treeState.showSelectButton && 
            <Checkbox 
              style={{ marginRight: "10px" }} 
              onClick={(e: FormEvent<HTMLInputElement>)=> changeHandler(data)} 
              checked={selectedTrees.includes(data) ? true : false} 
            />
          }
          <Button 
            color={data.type === Tree.Type.FORDER ? (data.id === 0 ? 'black' : 'orange') : 'blue'}
            onClick={() => data.type === Tree.Type.FORDER ? showFolder(data) : showFile(data)} 
            onContextMenu={(e: any) => showButtonGroup(e, data)}
          >
            {data.id !== 0 && <Icon name={data.type === Tree.Type.FORDER ? 'folder open outline' : 'file alternate outline'} />}
            {data.name}
          </Button>
          {data.showBtnGroup &&
            <EditButtonGroup 
              targetTree={data}
              showButtonList={[Tree.ActionType.CREATE, Tree.ActionType.UPDATE, Tree.ActionType.DELETE, Tree.ActionType.UP, Tree.ActionType.DOWN]}
              targetTreeIndex={index}
              folderTotalCount={folderTotalCount}
              fileTotalCount={fileTotalCount}
              selectedTrees={selectedTrees}
              setSelectedTrees={setSelectedTrees}
              showDirectories={showDirectories}
            />
          }
        </div>
        {hasChildren && data.children.map((item: any, idx: number) => (
          <div key={data.id + idx} style={item.parent === 0 ? {marginLeft: "10px"} : {marginLeft: "20px"}}>
            <RecursiveComponent key={item.id} data={item} index={idx} folderTotalCount={childFolderTotalCount} fileTotalCount={childFileTotalCount}/>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Button.Group widths='2' color='green'>
        <Button onClick={showSelectButton} >파일 이동</Button>
      </Button.Group>
      {treeState.datas && treeState.datas!.map((data, index) => (
        <RecursiveComponent key={index} data={data} index={index} folderTotalCount={folderTotalCount} fileTotalCount={fileTotalCount}/>
      ))}
    </>
  )
}

export default TreeSection;