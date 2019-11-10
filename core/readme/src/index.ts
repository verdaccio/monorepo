import marked from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import hljs from 'highlight.js';

const DOMPurify = createDOMPurify(new JSDOM('').window);

export default function parseReadme(readme: string, highLight = false): string | void {
  if (highLight) {
    marked.setOptions({
      highlight: function(code, lang) {
        return hljs.highlight(lang, code).value;
      },
    });
  }
  if (readme) {
    return DOMPurify.sanitize(
      marked(readme, {
        sanitize: false,
      }).trim()
    );
  }

  return;
}
