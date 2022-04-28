export interface Tree {
  id          :number;
  type        :Type;
  name        :string;
  content     :string;
  parent      :number;
  secret      :number;          // 0: piblic, 1: private
  children    :Tree[];
}

export interface RetrieveReq {
  parent: number;
  secret: number;
}

export interface CreateReq {
  type     :number;
  name     :string;
  content  :string;
  parent   :number;
  secret   :number;          // 0: piblic, 1: private
}

export interface UpdateReq {
  id       :number;
  name     :string;
  content  :string;
  secret   :number;          // 0: piblic, 1: private
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
  secret   :number;          // 0: piblic, 1: private
  children    :Tree[];
}

export interface UpdateSeqReq {
  id       ?:number;
  type     ?:number;            // 10: folder, 20: file
  parent   ?:number;
  upDown   ?:UpDown;
}

export enum UpDown {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
}

export enum Type {
  FORDER = 10,
  FILE = 20,
}