export interface Tree {
  id          :number;
  type        :TreeType;
  name        :string;
  content     :string;
  depth       :number;
  parent      :number;
  secret      :number;          // 0: piblic, 1: private
  children    :Tree[];
}

export interface TreeSearchCondition {
  depth : number;
  parent: number;
  secret: number;
}

export interface RequestCreateTree {
  type     :number;
  name     :string;
  content  :string;
  depth    :number;
  parent   :number;
  secret   :number;          // 0: piblic, 1: private
}

export interface RequestUpdateTree {
  id       :number;
  name     :string;
  content  :string;
  secret   :number;          // 0: piblic, 1: private
}

export interface RequestDeleteTree {
  id       :number;
  type     :number;
}

export interface ResponseGetTree {
  id       :number;
  type     :number;
  name     :string;
  content  :string;
  depth    :number;
  parent   :number;
  secret   :number;          // 0: piblic, 1: private
}

export interface RequestUpdateSeqTree {
  id       ?:number;
  type     ?:number;            // 10: folder, 20: file
  depth    ?:number;
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

export enum TreeType {
  FORDER = 10,
  FILE = 20,
}