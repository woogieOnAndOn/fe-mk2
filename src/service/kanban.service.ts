import {
  RequestCreateIssue,
  RequestUpdateIssueName,
  RequestUpdateIssueUseTime,
  RequestUpdateIssueState,
  RequestDeleteIssue,
} from '../model/issue.model';
import CommonService from "./common.service";

export default class KanbanService extends CommonService {
  async insertIssue<T>(request: RequestCreateIssue): Promise<T> {
    const response = await this.callApi('POST', `/issue`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async retrieveIssue<T>(): Promise<T> {
    const response = await this.callApi('GET', `/issue`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async updateIssueName<T>(request: RequestUpdateIssueName): Promise<T> {
    const response = await this.callApi('PUT', `/issue/${request.issueId}`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async updateUseTime<T>(request: RequestUpdateIssueUseTime): Promise<T> {
    const response = await this.callApi('PUT', `/issue/${request.issueId}/useTime`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async updateState<T>(request: RequestUpdateIssueState): Promise<T> {
    const response = await this.callApi('PUT', `/issue/${request.issueId}/state/${request.issueState}`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async deleteIssue<T>(request: RequestDeleteIssue): Promise<T> {
    const response = await this.callApi('DELETE', `/issue/${request.issueId}`, null, null);
    return response.status === 200 ? response.data : null;
  }
}