export interface IssueCheck {
  issueId: number;
  checkId: number;
  checkName: string;
  completeYn: string;
  creationDate: string;
}

export interface TmpCreateIssueCheck {
  tmpCheckId: number;
  checkName: string;
}

export interface RequestCreateIssueCheck {
  issueId: number;
  checkName: string;
}

export interface RequestUpdateIssueCheckName {
  issueId: number;
  checkId: number;
  checkName: string;
}

export interface RequestUpdateIssueCheckCompleteYn {
  issueId: number;
  checkId: number;
}

export interface RequestDeleteIssueCheck {
  issueId: number;
  checkId: number; 
}

export interface RequestRetrieveIssueCheck {
  issueId: number;
}

export interface RequestRetrieveAllIssueCheck {
  user: string;
}

export interface ResponseRetrieveIssueCheck {
  issueId: number;
  checkId: number;
  checkName: string;
  completeYn: string;
  creationDate: string;
}