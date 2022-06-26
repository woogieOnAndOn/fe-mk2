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

interface PropTypes {  }

const TreeSection: React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const [selectedTrees, setSelectedTrees] = useState<Tree.RetrieveRes[]>([]);

  const initialTree: Tree.RetrieveRes = {
    id: 0,
    type: Tree.Type.FORDER,
    name: 'user',
    content: '',
    parent: 0,
    children: [],
  };

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
    const selectedTreeIds = selectedTrees.map((tree: Tree.RetrieveRes) => tree.id);

    selectedTrees.forEach((tree: Tree.RetrieveRes) => {
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

      showDirectories(data);
      setSelectedTrees([]);
    });
  }

  // show
  const showFolder = (data: Tree.RetrieveRes) => {
    if (data.children && data.children.length > 0) {
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

  const showSelectButton = () => {
    treeDispatch({
      type: TreeActionType.SET_SHOW_SELECT_BUTTON,
      showSelectButton: !treeState.showSelectButton,
    });
  };

  const showUpdateLocation = (data: Tree.RetrieveRes) => {
    const result = window.confirm(`선택 파일들을 ${data.name} 아래로 이동하시겠습니까?`);

    if (result) {
      updateLocationTree(data);
    }
  }
  // -- show

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
      <div key={data.id} style={{ margin: "5px 0px 5px 5px"}}>
        {
          {
            [Tree.Type.FORDER]:
              <div> 
                {treeState.showSelectButton && 
                  <Checkbox style={{ marginRight: "10px" }} onClick={(e: FormEvent<HTMLInputElement>)=> changeHandler(data)} checked={selectedTrees.includes(data) ? true : false} />
                }
                <Button color='orange' onClick={() => showFolder(data)} onContextMenu={(e: any) => showButtonGroup(e, data)}>
                  <Icon name='folder open outline' />
                  {data.name}
                </Button>
                {data.showBtnGroup &&
                  <Button.Group basic size='mini'>
                    {!treeState.showSelectButton &&
                      <>
                        <Button icon='plus square outline' onClick={() => showCreate(data)} />
                        <Button icon='edit outline' onClick={() => showEdit(data)} />
                        <Button icon='trash alternate outline' onClick={() => showDelete(data)} />
                        <Button icon='angle up' onClick={() => upTree(data)} style={{display: index === 0 && 'none'}} />
                        <Button icon='angle down' onClick={() => downTree(data)} style={{display: index === folderTotalCount-1 && 'none'}} />
                      </> 
                    }
                    {treeState.showSelectButton && !selectedTrees.includes(data) &&
                      <>
                        <Button icon='caret square left outline' onClick={() => showUpdateLocation(data)} />
                      </>
                    }
                  </Button.Group>
                }
              </div>
            ,
            [Tree.Type.FILE]:
              <div>
                {treeState.showSelectButton && 
                  <Checkbox style={{ marginRight: "10px" }} onClick={(e: FormEvent<HTMLInputElement>)=> changeHandler(data)} checked={selectedTrees.includes(data) ? true : false} />
                }
                <Button color='blue' onClick={() => showFile(data)} onContextMenu={(e: any) => showButtonGroup(e, data)}>
                  <Icon name='file alternate outline' />
                  {data.name}
                </Button>
                  {data.showBtnGroup && !treeState.showSelectButton && 
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
      <Button.Group widths='2' color='green' style={{ margin: "0px 0px 8px 0px"}}>
        <Button onClick={showSelectButton} >파일 이동</Button>
      </Button.Group>
      <Button color='black' onClick={() => showDirectories(initialTree)} >
        {initialTree.name}
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