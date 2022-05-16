/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS, Item } from 'semantic-ui-react'
import { useDrag } from 'react-dnd'
import * as Issue from '../../../model/issue.model'
import KanbanService from '../../../service/kanban.service';
import * as commonModel from '../../../model/common.model';
import * as IssueCheck from '../../../model/issueCheck.model';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';
import EditForm from './EditForm';

interface ItemProps {
  issues: Issue.RetrieveRes[];
  setIssues: Function;
  setReset: Function;
  issue: Issue.RetrieveRes;
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
  
  const [issueData, setIssueData] = useState<Issue.RetrieveRes>(issue);
  const [editOrNot, setEditOrNot] = useState<boolean>(false);
  const [checkedIssueCheckIds, setCheckedIssueCheckIds] = useState<number[]>([]);

  const changeHandler = async (checked: boolean, checkId: number, issueId: number) => {
    if (checked) {
      setCheckedIssueCheckIds([...checkedIssueCheckIds, checkId]);
    } else {
      setCheckedIssueCheckIds(checkedIssueCheckIds.filter((el) => el !== checkId));
    }

    const request: IssueCheck.UpdateCompleteYnReq = {
      issueId: issueId,
      checkId: checkId,
    }
    const response: commonModel.Message = await kanbanService.updateIssueCheckCompleteYn(request);
    ApiResultExecutor(response);
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: Issue.ComponentType.ISSUE,
    item: { 
      issueId: issueData.issueId, 
      issueName: issueData.issueName, 
      issueState: issueData.issueState, 
      useTime: issueData.useTime, 
      creationDate: issueData.creationDate, 
      issueChecks: issueData.issueChecks 
    },
      collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const opacity = isDragging ? 0.4 : 1;

  const showDelete = (issueId: number) => {
    if (window.confirm('선택 이슈를 삭제하시겠습니까?')) {
      deleteIssue(issueId);
    }
  }

  const deleteIssue = async (issueId: number) => {
    const request: Issue.DeleteReq = {
      issueId: issueId
    };
    const response: commonModel.Message = await kanbanService.deleteIssue(request);
    ApiResultExecutor(response, false, () => {
      let tmpIssues: Issue.RetrieveRes[] = issues;
      const issueIds: number[] = tmpIssues.map((issue) => issue.issueId);
      tmpIssues.splice(issueIds.indexOf(issueId), 1);
      setIssues(tmpIssues);
      setReset(true);
    });
  };

  const handleAfterEdit = () => {
    setEditOrNot(false);
  }

  useEffect(() => {
    if (issueData.issueChecks && issueData.issueChecks.length > 0) {
      const issueCheckIds: number[] = [];
      issueData.issueChecks.forEach((check: IssueCheck.RetrieveRes, index: number) => {
        if (check.completeYn === 'Y') {
          issueCheckIds.push(check.checkId);
        }
      });
      setCheckedIssueCheckIds(issueCheckIds);
    }

    const updatedIssues: Issue.RetrieveRes[] = [...issues];
    updatedIssues.forEach((issue: Issue.RetrieveRes, index: number, issues: Issue.RetrieveRes[]) => {
      if (issue.issueId === issueData.issueId) issues[index] = issueData;
    });

    setIssues(updatedIssues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueData]);

  return (
    <div id="MovableItem">
      {editOrNot ? 
        <EditForm 
          actionType={Issue.ActionType.UPDATE}
          afterEdit={handleAfterEdit}
          issue={issueData}
          setIssue={setIssueData}
        />
          :
        <>
          <Card fluid>
            <Label color='teal' floating>{issueData.useTime}</Label>
            <Card.Content>
              <div ref={drag} style={{ opacity }}>
                <pre>{issueData.issueName}</pre>
                {issueData.issueChecks && issueData.issueChecks.length > 0 && issueData.issueChecks.map((check: IssueCheck.RetrieveRes, index) => (
                  <div key={check.checkId}>
                    <input
                      type='checkbox'
                      checked={checkedIssueCheckIds.includes(check.checkId) ? true : false}
                      onChange={(e: FormEvent<HTMLInputElement>)=> changeHandler(e.currentTarget.checked, check.checkId, issueData.issueId)}
                    />{check.checkName}
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
          {showActionBtns && 
            <div style={{ marginTop: '-12px' }}>
              <Button.Group basic size='mini'>
                <Button icon='edit outline' onClick={() => setEditOrNot(true)} />
                <Button icon='trash alternate outline' onClick={() => showDelete(issueData.issueId)} />
              </Button.Group>
            </div>
          }
        </>
      }
    </div>
  )
}

export default MovableItem;