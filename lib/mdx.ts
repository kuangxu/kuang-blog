import { compileMDX } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import { SignalCapture } from "@/components/SignalCapture";

const mdxComponents = {
  SignalCapture,
};

export async function renderMDX(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
          rehypeKatex,
          [
            rehypePrettyCode,
            {
              theme: "vesper",
              keepBackground: true,
            },
          ],
        ],
      },
    },
  });

  return { content, frontmatter };
}
