/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Message, Label, SemanticCOLORS, Item } from 'semantic-ui-react'
import { useDrag } from 'react-dnd'
import { 
  ComponentType, 
  RequestDeleteIssue,
  RequestUpdateIssueName,
  ResponseRetrieveIssue,
} from '../../../model/issue.model'
import KanbanService from '../../../service/kanban.service';
import * as commonModel from '../../../model/common.model';
import { RequestCreateIssueCheck, RequestUpdateIssueCheckCompleteYn, RequestUpdateIssueCheckName, ResponseRetrieveIssueCheck, TmpCreateIssueCheck } from '../../../model/issueCheck.model';

interface ItemProps {
  issues: ResponseRetrieveIssue[];
  setIssues: Function;
  setReset: Function;
  issue: ResponseRetrieveIssue;
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
  
  const [issueData, setIssueData] = useState<ResponseRetrieveIssue>(issue);
  const [editOrNot, setEditOrNot] = useState<boolean>(false);
  const [checkedIssueCheckIds, setCheckedIssueCheckIds] = useState<number[]>([]);
  const [newIssueChecks, setNewIssueChecks] = useState<TmpCreateIssueCheck[]>([]);

  const changeHandler = async (checked: boolean, checkId: number, issueId: number) => {
    if (checked) {
      setCheckedIssueCheckIds([...checkedIssueCheckIds, checkId]);
    } else {
      setCheckedIssueCheckIds(checkedIssueCheckIds.filter((el) => el !== checkId));
    }

    const request: RequestUpdateIssueCheckCompleteYn = {
      issueId: issueId,
      checkId: checkId,
    }
    const response: commonModel.Message = await kanbanService.updateIssueCheckCompleteYn(request);
    if (!response || (response && !response.msId)) {
      alert(response ? response.msContent : 'fail');
    }
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ComponentType.ISSUE,
    item: { issueId: issueData.issueId, issueName: issueData.issueName, issueState: issueData.issueState, useTime: issueData.useTime },
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
    const request: RequestDeleteIssue = {
      issueId: issueId
    };
    const response: commonModel.Message = await kanbanService.deleteIssue(request);
    if (response.msId) {
      let tmpIssues: ResponseRetrieveIssue[] = issues;
      const issueIds: number[] = tmpIssues.map((issue) => issue.issueId);
      tmpIssues.splice(issueIds.indexOf(issueId), 1);
      setIssues(tmpIssues);
      setReset(true);
    }
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
    issueChecks.forEach((check: ResponseRetrieveIssueCheck, index: number) => {
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
    const issueChecks: TmpCreateIssueCheck[] = [...newIssueChecks];
    issueChecks.forEach((check: TmpCreateIssueCheck, index: number) => {
      if (check.tmpCheckId === checkId) {
        check.checkName = inputText;
      }
    });
    setNewIssueChecks(issueChecks);
  }
  
  const handleOnclickAddChecks = () => {
    const issueChecks: TmpCreateIssueCheck[] = [...newIssueChecks];
    const currentIssueChecksCount = issueData.issueChecks ? issueData.issueChecks.length : 0;
    issueChecks.push({
      tmpCheckId: currentIssueChecksCount + issueChecks.length + 1,
      checkName: ''
    });
    setNewIssueChecks(issueChecks);
  };

  const handleOnclickEditSubmit = async () => {
    const updateIssueRequest: RequestUpdateIssueName = {
      issueId: issueData.issueId,
      issueName: issueData.issueName,
    };
    const updateIssueResponse: commonModel.Message = await kanbanService.updateIssueName(updateIssueRequest);
    if (!updateIssueResponse || (updateIssueResponse && !updateIssueResponse.msId)) {
      alert(updateIssueResponse ? updateIssueResponse.msContent : 'fail');
    } else {
      setEditOrNot(false);
      alert(updateIssueResponse.msContent);
    }

    issueData.issueChecks && issueData.issueChecks.forEach(async (editCheck: ResponseRetrieveIssueCheck, index: number) => {
      const editIssueCheckRequest: RequestUpdateIssueCheckName = {
        issueId: issueData.issueId,
        checkId: editCheck.checkId,
        checkName: editCheck.checkName,
      }
      const editIssueCheckResponse: commonModel.Message = await kanbanService.updateIssueCheckName(editIssueCheckRequest);
    });

    newIssueChecks.forEach(async (newCheck: TmpCreateIssueCheck, index: number) => {
      const insertRequest: RequestCreateIssueCheck = {
        issueId: issueData.issueId,
        checkName: newCheck.checkName
      }
      const insertIssueCheckResponse: commonModel.Message = await kanbanService.insertIssueCheck(insertRequest);
    });
  };

  useEffect(() => {
    if (issueData.issueChecks && issueData.issueChecks.length > 0) {
      const issueCheckIds: number[] = [];
      issueData.issueChecks.forEach((check: ResponseRetrieveIssueCheck, index: number) => {
        if (check.completeYn === 'Y') {
          issueCheckIds.push(check.checkId);
        }
      });
      setCheckedIssueCheckIds(issueCheckIds);
    }
  }, [issueData]);

  return (
    <div id="MovableItem">
      {editOrNot ? 
        <Form className='editForm'>
          <Form.Field 
            name='issueName'
            control={TextArea}
            style={{ minHeight: 50 }}
            placeholder='내용을 입력해 주세요'
            value={issueData.issueName}
            onChange={handleOnchangeIssueName} 
          />
          {issueData.issueChecks && issueData.issueChecks.length > 0 && issueData.issueChecks.map((check: ResponseRetrieveIssueCheck, index) => (
            <Form.Input
              key={'checkId-'+check.checkId}
              name={'issueCheckName-'+check.checkId}
              placeholder='내용' 
              value={check.checkName} 
              onChange={(e) => handleOnchangeIssueCheckName(e, check.checkId)} 
            />
          ))}
          {newIssueChecks && newIssueChecks.length > 0 && newIssueChecks.map((newCheck: TmpCreateIssueCheck, index: number) => (
            <Form.Input
              key={'tmpCheckId-'+newCheck.tmpCheckId}
              name={'newIssueCheckName-'+newCheck.tmpCheckId}
              placeholder='내용' 
              value={newCheck.checkName} 
              onChange={(e) => handleOnchangenNewIssueCheckName(e, newCheck.tmpCheckId)} 
            />
          ))}
          <Button
            color='orange'
            onClick={handleOnclickAddChecks}
          >
            추가
          </Button>
          <Button
            color='green'
            type='submit'
            onClick={handleOnclickEditSubmit}
          >
            수정
          </Button>
        </Form>
          :
        <>
        <Card fluid>
          <Label color='teal' floating>{issueData.useTime}</Label>
          <Card.Content>
            <pre>{issueData.issueName}</pre>
            {issueData.issueChecks && issueData.issueChecks.length > 0 && issueData.issueChecks.map((check: ResponseRetrieveIssueCheck, index) => (
              <div key={check.checkId}>
                <input
                  type='checkbox'
                  checked={checkedIssueCheckIds.includes(check.checkId) ? true : false}
                  onChange={(e: FormEvent<HTMLInputElement>)=> changeHandler(e.currentTarget.checked, check.checkId, issueData.issueId)}
                />{check.checkName}
              </div>
            ))}
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