/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactNode, useState, useEffect } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS } from 'semantic-ui-react'
import './KanbanPage.css';
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import * as Issue from '../../model/issue.model'
import KanbanService from '../../service/kanban.service';
import * as commonModel from '../../model/common.model';
import AcceptableColumn from './component/AcceptableColumn';
import MovableItem from './component/MovableItem';
import ApiResultExecutor from '../../scripts/common/ApiResultExecutor.util';

const KanbanPage = () => {
  const kanbanService = new KanbanService();

  const [issues, setIssues] = useState<Issue.RetrieveRes[]>([]);
  const [reset, setReset] = useState(false);
  const [showActionBtns, setShowActionBtns] = useState<boolean>(false);

  useEffect(() => {
    const retrieveIssue = async () => {
      const result: commonModel.Message = await kanbanService.retrieveIssue();
      ApiResultExecutor(result, false, () => setIssues(result.msObject));
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
    <>
      {issues && issues.length > 0 && 
        <Grid columns='equal'>
          <Grid.Row>
            <DndProvider backend={HTML5Backend}>
              <AcceptableColumn issueState={Issue.State.WAIT} labelColor={'green'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
                {issues.map((data, index) => (
                  data.issueState === Issue.State.WAIT && <MovableItem key={index} issues={issues} setIssues={setIssues} setReset={setReset} issue={data} showActionBtns={showActionBtns} />
                ))}
              </AcceptableColumn>
              <AcceptableColumn issueState={Issue.State.START} labelColor={'yellow'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
                {issues.map((data, index) => (
                  data.issueState === Issue.State.START && <MovableItem key={index} issues={issues} setIssues={setIssues} setReset={setReset} issue={data} showActionBtns={showActionBtns} />
                ))}
              </AcceptableColumn>
            </DndProvider>
          </Grid.Row>
          <Grid.Row>
            <DndProvider backend={HTML5Backend}>
              <AcceptableColumn issueState={Issue.State.COMPLETE} labelColor={'blue'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
                {issues.map((data, index) => (
                  data.issueState === Issue.State.COMPLETE && <MovableItem key={index} issues={issues} setIssues={setIssues} setReset={setReset} issue={data} showActionBtns={showActionBtns} />
                ))}
              </AcceptableColumn>
              <AcceptableColumn issueState={Issue.State.END} labelColor={'red'} issues={issues} setIssues={setIssues} setReset={setReset} showActionBtns={showActionBtns} setShowActionBtns={setShowActionBtns} >
                {issues.map((data, index) => (
                  data.issueState === Issue.State.END && <MovableItem key={index} issues={issues} setIssues={setIssues} setReset={setReset} issue={data} showActionBtns={showActionBtns} />
                ))}
              </AcceptableColumn>
            </DndProvider>
          </Grid.Row>
        </Grid>
      }
    </>
  )
}

export default KanbanPage;