import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'

const parseMd = async (contentMd: string) => {
  const parsedText = await unified()
    .use(remarkParse)
    .use(remarkGfm, {singleTilde: false})
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(contentMd);

  return String(parsedText);
}

export default parseMd;