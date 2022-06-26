/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiServiceName } from "../model/common.model";
import { Code, Comic, ComicSearchCondition } from "../model/comic.model";
import CommonService from "./common.service";

export default class ComicService extends CommonService {

  async retrieveCode(): Promise<Code[]> {
    const response = await this.callApi(ApiServiceName.MK4, 'GET', `/mk4/codes`, null, null);
    return response.status === 200 ? response.data : null;
  }

  async updateCode<T>(request: Code): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK4, 'PUT', `/mk4/codes/${request.codeId}`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async insertComic<T>(request: any): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK4, 'POST', `/mk4/comics`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async retrieveComic(searchCondition: ComicSearchCondition): Promise<Comic[]> {
    const response = await this.callApi(ApiServiceName.MK4, 'GET', `/mk4/comics`, searchCondition, null);
    return response.status === 200 ? response.data : null;
  }

  async updateComic<T>(request: Comic): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK4, 'PUT', `/mk4/comics/${request.comicId}`, null, request);
    return response.status === 200 ? response.data : null;
  }

  async deleteComic<T>(comicId: number): Promise<T> {
    const response = await this.callApi(ApiServiceName.MK4, 'DELETE', `/mk4/comics/${comicId}`, null, null);
    return response.status === 200 ? response.data : null;
  }

}