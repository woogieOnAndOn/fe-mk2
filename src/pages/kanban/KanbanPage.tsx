/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactNode, useState, useEffect } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS } from 'semantic-ui-react'
import './KanbanPage.css';
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  ComponentType, 
  IssueState, 
  Issue,
  RequestCreateIssue,
  RequestUpdateIssueName,
  RequestUpdateIssueUseTime,
  RequestUpdateIssueState,
  RequestDeleteIssue,
  ResponseRetrieveIssue,
} from '../../model/issue.model'
import KanbanService from '../../service/kanban.service';
import * as commonModel from '../../model/common.model';

import AcceptableColumn from './component/AcceptableColumn';
import MovableItem from './component/MovableItem';

export interface ColumnProps {
  children?: ReactNode;
  labelColor: SemanticCOLORS;
  issueState: IssueState;
}

const KanbanPage = () => {
  const kanbanService = new KanbanService();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [reset, setReset] = useState(false);
  const [showActionBtns, setShowActionBtns] = useState<boolean>(false);

  useEffect(() => {
    const retrieveIssue = async () => {
      let response = [];
      const result: commonModel.Message = await kanbanService.retrieveIssue();
      if (result && result.msId) {
        response = result.msObject;
        setIssues(response);
      } else {
        alert(result.msContent);
      }
    };
    retrieveIssue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reset) {
      setReset(false);
    }
  }, [reset]);

  return (
    <Grid columns='equal'>
      <Grid.Row>
        <DndProvider backend={HTML5Backend}>
          <AcceptableColumn issueState={IssueState.WAIT} labelColor={'green'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
            {issues.map((data, index) => (
              data.issueState === IssueState.WAIT && <MovableItem key={index} issue={data} showActionBtns={showActionBtns} />
            ))}
          </AcceptableColumn>
          <AcceptableColumn issueState={IssueState.START} labelColor={'yellow'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
            {issues.map((data, index) => (
              data.issueState === IssueState.START && <MovableItem key={index} issue={data} showActionBtns={showActionBtns} />
            ))}
          </AcceptableColumn>
          <AcceptableColumn issueState={IssueState.COMPLETE} labelColor={'blue'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
            {issues.map((data, index) => (
              data.issueState === IssueState.COMPLETE && <MovableItem key={index} issue={data} showActionBtns={showActionBtns} />
            ))}
          </AcceptableColumn>
          <AcceptableColumn issueState={IssueState.END} labelColor={'red'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
            {issues.map((data, index) => (
              data.issueState === IssueState.END && <MovableItem key={index} issue={data} showActionBtns={showActionBtns} />
            ))}
          </AcceptableColumn>
        </DndProvider>
      </Grid.Row>
    </Grid>
  )
}

export default KanbanPage;