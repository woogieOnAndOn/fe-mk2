export interface Tree {
  id          :number;
  type        :Type;
  name        :string;
  content     :string;
  parent      :number;
  children    :Tree[];
}

export interface RetrieveReq {
  parent: number;
}

export interface CreateReq {
  type     :number;
  name     :string;
  content  :string;
  parent   :number;
}

export interface UpdateReq {
  id       :number;
  name     :string;
  content  :string;
}

export interface DeleteReq {
  id       :number;
  type     :number;
}

export interface RetrieveRes {
  id       :number;
  type     :number;
  name     :string;
  content  :string;
  parent   :number;
  children    :Tree[];
  showBtnGroup? : boolean;
}

export interface UpdateSeqReq {
  id       ?:number;
  type     ?:number;            // 10: folder, 20: file
  parent   ?:number;
  upDown   ?:UpDown;
}

export interface UpdateLocationReq {
  parent: number;
  ids: number[];
}

export enum UpDown {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum Type {
  FORDER = 10,
  FILE = 20,
}