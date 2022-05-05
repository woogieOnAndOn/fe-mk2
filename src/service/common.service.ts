import { AxiosRequestConfig, Method } from "axios";
import { ApiServiceName } from '../model/common.model'

const axios = require('axios');

export default class CommonService {
  protected config: AxiosRequestConfig = {
    method: 'GET',
    url: '',
    params: {},
    data: {},
    withCredentials: true
  };

  public async callApi(service: ApiServiceName, method: Method, endPoint: string, params?: any, requestBody?: any): Promise<any> {
    this.config.method = method;
    this.config.url = this.checkServiceUrl(service) + endPoint;
    this.config.params = params;
    this.config.data = requestBody;
    service === ApiServiceName.MK4 ? this.config.withCredentials = false : this.config.withCredentials = true;
    return await axios.request(this.config);
  }

  private checkServiceUrl(serviceName: ApiServiceName) {
    let serviceUrl: string = '';
    switch (serviceName) {
      case ApiServiceName.MK2:
        serviceUrl = String(process.env.REACT_APP_NODEJS_URL);
        break;
      case ApiServiceName.MK4:
        serviceUrl = String(process.env.REACT_APP_DJANGO_URL);
        break;
      default:
        serviceUrl = String(process.env.REACT_APP_NODEJS_URL);
        break;
    }
    return serviceUrl;
  }

  public async callApiForUpload(service: ApiServiceName, method: Method, endPoint: string, params?: any, requestBody?: any): Promise<any> {
    const apiUrl = this.checkServiceUrl(service);
    return await axios.post(`${apiUrl}${endPoint}`, requestBody, {headers: { 'Content-Type': 'multipart/form-data' }});
  }
}