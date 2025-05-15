import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

function isDownloadableLink(link) {
  const dataUrlPattern = /^data:(.*);base64,/;
  return dataUrlPattern.test(link);
}

function escapeDollarSigns(markdown) {
  const pricePattern = /\$\d+(\.\d{2})?/g;
  return markdown.replace(pricePattern, (match) => match.replace(/\$/g, '\\$'));
}

function addBlinkingCircle(content, inProgress) {
  if (inProgress && !content.includes('$'))
    return content + " <span class='blinking-circle'></span>";
  return content;
}

function finalizeMarkdown(markdown, inProgress) {
  const escapedFromDollarSignsMarkdown = escapeDollarSigns(markdown);
  return addBlinkingCircle(escapedFromDollarSignsMarkdown, inProgress);
}

export default function MarkdownRenderer({ children: markdown, inProgress }) {
  const finalMarkdown = finalizeMarkdown(markdown, inProgress);

  return (
    <div className="custom-markdown text-base font-normal">
      <Markdown
        urlTransform={(value) => value}
        remarkPlugins={[remarkMath, [remarkGfm, { singleTilde: false }]]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          code({ _, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match) {
              return (
                <SyntaxHighlighter style={dracula} PreTag="div" language={match[1]} {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          a: ({ _, ...props }) => {
            if (inProgress) {
              return <span>(Processing link...)</span>;
            }

            if (isDownloadableLink(props.href)) {
              props.download = props.title;
            }

            return (
              <a
                {...props}
                className="text-[#007aff] hover:underline transition-all"
                target="_blank"
                rel="noopener noreferrer">
                {props.children}
              </a>
            );
          },
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="pl-5 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="pl-5 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-1.5 last:mb-0 text-[15.2px]">{children}</li>,
          table: ({ children }) => (
            <table className="rounded-md border-collapse text-left dark:text-gray-400 open-sans overflow-x-auto">
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead className="rounded-t-md sm:text-xs text-gray-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="first:rounded-tl-md last:rounded-tr-md border-r-2 border-gray-500 last:border-r-0 bg-[#e5e5e5] p-2 text-sm text-start font-semibold text-blue-gray-900">
              {children}
            </th>
          ),
          tr: ({ children }) => (
            <tr className="cursor-pointer border-b-2 border-gray-400 last:border-b-0 p-4 transition-colors hover:bg-blue-gray-50">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="font-normal text-gray-800 rounded-b-md border-r-2 border-gray-400 last:border-r-0 bg-white p-2 text-sm py-4 sm:px-3 whitespace-nowrap dark:text-white text-start overflow-hidden">
              {children}
            </td>
          ),
          math: ({ children }) => (
            <div className="katex-display">
              <BlockMath math={String(children)} errorColor="transparent" throwOnError={false} />
            </div>
          ),
          inlineMath: ({ children }) => (
            <span className="katex" style={{ display: 'inline-block' }}>
              <InlineMath math={String(children)} errorColor="transparent" throwOnError={false} />
            </span>
          )
        }}>
        {finalMarkdown}
      </Markdown>
    </div>
  );
}
