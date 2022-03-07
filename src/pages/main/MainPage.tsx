/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import './MainPage.css';
import React, { useState, useEffect, ReactElement } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card } from 'semantic-ui-react'

import { TreeContext, TreeProvider } from '../../contexts/TreeContext';
import { TreeActionType } from '../../reducer/tree/actions'
import { Tree, ActionType } from '../../model/tree.model';

import TreeSection from './component/TreeSection';
import PathSection from './component/PathSection';
import EditSection from './component/EditSection';
import { useContext } from 'react';

const MainPage: React.FC = (): ReactElement => {
  const { treeState, treeDispatch } = useContext(TreeContext);
  const [divided, setDivided] = useState<boolean>(true);

  return (
    <Container fluid>
      <a className={'float expand'} onClick={() => {
        setDivided(divided => {return !divided});
      }}>
        <Icon className={'arrows alternate horizontal'} />
      </a>
      
      {/* 파일경로 */}
      <PathSection />
      
      <Grid stackable columns={2}>
        <Grid.Column width={6}>
          <div style={{display: divided ? 'block' : 'none'}}>
            <Segment>
              {/* 디렉토리 */}
              <TreeSection/>
            </Segment>
          </div>
        </Grid.Column>
        <Grid.Column width={divided ? 10 : 16}>
          <Segment>

            {/* 작성 & 수정 */}
            <EditSection />

            {/* 파일 조회 뷰 */}
            <div className='fileView' style={{display: treeState.actionType !== ActionType.READ ? 'none' : 'block'}}>
              <div id='fileViewContent'></div>
            </div>
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default MainPage;