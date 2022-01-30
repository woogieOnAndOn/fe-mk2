/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, ReactElement } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS } from 'semantic-ui-react'
import { useDrag } from 'react-dnd'
import { 
  ComponentType, 
  Issue,
  RequestDeleteIssue,
} from '../../../model/issue.model'
import KanbanService from '../../../service/kanban.service';
import * as commonModel from '../../../model/common.model';

interface ItemProps {
  issues: Issue[];
  setIssues: Function;
  setReset: Function;
  issue: Issue;
  showActionBtns: boolean;
}

const MovableItem: FC<ItemProps> = (props: ItemProps): ReactElement => {
  const {
    issues,
    setIssues,
    setReset,
    issue,
    showActionBtns
  } = props;
  const kanbanService = new KanbanService();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ComponentType.ISSUE,
    item: { issueId: issue.issueId, issueName: issue.issueName, issueState: issue.issueState, useTime: issue.useTime },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;

  const deleteIssue = async (issueId: number) => {
    const request: RequestDeleteIssue = {
      issueId: issueId
    };
    const response: commonModel.Message = await kanbanService.deleteIssue(request);
    if (response.msId) {
      let tmpIssues: Issue[] = issues;
      const issueIds: number[] = tmpIssues.map((issue) => issue.issueId);
      tmpIssues.splice(issueIds.indexOf(issueId), 1);
      setIssues(tmpIssues);
      setReset(true);
    }
  };

  return (
    <>
    <Message color='brown'>
      <Label color='teal' floating>{issue.useTime}</Label>
      <div ref={drag} style={{ opacity }}>
        <Message.Header>{issue.issueName}</Message.Header>
      </div>
    </Message>
    {showActionBtns && 
      <div style={{ marginTop: '-12px' }}>
        <Button.Group basic size='mini'>
          <Button icon='edit outline' />
          <Button icon='trash alternate outline' onClick={() => deleteIssue(issue.issueId)} />
        </Button.Group>
      </div>
    }
    </>
  )
}

export default MovableItem;