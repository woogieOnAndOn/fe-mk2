import { RequestCreateTree, RequestDeleteTree, RequestUpdateSeqTree, RequestUpdateTree, TreeSearchCondition } from "../model/tree.model";
import CommonService from "./common.service";

export default class TreeService extends CommonService {

  async insertTree<T>(request: RequestCreateTree): Promise<T> {
    const response = await this.callApi('POST', `/tree`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async retrieveTree<T>(searchCondition: TreeSearchCondition): Promise<T> {
    const response = await this.callApi('GET', `/tree`, searchCondition, null);
    return response.status === 200 ? response.data : null;
  }

  async updateTree<T>(request: RequestUpdateTree): Promise<T> {
    const response = await this.callApi('PUT', `/tree/${request.id}`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async deleteTree<T>(request: RequestDeleteTree): Promise<T> {
    const response = await this.callApi('DELETE', `/tree/${request.id}`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async updateSeqTree<T>(request: RequestUpdateSeqTree): Promise<T> {
    const response = await this.callApi('PUT', `/tree/${request.id}/seq`, null, request);
    return response.status === 200 ? response.data : null;
  }
}