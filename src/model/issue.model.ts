import * as IssueCheck from "./issueCheck.model";

export interface Issue {
  issueId: number;
  issueName: string;
  issueState: State;
  useTime: number;
  creationDate: string;
}

export interface CreateReq {
  issueName: string;
  issueChecks: IssueCheck.CreateReq[];
}

export interface UpdateReq {
  issueId: number;
  issueName: string;
  useTime: number;
  newIssueChecks: IssueCheck.CreateReq[]
  editIssueChecks: IssueCheck.UpdateReq[]
  deleteIssueChecks: IssueCheck.DeleteReq[]
}

export interface UpdateUseTimeReq {
  issueId: number;
}

export interface UpdateStateReq {
  issueId: number;
  issueState: string;
}

export interface DeleteReq {
  issueId: number;
}

export interface RetrieveRes {
  issueId: number;
  issueName: string;
  issueState: State;
  useTime: number;
  creationDate: string; 
  issueChecks: IssueCheck.RetrieveRes[];
}

export enum ComponentType {
  ISSUE = 'issue',
  PHASE = 'phase',
}

export enum State {
  WAIT = 'wait',
  START = 'start',
  COMPLETE = 'complete',
  END = 'end',
}

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
}