import { AxiosRequestConfig, Method } from "axios";

const axios = require('axios');

export default class CommonService {
  private apiUrl;
  constructor() {
    this.apiUrl = process.env.REACT_APP_BASE_URL || '';
  }

  protected config: AxiosRequestConfig = {
    method: 'GET',
    url: '',
    params: {},
    data: {},
  };

  public async callApi(method: Method, endPoint: string, params?: any, requestBody?: any): Promise<any> {
    this.config.method = method;
    this.config.url = this.apiUrl + endPoint;
    this.config.params = params;
    this.config.data = requestBody;
    return await axios.request(this.config);
  }

  public async callApiForUpload(method: Method, endPoint: string, params?: any, requestBody?: any): Promise<any> {
    return await axios.post(`${this.apiUrl}${endPoint}`, requestBody, {headers: { 'Content-Type': 'multipart/form-data' }});
  }
}