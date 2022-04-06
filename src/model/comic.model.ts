export interface Code {
  codeId: string;
  codeName: string;
}

export interface Comic {
  comicId: number;
  comicName: string;
  lastViewEpisode: number;
  lastUpdateDate: string;
  categoryId: string;
}

export interface ComicSearchCondition {
  categoryId: string;
}

export interface RequestDeleteComic {

}
