import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* Bio */}
      <section className="mb-16">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Kuang Xu</h1>
        <p className="text-sm font-mono text-gray-500 mb-6">Founder · Investor · Researcher</p>
        <p className="text-base leading-relaxed text-gray-800 max-w-[55ch]">
          I build at the intersection of AI systems and real-world deployment. Writing about
          architectures worth exploiting, capital allocation, and the math underneath both.
        </p>
        <div className="flex gap-5 mt-5 text-sm font-mono">
          <a href="https://x.com/ProfKuang" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            X →
          </a>
          <a href="https://www.linkedin.com/in/kuangxu/" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            LinkedIn →
          </a>
          <a href="http://kuangxu.org" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            Website →
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-black mb-10" />

      {/* Posts */}
      <section>
        <h2 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-6">
          Writing
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-400 font-mono">No posts yet.</p>
        ) : (
          <ul className="space-y-5">
            {posts.map((post) => (
              <li key={post.slug} className="flex justify-between items-baseline gap-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-base font-medium hover:opacity-60 transition-opacity leading-snug"
                >
                  {post.title}
                </Link>
                <span className="text-sm font-mono text-gray-400 whitespace-nowrap shrink-0">
                  {post.date
                    ? new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
