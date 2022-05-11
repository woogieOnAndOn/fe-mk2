/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS, Item } from 'semantic-ui-react'
import * as Issue from '../../../model/issue.model'
import KanbanService from '../../../service/kanban.service';
import * as commonModel from '../../../model/common.model';
import * as IssueCheck from '../../../model/issueCheck.model';
import ApiResultExecutor from '../../../scripts/common/ApiResultExecutor.util';

interface PropTypes {
  actionType: Issue.ActionType,
  afterEdit: Function;
  issue?: Issue.RetrieveRes,
 }

const EditForm: FC<PropTypes> = (props: PropTypes): ReactElement => {
  const kanbanService = new KanbanService();
  
  const [issueData, setIssueData] = useState<Issue.RetrieveRes>(props.issue!);
  const [checkedIssueCheckIds, setCheckedIssueCheckIds] = useState<number[]>([]);
  const [newIssueChecks, setNewIssueChecks] = useState<IssueCheck.TmpCreateReq[]>([]);
  const [deleteIssueChecks, setDeleteIssueChecks] = useState<IssueCheck.RetrieveRes[]>([]);

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

  const handleOnchangeIssueName = (e: any) => {
    const inputText: string = e.target.value;
    setIssueData({
      ...issueData,
      issueName: inputText
    }); 
  }

  const handleOnchangeIssueCheckName = (e: any, checkId: number) => {
    const inputText: string = e.target.value;
    const issueChecks = [...issueData.issueChecks!];
    issueChecks.forEach((check: IssueCheck.RetrieveRes, index: number) => {
      if (check.checkId === checkId) {
        check.checkName = inputText;
      }
    });
    setIssueData({
      ...issueData,
      issueChecks: issueChecks
    }); 
  }

  const handleOnchangenNewIssueCheckName = (e: any, checkId: number) => {
    const inputText: string = e.target.value;
    const issueChecks: IssueCheck.TmpCreateReq[] = [...newIssueChecks];
    issueChecks.forEach((check: IssueCheck.TmpCreateReq, index: number) => {
      if (check.tmpCheckId === checkId) {
        check.checkName = inputText;
      }
    });
    setNewIssueChecks(issueChecks);
  }
  
  const handleOnclickAddChecks = () => {
    const issueChecks: IssueCheck.TmpCreateReq[] = [...newIssueChecks];
    let maxIssueCheckId = 0;
    issueData.issueChecks.forEach((data: IssueCheck.RetrieveRes, index: number) => {
      maxIssueCheckId = data.checkId > maxIssueCheckId ? data.checkId : maxIssueCheckId;
    })

    issueChecks.push({
      tmpCheckId: maxIssueCheckId + issueChecks.length + 1,
      checkName: ''
    });
    setNewIssueChecks(issueChecks);
  };

  const handleOnclickDeleteChecks = (newCheck: boolean, checkId: number) => {
    if (newCheck) {
      let checks: IssueCheck.TmpCreateReq[] = [...newIssueChecks];
      checks = checks.filter((data: IssueCheck.TmpCreateReq, index: number) => {
        return data.tmpCheckId !== checkId; 
      });
      setNewIssueChecks(checks);
    } else {
      const issue = {...issueData};
      let checks: IssueCheck.RetrieveRes[] = [...issueData.issueChecks];
      const deleteChecks: IssueCheck.RetrieveRes[] = [...deleteIssueChecks];

      checks = checks.filter((data: IssueCheck.RetrieveRes, index: number) => {
        if (data.checkId === checkId) {
          deleteChecks.push(data);
        }
        return data.checkId !== checkId; 
      });
      issue.issueChecks = checks;
      setIssueData(issue);
      setDeleteIssueChecks(deleteChecks);
    }
  }

  const handleOnclickEditSubmit = async () => {
    const newIssueCheckRequest: IssueCheck.CreateReq[] = [];
    newIssueChecks.forEach(async (newCheck: IssueCheck.TmpCreateReq, index: number) => {
      newIssueCheckRequest.push({
        issueId: issueData.issueId,
        checkName: newCheck.checkName
      });
    });

    const editIssueCheckRequest: IssueCheck.UpdateReq[] = [];
    issueData.issueChecks && issueData.issueChecks.forEach(async (editCheck: IssueCheck.RetrieveRes, index: number) => {
      editIssueCheckRequest.push({
        issueId: issueData.issueId,
        checkId: editCheck.checkId,
        checkName: editCheck.checkName,
      });
    });

    const deleteIssueCheckRequest: IssueCheck.DeleteReq[] = [];
    deleteIssueChecks.forEach(async (deleteCheck: IssueCheck.RetrieveRes, index: number) => {
      deleteIssueCheckRequest.push({
        issueId: issueData.issueId,
        checkId: deleteCheck.checkId
      });
    });

    const updateIssueRequest: Issue.UpdateReq = {
      issueId: issueData.issueId,
      issueName: issueData.issueName,
      useTime: issueData.useTime,
      newIssueChecks: newIssueCheckRequest,
      editIssueChecks: editIssueCheckRequest,
      deleteIssueChecks: deleteIssueCheckRequest,
    };

    const updateIssueResponse: commonModel.Message = await kanbanService.updateIssueName(updateIssueRequest);
    ApiResultExecutor(updateIssueResponse, true, () => props.afterEdit());
  };

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
  }, [issueData]);
  
  return (
    <Form className='editForm'>
      <Grid columns={2}>
        <Grid.Column width={16}>
          <Form.Field 
            name='issueName'
            control={TextArea}
            style={{ minHeight: 50 }}
            placeholder='내용을 입력해 주세요'
            value={issueData.issueName}
            onChange={handleOnchangeIssueName} 
          />
        </Grid.Column>

        {issueData.issueChecks && issueData.issueChecks.length > 0 && issueData.issueChecks.map((check: IssueCheck.RetrieveRes, index) => (
          <>
            <Grid.Column width={14}>
              <Form.Input
                key={'checkId-'+check.checkId}
                name={'issueCheckName-'+check.checkId}
                placeholder='내용' 
                value={check.checkName} 
                onChange={(e) => handleOnchangeIssueCheckName(e, check.checkId)} 
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <Button.Group basic size='mini'>
                <Button icon='trash alternate outline' onClick={() => handleOnclickDeleteChecks(false, check.checkId)} />
              </Button.Group>
            </Grid.Column>
          </>
        ))}

        {newIssueChecks && newIssueChecks.length > 0 && newIssueChecks.map((newCheck: IssueCheck.TmpCreateReq, index: number) => (
          <>
            <Grid.Column width={14}>
              <Form.Input
                key={'tmpCheckId-'+newCheck.tmpCheckId}
                name={'newIssueCheckName-'+newCheck.tmpCheckId}
                placeholder='내용' 
                value={newCheck.checkName} 
                onChange={(e) => handleOnchangenNewIssueCheckName(e, newCheck.tmpCheckId)} 
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <Button.Group basic size='mini'>
                <Button icon='trash alternate outline' onClick={() => handleOnclickDeleteChecks(true, newCheck.tmpCheckId)} />
              </Button.Group>
            </Grid.Column>
          </>
        ))}

        <Grid.Column width={16}>
          <Button
            color='orange'
            floated='left'
            onClick={handleOnclickAddChecks}
          >
            추가
          </Button>
          <Button
            color='green'
            floated='right'
            type='submit'
            onClick={handleOnclickEditSubmit}
          >
            수정
          </Button>
        </Grid.Column>
      </Grid>
    </Form>
  )
}

export default EditForm;