/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactNode, useState, useEffect, ReactElement } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS } from 'semantic-ui-react'
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import * as Issue from '../../../model/issue.model'
import KanbanService from '../../../service/kanban.service';
import * as commonModel from '../../../model/common.model';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';
import './MovableItem.css'
import EditForm from './EditForm';

interface ColumnProps {
  children?: ReactNode;
  labelColor: SemanticCOLORS;
  issueState: Issue.State;
  issues: Issue.RetrieveRes[];
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

  const initialIssue: Issue.RetrieveRes = {
    issueId: 0,
    issueName: '',
    issueState: Issue.State.WAIT,
    useTime: 0.0,
    creationDate: '',
    issueChecks: [],
  };

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [createdIssue, setCreatedIssue] = useState<Issue.RetrieveRes>(initialIssue);
  
  const [{canDrop, isOver}, drop] = useDrop(() => ({
    accept: Issue.ComponentType.ISSUE,
    drop: async (item: Issue.RetrieveRes, monitor: DropTargetMonitor) => {
      const updateResult: commonModel.Message = await kanbanService.updateState({
        issueId: item.issueId,
        issueState: issueState
      });

      ApiResultExecutor(updateResult);

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
    canDrop: (item: Issue.RetrieveRes, monitor: DropTargetMonitor) => {
      let flag = false;
      switch (issueState) {
        case Issue.State.WAIT:
          flag = [Issue.State.START].includes(item.issueState);
          break;
        case Issue.State.START:
          flag = [Issue.State.WAIT, Issue.State.COMPLETE].includes(item.issueState);
          break;
        case Issue.State.COMPLETE:
          flag = [Issue.State.START, Issue.State.END].includes(item.issueState);
          break;
        case Issue.State.END:
          flag = [Issue.State.COMPLETE].includes(item.issueState);
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

  const handleAfterEdit = () => {
    setShowCreateForm(false);
  }

  useEffect(() => {
    const createdIssueAlreadyPushed: boolean = issues.some((issue: Issue.RetrieveRes) => issue.issueId === createdIssue.issueId);
    if (createdIssue.issueId !== 0 && !createdIssueAlreadyPushed) {
      setIssues([...issues, createdIssue]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdIssue])

  return (
    <Grid.Column style={{marginTop: '15px', marginLeft: issueState === Issue.State.WAIT && '20px', marginRight: issueState === Issue.State.END && '20px'}}>
      <Segment>

        {/* 컬럼 깃발 */}
        <Label as='a' color={labelColor} ribbon onClick={() => setShowActionBtns(!showActionBtns)} >
          {issueState}
        </Label>

        {/* 추가 버튼 */}
        {issueState === Issue.State.WAIT &&
          <Button.Group basic size='mini' >
            <Button icon='plus square outline' onClick={() => setShowCreateForm(!showCreateForm)} />
          </Button.Group>
        }

        <div ref={drop} style={{ minHeight: '500px', marginTop: '10px' }}>

          {/* 이슈 */}
          {children}

          {/* 텍스트 입력 창 */}
          {showCreateForm && issueState === Issue.State.WAIT &&
            <EditForm 
              actionType={Issue.ActionType.CREATE}
              afterEdit={handleAfterEdit}
              issue={createdIssue}
              setIssue={setCreatedIssue}
            />
          }

        </div>
      </Segment>
    </Grid.Column>
  )
}

export default AcceptableColumn;