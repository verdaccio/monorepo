import marked from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const DOMPurify = createDOMPurify(new JSDOM('').window);

export default function parseReadme(readme: string,
                                    options: { pathname?: string | void } = {}): string | void {
  let result;

  if (readme) {
    result = DOMPurify.sanitize(
      marked(readme, {
        sanitize: false,
      }).trim()
    );

    if ('string' === typeof options.pathname) {
      result = result.replace(/href="#/gi, `href="${options.pathname}#`);
    }
  }

  return result;
}
