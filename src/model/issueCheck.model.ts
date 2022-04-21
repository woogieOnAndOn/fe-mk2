export interface IssueCheck {
  issueId: number;
  checkId: number;
  checkName: string;
  completeYn: string;
  creationDate: string;
}

export interface TmpCreateReq {
  tmpCheckId: number;
  checkName: string;
}

export interface CreateReq {
  issueId: number;
  checkName: string;
}

export interface UpdateReq {
  issueId: number;
  checkId: number;
  checkName: string;
}

export interface UpdateCompleteYnReq {
  issueId: number;
  checkId: number;
}

export interface DeleteReq {
  issueId: number;
  checkId: number; 
}

export interface RetrieveReq {
  issueId: number;
}

export interface RetrieveAllReq {
  user: string;
}

export interface RetrieveRes {
  issueId: number;
  checkId: number;
  checkName: string;
  completeYn: string;
  creationDate: string;
}