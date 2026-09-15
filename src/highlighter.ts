import hljs from 'highlight.js/lib/common';
import cypher from 'highlightjs-cypher';

hljs.registerLanguage('cypher', cypher);

export default hljs;
