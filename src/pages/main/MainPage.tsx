/* eslint-disable jsx-a11y/anchor-is-valid */
import './MainPage.css';
import React, { useState, useEffect, ReactElement, useRef } from 'react';
import { Icon, Container, Grid, Segment } from 'semantic-ui-react'

import { TreeContext } from '../../contexts/TreeContext';
import * as Tree from '../../model/tree.model';

import TreeSection from './section/TreeSection';
import PathSection from './section/PathSection';
import EditSection from './section/EditSection';
import { useContext } from 'react';

import parseMd from '../../scripts/common/Parser.util';
import EditButtonGroup from './component/EditButtonGroup';

const MainPage: React.FC = (): ReactElement => {
  const { treeState } = useContext(TreeContext);
  const [divided, setDivided] = useState<boolean>(true);
  const [contentHtml, setContentHtml] = useState<string>('');
  const editSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const asyncParseMd = async (data: string) => {
      return await parseMd(data);
    };

    asyncParseMd(treeState.targetTree.content).then(res => {
      setContentHtml(res);
    });

    editSection.current?.focus();
  }, [treeState.targetTree])

  return (
    <Container fluid id="MainPage">
      {/* 우측 상단 확장버튼 */}
      <a className={'float expand'} onClick={() => {
        setDivided(!divided);
      }}>
        <Icon className={'arrows alternate horizontal'} />
      </a>
      
      {/* 파일경로 */}
      <PathSection />
      
      <Grid stackable columns={2}>
        {/* 트리영역 */}
        <Grid.Column width={6}>
          <div style={{display: divided ? 'block' : 'none'}}>
            <Segment>
              {/* 디렉토리 */}
              <TreeSection/>
            </Segment>
          </div>
        </Grid.Column>

        {/* 작성 OR 조회영역 */}
        <Grid.Column width={divided ? 10 : 16}>
          <Segment>
            {/* 파일 조회 시의 focus용 */}
            <div ref={editSection} tabIndex={-1}></div>

            {/* 작성 & 수정 */}
            <EditSection />

            {/* 파일 조회 뷰 */}
            {treeState.actionType === Tree.ActionType.READ &&
              <div className='fileView'>
                {/* 수정 & 삭제 버튼 */}
                <EditButtonGroup 
                  targetTree={treeState.targetTree} 
                  showButtonList={[Tree.ActionType.UPDATE, Tree.ActionType.DELETE]}
                  floated={'right'}
                />
                <div dangerouslySetInnerHTML={{__html: contentHtml}}></div>
              </div>
            }
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default MainPage;