/* eslint-disable @typescript-eslint/no-unused-vars */
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card } from 'semantic-ui-react'
import React, { useState, useEffect, useContext } from 'react';
import { TreeContext } from '../../../contexts/TreeContext';
import { TreeActionType } from '../../../reducer/tree/actions';

import TreeService from '../../../service/tree.service';
import { RequestCreateTree, RequestUpdateTree, ActionType, TreeType, Tree } from '../../../model/tree.model';
import { Message } from '../../../model/common.model';
import parseMd from '../../../util/Parser.util';
import { findAndUpdateTree } from '../../../util/Tree.util';

interface PropTypes {  }

const EditSection:  React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const [inputs, setInputs] = useState({
    title: '',
    contentMd: '',
    secret: 0,
  });

  const {title, contentMd, secret} = inputs;

  const handleOnChange = (e: any) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  }

  const [type, setType] = useState<number>(TreeType.FILE);
  const [contentHtml, setContentHtml] = useState<string>('');

  const insertTree = async () => {
    const request: RequestCreateTree = {
      type: type,
      name: title,
      content: contentMd,
      depth: treeState.targetTree.depth + 1 || 1,
      parent: treeState.targetTree.id || 0,
      secret: secret,
    };

    const result: Message = await treeService.insertTree(request);
    if (result && result.msId) {
      const insertedTree: Tree = result.msObject;
      treeDispatch({
        type: TreeActionType.SET_UPSERT_TREE,
        searchCondition: treeState.targetTree,
        upsertTree: request,
      });

      treeDispatch({
        type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
        targetTree: insertedTree,
        actionType: ActionType.READ
      });
      
      setInputs({
        ...inputs,
        title: '',
        contentMd: '',
      });
    } else {
      alert(result.msContent);
    }
  }

  const updateTree = async (afterType= 'continue') => {
    try {
      const request: RequestUpdateTree = {
        id: treeState.targetTree.id,
        name: title,
        content: contentMd,
        secret: secret,
      };
  
      const result: Message = await treeService.updateTree(request);
      if (result && result.msId) {
        alert(result.msContent);
        let tmpState: Tree[] = treeState.datas;
        const updatedTrees: Tree[] = findAndUpdateTree(tmpState, result.msObject);
        
        treeDispatch({
          type: TreeActionType.SET_SEARCH_RESULT,
          datas: updatedTrees
        });
        if (afterType === 'finish') {
          treeDispatch({
            type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
            targetTree: result.msObject,
            actionType: ActionType.READ
          });
        }
      } else {
        alert(result.msContent);
      }
    } catch (err) {
      window.location.reload();
      throw err;
    }
  }

  const parseMdAndSetPreview = async (contentMd: string) => {
    setContentHtml(await parseMd(contentMd));
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
    parseMdAndSetPreview(contentMd + htmlString);
  }

  useEffect(() => {
    const asyncParseMd = async (data: string) => {
      return await parseMd(data);
    };

    if (treeState.actionType === ActionType.UPDATE) {
      setInputs({
        ...inputs,
        title: treeState.targetTree.name,
        contentMd: treeState.targetTree.content,
        secret: treeState.targetTree.secret,
      });
      setType(treeState.targetTree.type);
      asyncParseMd(treeState.targetTree.content).then(res => {
        setContentHtml(res);
      });
    } else {
      setInputs({
        ...inputs,
        title: '',
        contentMd: '',
        secret: 0,
      });
      setType(TreeType.FILE);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeState.actionType, treeState.targetTree]);

  return (
    <>
      <Form style={{display: treeState.actionType !== ActionType.CREATE && treeState.actionType !== ActionType.UPDATE && 'none'}}>
        {/* 타입 */}
        <Form.Group inline>
          <label>타입</label>
          <Form.Field
            control={Radio}
            label='폴더'
            value={TreeType.FORDER}
            disabled={treeState.actionType === ActionType.UPDATE && true}
            checked={type === TreeType.FORDER}
            onChange={() => setType(TreeType.FORDER)}
          />
          <Form.Field
            control={Radio}
            label='파일'
            value={TreeType.FILE}
            disabled={treeState.actionType === ActionType.UPDATE && true}
            checked={type === TreeType.FILE}
            onChange={() => setType(TreeType.FILE)}
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
        {type === TreeType.FILE &&
          <Form.Input type='file' multiple="multiple" onChange={handleChangeFile} accept='image/*' />
        }

        {/* 내용 */}
        {type === TreeType.FILE &&
          <Form.Field
            name='contentMd'
            control={TextArea}
            label='내용'
            style={{ minHeight: 500 }}
            placeholder='내용을 입력해 주세요'
            value={contentMd}
            onKeyPress= {(e: any) => {
              if (e.key === 'Enter' && e.ctrlKey && !e.shiftKey) {
                if (treeState.actionType === ActionType.UPDATE) updateTree();
                else if (treeState.actionType === ActionType.CREATE) insertTree();
              } else if (e.key === 'Enter' && e.ctrlKey && e.shiftKey) {
                if (treeState.actionType === ActionType.UPDATE) updateTree('finish');
              }
            }}
            onChange={(e: any) => {
              handleOnChange(e);
              parseMdAndSetPreview(e.target.value);
            }}
          />
        }
        <Container fluid dangerouslySetInnerHTML={{__html: contentHtml}}></Container>
        {treeState.actionType === ActionType.CREATE ? 
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