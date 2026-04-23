import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { renderMDX } from "@/lib/mdx";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.excerpt ?? "",
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await renderMDX(post.content);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <Link
        href="/"
        className="text-sm font-mono text-gray-400 hover:text-black transition-colors mb-10 block"
      >
        ← Back
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight leading-tight mb-3">
          {post.meta.title}
        </h1>
        <p className="text-sm font-mono text-gray-400">
          {post.meta.date
            ? new Date(post.meta.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </p>
      </header>

      <article className="prose">{content}</article>
    </main>
  );
}
