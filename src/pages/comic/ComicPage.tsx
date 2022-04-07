/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import './ComicPage.css';
import React, { useState, useEffect, ReactElement, useRef, SyntheticEvent } from 'react';
import { Icon, Button, Container, Checkbox, Form, Input, Radio, Select, TextArea, Grid, Image, Segment, Step, Card, Dropdown, DropdownItemProps, DropdownProps, List, ListItemProps, Label } from 'semantic-ui-react'
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
          const dropDownContent = {
            key: res[i].codeId,
            value: res[i].codeName,
            text: res[i].codeId,
          };
          codes.push(dropDownContent);

          if (i === 0) {
            setBaseUri(dropDownContent);
          }
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
    // 클릭된 이름 색깔 변경을 위한 state 변경
    const comics: Comic[] = [...comicList];
    comics.forEach((data: Comic, index:number) => {
      if (data.comicId === selectedComicId) {
        data.selected = true;
      } else {
        data.selected = false;
      }
    });
    setComicList(comics)

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
            <Form>
              <Form.Group inline>
              {category && category.length > 0 &&
                <Dropdown 
                  selection 
                  options={category} 
                  defaultValue={category[0].value}
                  onChange={handleOnclickCategory} 
                />
              }
              </Form.Group>
            </Form>

            <List divided relaxed>
              {baseUri.key &&
                <List.Item>
                  <List.Content>
                    <List.Header as='a'>
                      <Form>
                        <Form.Group inline>
                          <Form.Input 
                            name='comicId'
                            type='text' 
                            width={3}
                            value={comicId}
                            onChange={handleOnChange} 
                          />
                          <Form.Input 
                            name='comicName'
                            type='text' 
                            width={9}
                            value={comicName}
                            onChange={handleOnChange} 
                          />
                          <Form.Input 
                            name='lastViewEpisode'
                            type='text' 
                            width={2}
                            value={lastViewEpisode}
                            onChange={handleOnChange} 
                          />
                          <Button
                            color='green' 
                            size='small'
                            type='submit'
                            onClick={addComit}
                          >
                            추가
                          </Button>
                        </Form.Group>
                      </Form>
                    </List.Header>
                  </List.Content>
                </List.Item>
              }
              {comicList && comicList.map((data: Comic, index: number) => (
                <List.Item key={index}>
                  <List.Content>
                    <List.Header 
                      as='a' 
                      onClick={() => handleOnclickList(data.comicId)}
                    >
                      <div 
                        id="comicNameSection"
                        className={data.selected ? 'selectedComicName' : ''}
                      >
                        {data.comicName}
                      </div>
                    </List.Header>
                    <List.Description as='a'>
                      <Form>
                        <div id="lastUpdateDateSection">
                          {data.lastUpdateDate}
                        </div>
                        <Form.Group inline>
                          <Form.Button 
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
                          <Form.Input 
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
                          <Form.Button 
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
                          <Form.Button
                            className='lastViewSubmitBtn'
                            color='green' 
                            size='mini'
                            type='submit'
                            onClick={() => lastViewSubmit(data.comicId)}
                          >
                            적용
                          </Form.Button>
                        </Form.Group>
                      </Form>
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