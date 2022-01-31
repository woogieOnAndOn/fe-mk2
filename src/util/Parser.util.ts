import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

const parseMd = async (contentMd: string) => {
  const parsedText = await unified()
    .use(remarkParse)
    .use(remarkBreaks) // 개행 자동
    .use(remarkGfm, {
      singleTilde: false, // default true(~취소선~), false(~~취소선~~)
      tableCellPadding: false, // default true(Serialize tables with a space between delimiters (|) and cell content)
      tablePipeAlign: true, // default true(Serialize by aligning the delimiters (|) between table cells so that they all align nicely and form a grid)
    }) // ~~취소선~~
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(contentMd);

  return String(parsedText);
}

export default parseMd;