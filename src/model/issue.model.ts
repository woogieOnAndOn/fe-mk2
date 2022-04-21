import { ResponseRetrieveIssueCheck } from "./issueCheck.model";

export interface Issue {
  issueId: number;
  issueName: string;
  issueState: State;
  useTime: number;
  // creationDate: string;
}

export interface CreateReq {
  issueName: string;
  // issueChecks: string[];
}

export interface UpdateReq {
  issueId: number;
  issueName: string;
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
  creationDate?: string; 
  issueChecks?: ResponseRetrieveIssueCheck[];
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