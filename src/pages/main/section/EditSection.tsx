/* eslint-disable @typescript-eslint/no-unused-vars */
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card } from 'semantic-ui-react'
import React, { useState, useEffect, useContext } from 'react';
import { TreeContext } from '../../../contexts/TreeContext';
import { TreeActionType } from '../../../reducer/tree/actions';

import TreeService from '../../../service/tree.service';
import * as Tree from '../../../model/tree.model';
import { Message } from '../../../model/common.model';
import parseMd from '../../../scripts/common/Parser.util';
import { findAndUpdateTree } from '../../../scripts/tree/Tree.util';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';

interface PropTypes {  }

const EditSection:  React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const [inputs, setInputs] = useState({
    title: '',
    contentMd: '',
  });

  const {title, contentMd} = inputs;

  const handleOnChange = (e: any) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  }

  const [type, setType] = useState<number>(Tree.Type.FILE);
  const [contentHtml, setContentHtml] = useState<string>('');

  const insertTree = async () => {
    const request: Tree.CreateReq = {
      type: type,
      name: title,
      content: contentMd,
      parent: treeState.targetTree.id || 0,
    };

    const result: Message = await treeService.insertTree(request);
    ApiResultExecutor(result, false, () => {
      const insertedTree: Tree.RetrieveRes = result.msObject;
      treeDispatch({
        type: TreeActionType.SET_SEARCH_CONDITION,
        searchCondition: {...treeState.targetTree},
      });

      treeDispatch({
        type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
        targetTree: insertedTree,
        actionType: Tree.ActionType.READ
      });
      
      setInputs({
        ...inputs,
        title: '',
        contentMd: '',
      });
    });
  }

  const updateTree = async (afterType= 'continue') => {
    const request: Tree.UpdateReq = {
      id: treeState.targetTree.id,
      name: title,
      content: contentMd,
    };

    const result: Message = await treeService.updateTree(request);
    ApiResultExecutor(result, true, () => {
      const updatedTrees: Tree.RetrieveRes[] = findAndUpdateTree(treeState.datas, result.msObject);
      
      treeDispatch({
        type: TreeActionType.SET_SEARCH_RESULT,
        datas: updatedTrees
      });
      if (afterType === 'finish') {
        treeDispatch({
          type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
          targetTree: result.msObject,
          actionType: Tree.ActionType.READ
        });
      }
    });
  }

  const handleChangeFile = async (event: any) => {
    const formData = new FormData();
    const filesData = event.target.files;
    for (let file of filesData) {
      formData.append("files", file);
    }
    const result: {paths: string[]} = await treeService.uploadFile(formData);
    let htmlString = '\n';
    for (let path of result.paths) {
      htmlString += `<img src='${path}'/> \n`;
    }
    setInputs({
      ...inputs,
      contentMd: contentMd + htmlString
    });
    setContentHtml(await parseMd(contentMd + htmlString));
  }

  useEffect(() => {
    const asyncParseMd = async (data: string) => {
      return await parseMd(data);
    };

    if (treeState.actionType === Tree.ActionType.UPDATE) {
      setInputs({
        ...inputs,
        title: treeState.targetTree.name,
        contentMd: treeState.targetTree.content,
      });
      setType(treeState.targetTree.type);
      asyncParseMd(treeState.targetTree.content).then(res => {
        setContentHtml(res);
      });
    } else {
      const template = treeState.targetTree.content || '';
      setInputs({
        ...inputs,
        title: '',
        contentMd: template,
      });
      setType(Tree.Type.FILE);
      setContentHtml(template);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeState.actionType, treeState.targetTree]);

  // 타입 변경 시 내용 삭제 처리(폴더 수정시 템플릿 항목에 내용이 안들어 오는 이슈로 주석처리)
  // useEffect(() => {
  //   handleOnChange({ 
  //     target: { name: 'contentMd', value: '' }
  //   });
  //   setContentHtml('');
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [type]);

  useEffect(() => {
    const asyncParseMd = async (data: string) => {
      return await parseMd(data);
    };

    asyncParseMd(contentMd).then(res => {
      setContentHtml(res);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentMd])

  return (
    <>
      <Form style={{display: treeState.actionType !== Tree.ActionType.CREATE && treeState.actionType !== Tree.ActionType.UPDATE && 'none'}}>
        {/* 타입 */}
        <Form.Group inline>
          <label>타입</label>
          <Form.Field
            control={Radio}
            label='폴더'
            value={Tree.Type.FORDER}
            disabled={treeState.actionType === Tree.ActionType.UPDATE && true}
            checked={type === Tree.Type.FORDER}
            onChange={() => setType(Tree.Type.FORDER)}
          />
          <Form.Field
            control={Radio}
            label='파일'
            value={Tree.Type.FILE}
            disabled={treeState.actionType === Tree.ActionType.UPDATE && true}
            checked={type === Tree.Type.FILE}
            onChange={() => setType(Tree.Type.FILE)}
          />
        </Form.Group>

        {/* 이름 */}
        <Form.Field>
          <label>이름</label>
          <Form.Input
            name='title'
            placeholder='이름' 
            value={title} 
            onChange={handleOnChange} 
          />
        </Form.Field>

        {/* 이미지 첨부 */}
        <Form.Input type='file' multiple="multiple" onChange={handleChangeFile} accept='image/*' />

        {/* 내용 */}
        <Form.Field
          name='contentMd'
          control={TextArea}
          label={type === Tree.Type.FILE ? '내용' : '템플릿'}
          style={{ minHeight: 500 }}
          placeholder='내용을 입력해 주세요'
          value={contentMd}
          onKeyPress= {(e: any) => {
            if (treeState.actionType === Tree.ActionType.UPDATE) {
              if (e.key === 'Enter' && e.ctrlKey && !e.shiftKey) {
                updateTree();
              } else if (e.key === 'Enter' && e.ctrlKey && e.shiftKey) {
                updateTree('finish');
              }
            } else if (treeState.actionType === Tree.ActionType.CREATE) {
              if (e.key === 'Enter' && e.ctrlKey) {
                insertTree();
              }
            }
          }}
          onChange={(e: any) => {
            handleOnChange(e);
          }}
        />
        <Container fluid dangerouslySetInnerHTML={{__html: contentHtml}}></Container>
        {treeState.actionType === Tree.ActionType.CREATE ? 
          <Button primary type='submit' onClick={(e) => {
            e.preventDefault();
            insertTree();
          }} >
            생성
          </Button>
        : 
          <Button color='green' type='submit' onClick={(e) => {
            e.preventDefault();
            updateTree('finish');
          }} >
            수정
          </Button>
        }
      </Form>
    </>
  )
}

export default EditSection;