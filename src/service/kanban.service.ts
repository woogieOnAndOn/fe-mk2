import * as Issue from '../model/issue.model';
import CommonService from "./common.service";
import { ApiServiceName } from '../model/common.model'
import * as IssueCheck from '../model/issueCheck.model';

export default class KanbanService extends CommonService {
  async insertIssue<T>(request: Issue.CreateReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'POST', `/issue`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async retrieveIssue<T>(): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'GET', `/issue`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async updateIssueName<T>(request: Issue.UpdateReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'PUT', `/issue/${request.issueId}`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async updateUseTime<T>(request: Issue.UpdateUseTimeReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'PUT', `/issue/${request.issueId}/useTime`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async updateState<T>(request: Issue.UpdateStateReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'PUT', `/issue/${request.issueId}/state/${request.issueState}`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async deleteIssue<T>(request: Issue.DeleteReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'DELETE', `/issue/${request.issueId}`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async updateIssueCheckCompleteYn<T>(request: IssueCheck.UpdateCompleteYnReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'PUT', `/issue/${request.issueId}/issueCheck/${request.checkId}/completeYn`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async insertIssueCheck<T>(request: IssueCheck.CreateReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'POST', `/issue/${request.issueId}/issueCheck`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async updateIssueCheckName<T>(request: IssueCheck.UpdateReq): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK2, 'PUT', `/issue/${request.issueId}/issueCheck/${request.checkId}`, null, request);
    return response.status === 200 ? response.data : null;
  }
}