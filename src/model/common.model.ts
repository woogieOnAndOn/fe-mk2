export interface AxiosResponse {
  config: object;
  data: Message;
  headers: object;
  status: number;
  statusText: string;
}

export interface Message {
  msId       : number;
  msContent  : string;
  msObject  ?: any;
}

export enum ApiServiceName {
  MK2,
  MK4
}