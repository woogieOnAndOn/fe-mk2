/* eslint-disable @typescript-eslint/no-unused-vars */
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card } from 'semantic-ui-react'
import React, { useState, useEffect, useContext } from 'react';
import { TreeContext } from '../../../contexts/TreeContext';
import { TreeActionType } from '../../../reducer/tree/actions';

import TreeService from '../../../service/tree.service';
import { RequestCreateTree, RequestUpdateTree, ActionType, TreeType, Tree } from '../../../model/tree.model';
import { Message } from '../../../model/common.model';
import parseMd from '../../../util/Parser.util';

interface PropTypes {  }

const EditSection:  React.FC<PropTypes> = (props: PropTypes) => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const treeService = new TreeService();

  const [type, setType] = useState<number>(TreeType.FILE);
  const [title, setTitle] = useState<string>('');
  const [contentMd, setContentMd] = useState<string>('');
  const [secret, setSecret] = useState<number>(0);

  const insertTree = async () => {
    const request: RequestCreateTree = {
      type: type,
      name: title,
      content: contentMd,
      depth: treeState.targetTree!.depth + 1 || 1,
      parent: treeState.targetTree!.id || 0,
      secret: secret,
    };

    const result: Message = await treeService.insertTree(request);
    if (result && result.msId) {
      const insertedTree: Tree = result.msObject;
      treeDispatch({
        type: TreeActionType.SET_UPSERT_TREE,
        searchCondition: treeState.targetTree,
        searchIndex: treeState.targetTree!.upperIndex[treeState.targetTree!.upperIndex.length-1],
        upsertTree: request,
      });
      treeDispatch({
        type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
        targetTree: insertedTree,
        actionType: ActionType.READ
      });
      setTitle('');
      setContentMd('');
      document.getElementById('fileViewContent')!.innerHTML = await parseMd(result.msObject.content);
    } else {
      alert(result.msContent);
    }
  }

  const updateTree = async (afterType= 'continue') => {
    try {
      const request: RequestUpdateTree = {
        id: treeState.targetTree!.id,
        name: title,
        content: contentMd,
        secret: secret,
      };
  
      const result: Message = await treeService.updateTree(request);
      if (result && result.msId) {
        alert(result.msContent);
        treeDispatch({
          type: TreeActionType.SET_UPSERT_TREE,
          searchCondition: treeState.targetTree?.parent,
          searchIndex: treeState.targetTree!.upperIndex[treeState.targetTree!.upperIndex.length-1],
          upsertTree: request,
        });
        if (afterType === 'finish') {
          treeDispatch({
            type: TreeActionType.SET_TARGET_TREE_AND_ACTION_TYPE,
            targetTree: result.msObject,
            actionType: ActionType.READ
          });
          document.getElementById('fileViewContent')!.innerHTML = await parseMd(result.msObject.content);
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
    document.getElementById('preview')!.innerHTML = await parseMd(contentMd);
  }

  useEffect(() => {
    // console.log('useEffect');
    if (treeState.actionType === ActionType.UPDATE) {
      // console.log(ActionType.UPDATE);
      setType(treeState.targetTree!.type);
      setTitle(treeState.targetTree!.name);
      setContentMd(treeState.targetTree!.content);
      setSecret(treeState.targetTree!.secret);
    } else {
      // console.log(ActionType.CREATE);
      setType(TreeType.FILE);
      setTitle('');
      setContentMd('');
      setSecret(0);      
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
            placeholder='이름' 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </Form.Field>

        {/* 내용 */}
        {type === TreeType.FILE &&
          <Form.Field
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
              setContentMd(e.target.value);
              parseMdAndSetPreview(e.target.value);
            }}
          />
        }
        <Container fluid id='preview'></Container>
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
            updateTree();
          }} >
            수정
          </Button>
        }
      </Form>
    </>
  )
}

export default EditSection;