/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactNode, useState, useEffect, ReactElement } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS } from 'semantic-ui-react'
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
} from '../../../model/issue.model'
import KanbanService from '../../../service/kanban.service';
import * as commonModel from '../../../model/common.model';

interface ColumnProps {
  children?: ReactNode;
  labelColor: SemanticCOLORS;
  issueState: IssueState;
  issues: Issue[];
  setIssues: Function;
  setReset: Function;
  showActionBtns: boolean
  setShowActionBtns: Function;
}

const AcceptableColumn: React.FC<ColumnProps> = (props: ColumnProps): ReactElement => {
  const {
    children,
    labelColor,
    issueState,
    issues,
    setIssues,
    setReset,
    showActionBtns,
    setShowActionBtns,
  } = props;
  const kanbanService = new KanbanService();

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [issueAndCheck, setIssueAndCheck] = useState<string>('');

  const [{canDrop, isOver}, drop] = useDrop(() => ({
    accept: ComponentType.ISSUE,
    drop: async (item: Issue, monitor: DropTargetMonitor) => {
      const updateResult: commonModel.Message = await kanbanService.updateState({
        issueId: item.issueId,
        issueState: issueState
      });

      if (updateResult.msId) {
        let updateUseTimeResult: commonModel.Message = {
          msId: 1,
          msContent: '',
        };
        switch (issueState) {
          case IssueState.WAIT:
            if (item.issueState === IssueState.START) updateUseTimeResult = await kanbanService.updateUseTime({ issueId: item.issueId });
            break;
          case IssueState.START:
            break;
          case IssueState.COMPLETE:
            if (item.issueState === IssueState.START) updateUseTimeResult = await kanbanService.updateUseTime({ issueId: item.issueId });
            break;
          case IssueState.END:
            break;
          default: break;
        }
        if (!updateUseTimeResult) alert(updateResult.msContent);
      } else {
        alert(updateResult.msContent);
      }
      item.issueState = issueState;
      let targetIndex = 0;
      let tmpIssues = issues;
      for (let i = 0; i < tmpIssues.length; i++) {
        if (tmpIssues[i].issueId === item.issueId) targetIndex = i;
      }
      tmpIssues[targetIndex] = item;
      setIssues(tmpIssues);
      setReset(true);
    },
    canDrop: (item: Issue, monitor: DropTargetMonitor) => {
      let flag = false;
      switch (issueState) {
        case IssueState.WAIT:
          flag = [IssueState.START].includes(item.issueState);
          break;
        case IssueState.START:
          flag = [IssueState.WAIT, IssueState.COMPLETE].includes(item.issueState);
          break;
        case IssueState.COMPLETE:
          flag = [IssueState.START, IssueState.END].includes(item.issueState);
          break;
        case IssueState.END:
          flag = [IssueState.COMPLETE].includes(item.issueState);
          break;
        default:
          break;
      }
      return flag
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    })
  }));

  const insertIssue = async () => {
    const request: RequestCreateIssue = {
      issueName: issueAndCheck,
    }
    const response: commonModel.Message = await kanbanService.insertIssue(request);
    if (response.msId) {
      const returnedObject = response.msObject;
      const insertedIssue: Issue = {
        issueId: returnedObject.id,
        issueName: returnedObject.issueName,
        issueState: IssueState.WAIT,
        useTime: 0.0,
      };
      let tmpIssues: Issue[] = issues;
      tmpIssues.push(insertedIssue);
      setIssueAndCheck('');
      setIssues(tmpIssues);
      setReset(true);
    }
  };

  return (
    <Grid.Column style={{marginTop: '15px', marginLeft: issueState === IssueState.WAIT && '20px', marginRight: issueState === IssueState.END && '20px'}}>
      <Segment>

        <Label as='a' color={labelColor} ribbon onClick={() => setShowActionBtns(!showActionBtns)} >
          {issueState}
        </Label>

        {showActionBtns && issueState === IssueState.WAIT &&
          <Button.Group basic size='mini' >
            <Button icon='plus square outline' onClick={() => setShowCreateForm(!showCreateForm)} />
          </Button.Group>
        }

        <div ref={drop} style={{ minHeight: '500px', marginTop: '10px' }}>
        
          {showCreateForm && issueState === IssueState.WAIT &&
            <Form style={{margin: '20px 0px'}}>
              <Form.Field 
                control={TextArea} 
                value={issueAndCheck}
                style={{minHeight: 200}}
                onKeyPress= {(e: any) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    insertIssue();
                  } 
                }}
                onChange={(e: any) => {
                  setIssueAndCheck(e.target.value);
                }}
              />
            </Form>
          }

          {children}
        </div>
      </Segment>
    </Grid.Column>
  )
}

export default AcceptableColumn;