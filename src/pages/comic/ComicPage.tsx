/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import './ComicPage.css';
import React, { useState, useEffect, ReactElement, useRef, SyntheticEvent } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Dropdown, DropdownItemProps, DropdownProps, List, ListItemProps } from 'semantic-ui-react'
import ComicService from '../../service/comic.service';
import { Code, Comic } from '../../model/comic.model';
import axios, { AxiosResponse } from 'axios'

const ComicPage: React.FC = (): ReactElement => {
  const service = new ComicService();
  
  const [refreshComicList, setRefreshComicList] = useState<boolean>(false);
  const [category, setCategory] = useState<DropdownItemProps[]>([]);
  const [baseUri, setBaseUri] = useState<DropdownProps>({ key: '', value: '', text: '' });
  const [comicList, setComicList] = useState<Comic[]>([]);
  const [listHtml, setListHtml] = useState<string[]>([]);
  const [inputs, setInputs] = useState({ comicId: '', comicName: '', lastViewEpisode: '', lastUpdateDate: '', categoryId: '' });
  const { comicId, comicName, lastViewEpisode } = inputs;
  const editSection = useRef<HTMLDivElement>(null);
  
  const handleOnChange = (e: any) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value
    });
  }

  const changeHandler = (id: number, name: string,inputText: string) => {
    const changedComics: Comic[] = [...comicList];
    let comic = changedComics.find((data: Comic, index:number) => {return data.comicId === id});

    if (comic) {
      comic.comicId = id;
      comic.comicName = name;
      comic.lastViewEpisode = Number(inputText);
      comic.lastUpdateDate = getToday();
      comic.categoryId = baseUri.key;
    } else {
      changedComics.push({
        comicId: id,
        comicName: name,
        lastViewEpisode: Number(inputText),
        lastUpdateDate: getToday(),
        categoryId: baseUri.key,
      });
    }

    setComicList(changedComics);
  };

  const getToday = () => {
    var date = new Date();
    var year = date.getFullYear();
    var month = ("0" + (1 + date.getMonth())).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);

    return year + "-" + month + "-" + day;
  }

  useEffect(() => {
    const asyncRetrieveCode = async () => {
      return await service.retrieveCode();
    }

    asyncRetrieveCode().then((res: Code[]) => {
      if (res) {
        const codes: DropdownItemProps[] = [];
        for (let i = 0; i < res.length; i++) {
          codes.push({
            key: res[i].codeId,
            value: res[i].codeName,
            text: res[i].codeId,
            // onClick: () => handleOnclickCategory(res[i].codeId)
          });
        }
        setCategory(codes);
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const asyncRetrieveComic = async () => {
      return await service.retrieveComic({ categoryId: String(baseUri.text) });
    }

    asyncRetrieveComic().then((res: Comic[]) => {
      if (res) {
        setComicList(res);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUri, refreshComicList])

  const handleOnclickCategory = async (event: SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    const selectedOption: any | undefined = data.options?.find((option: any) => {
      return option.value === data.value;
    })
    setBaseUri(selectedOption)
  }

  const handleOnclickList = async (selectedComicId: number) => {
    const response: AxiosResponse =  await axios.get(`${baseUri.value}${selectedComicId}`);
    let html = response.data;

    html = html.replace(/\r?\n|\r/g, ''); // 줄바꿈 제거
    // console.log(html);

    // 엔드포인트를 정규식에 사용할 수 있도록 수정
    let endpoint = ''
    endpoint = String(baseUri.value).replace(/\//g, '\\/');
    // console.log(endpoint);

    // 해당 엔드포인트 관련된 링크만 뽑아냄
    const regForALink = `<\\s*a[^>]*\\s*href="${endpoint}[^>]*>(.*?)<\\/a>`
    const STRIP_HTML_REGEX = new RegExp(regForALink, 'g');
    html = html.match(STRIP_HTML_REGEX);
    // console.log(html);

    // 쓸모 없는 코드 제거
    const regForSpan = `<\\s*span [^>]*>(.*?)<\\/span>`
    const STRIP_UNNECCESSARY_REGEX = new RegExp(regForSpan, 'g');
    html = String(html).replace(STRIP_UNNECCESSARY_REGEX, '');
    // console.log(html);

    // target="_blank" 처리
    const texts: string[] = String(html).split(',');
    for (let i = 0; i < texts.length; i++) {
      texts[i] = texts[i].replace(/<a/g, '<a target="_blank"')
    }

    setListHtml(texts)
    editSection.current?.focus();
  }

  const lastViewSubmit = async (id: number) => {
    try {
      const changedComics: Comic[] = [...comicList];
      let updateComic: Comic | undefined = changedComics.find((data: Comic, index:number) => {return data.comicId === id});
  
      if (updateComic) {
        const response = await service.updateComic(updateComic);
        if (!response) {
          alert('실패')
        } else {
          setRefreshComicList(!refreshComicList);
        }
      }
    } catch(err) {
      alert(err);
      throw err;
    }
  }

  const addComit = async () => {
    const request = inputs;
    request.categoryId = baseUri.key;
    request.lastUpdateDate = getToday();

    const response = await service.insertComic(request);

    if (!response) {
      alert('실패');
    } else {
      setRefreshComicList(!refreshComicList);
      setInputs({ comicId: '', comicName: '', lastViewEpisode: '', lastUpdateDate: '', categoryId: '' });
    }

  }

  return (
    <Container fluid>
      <Grid stackable columns={2}>
        <Grid.Column width={8}>
          <Segment>
            <Dropdown clearable options={category} selection onChange={handleOnclickCategory} />
            
            {baseUri.key && 
              <div className={'refreshListSection'}>
                <Button
                  className='refreshBtn'
                  color='orange' 
                  size='mini'
                  type='submit'
                  onClick={() => setRefreshComicList(!refreshComicList)}
                >
                  리프레쉬
                </Button>
              </div>
            }

            <List divided relaxed>
              {baseUri.key &&
                <List.Item>
                  <List.Content>
                    <List.Header as='a'>
                      <input 
                        name='comicId'
                        type='text' 
                        className={'inputText comicIdInput'}
                        value={comicId}
                        onChange={handleOnChange} 
                      />
                      <input 
                        name='comicName'
                        type='text' 
                        className={'inputText comicNameInput'}
                        value={comicName}
                        onChange={handleOnChange} 
                      />
                      <input 
                        name='lastViewEpisode'
                        type='text' 
                        className={'inputText lastViewInput'}
                        value={lastViewEpisode}
                        onChange={handleOnChange} 
                      />
                      <Button
                        className='lastViewSubmitBtn'
                        color='green' 
                        size='mini'
                        type='submit'
                        onClick={addComit}
                      >
                        추가
                      </Button>
                    </List.Header>
                  </List.Content>
                </List.Item>
              }
              {comicList && comicList.map((data: Comic, index: number) => (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header as='a' onClick={() => handleOnclickList(data.comicId)}>{data.comicName}</List.Header>
                    <List.Description as='a'>
                      <div style={{ marginTop: "10px" }}>
                        <div className='lastUpdateDateSection'>
                          {data.lastUpdateDate}
                        </div>
                        <div className='lastUpdateDateEditSection'>
                          <Button 
                            icon='minus square outline' 
                            size='mini'
                            color='red'
                            onClick={() => {
                              changeHandler(
                                data.comicId
                                ,data.comicName
                                ,String(
                                  Number(comicList.find((comic: Comic, index: number) => {
                                    return comic.comicId === data.comicId
                                  })!.lastViewEpisode) - 1
                                )
                              )
                            }}
                          />
                          <input 
                            id={String(data.comicId)}
                            type="text" 
                            className={'inputText lastViewInput'}
                            maxLength={5}
                            value={String(comicList.find((comic: Comic, index: number) => { return comic.comicId === data.comicId })!.lastViewEpisode)}
                            onChange={(e) => changeHandler(data.comicId, data.comicName, e.target.value)}
                            onKeyPress= {(e: any) => {
                              if (e.key === 'Enter') {
                                lastViewSubmit(data.comicId);
                              } 
                            }}
                          />
                          <Button 
                            icon='plus square outline' 
                            size='mini'
                            color='blue'
                            onClick={() => {
                              changeHandler(
                                data.comicId
                                ,data.comicName
                                ,String(
                                  Number(comicList.find((comic: Comic, index: number) => {
                                    return comic.comicId === data.comicId
                                  })!.lastViewEpisode) + 1
                                )
                              )
                            }}
                          />
                          <Button
                            className='lastViewSubmitBtn'
                            color='green' 
                            size='mini'
                            type='submit'
                            onClick={() => lastViewSubmit(data.comicId)}
                          >
                            적용
                          </Button>
                        </div>
                      </div>
                    </List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Segment>
        </Grid.Column>
        <Grid.Column width={8}>
          <Segment>
            <div ref={editSection} tabIndex={-1}></div>
            <List divided relaxed>
              {listHtml && listHtml.map((data: string, index: number) => (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header as='a'>
                      <div dangerouslySetInnerHTML={{__html: data}}></div>
                    </List.Header>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Segment>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default ComicPage;