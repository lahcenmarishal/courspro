import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl lg:text-4xl font-bold mt-10 mb-6 text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl lg:text-3xl font-bold mt-10 mb-4 text-foreground border-b border-border/50 pb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl lg:text-2xl font-semibold mt-8 mb-3 text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-6 mb-2 text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-base lg:text-lg leading-relaxed text-muted-foreground mb-5">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-5 ml-6 space-y-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 ml-6 space-y-2 list-decimal list-outside marker:text-primary marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base lg:text-lg text-muted-foreground relative pl-6 before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-2 before:h-2 before:bg-primary before:rounded-full">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-primary bg-primary/5 pl-6 pr-4 py-4 rounded-r-lg italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">
                  {children}
                </code>
              );
            }
            return (
              <code className={cn("block overflow-x-auto", className)} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono border border-border/50">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-8 border-t border-border/50" />
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 border-b border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-muted-foreground">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <figure className="my-8">
              <img
                src={src}
                alt={alt || ""}
                className="rounded-lg shadow-lg w-full object-cover"
              />
              {alt && (
                <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
