Here is the exact step-by-step prompt architecture you can copy and paste into your Opus agent to execute this build autonomously. It is structured to give the agent strict technical boundaries and prevent it from over-engineering the UI.

***

### SYSTEM OBJECTIVE
You are an elite full-stack Next.js engineer. Your task is to build a high-performance, minimalist personal hub and blog for an AI founder/investor. The aesthetic must be ultra-clean, technical, and fast—optimizing for signal over noise. Do not use standard "blog" templates.

### TECH STACK
* **Framework:** Next.js (App Router), deployed on Vercel.
* **Styling:** Tailwind CSS (minimalist monochrome palette, high contrast typography).
* **Content:** MDX (must natively support LaTeX and syntax highlighting).
* **Database & Storage:** Supabase (PostgreSQL for subscribers/posts, Supabase Storage for assets).
* **Email:** Postmark via API routes.

### EXECUTION STEPS

#### Step 1: Initialization & MDX Configuration
1. Initialize a Next.js App Router project with Tailwind CSS.
2. Install MDX dependencies (`next-mdx-remote` or equivalent). 
3. Configure the MDX pipeline with `remark-math` and `rehype-katex` to ensure flawless rendering of mathematical equations.
4. Integrate `rehype-pretty-code` for syntax-highlighted code blocks. 
5. Build a minimalist dynamic route (`/app/blog/[slug]/page.tsx`) that reads `.mdx` files from a local `/content` directory and renders them.

#### Step 2: Supabase Integration (Database & Storage)
1. Initialize the `@supabase/supabase-js` client.
2. Provide a SQL schema to create a `subscribers` table (columns: `id`, `email`, `created_at`, `source`).
3. Set up a Supabase Storage bucket named `assets` for hosting images. Write a helper utility function so I can easily reference these images in my MDX files.

#### Step 3: API Routes & Email Logic (Postmark)
1. Install the `postmark` node package.
2. Create an API route (`/api/subscribe`) that:
    * Takes an email input.
    * Inserts the email into the Supabase `subscribers` table.
    * Triggers a Postmark transactional email welcoming them to the list.
3. Create an API route (`/api/broadcast`) protected by a secret key that pulls all emails from the `subscribers` table and sends a templated Postmark email notifying them of a new post.

#### Step 4: High-Signal UI Components
1. **The Index Page:** Build a brutalist, fast-loading landing page. Include a brief bio section (Founder/VC/Academic) and a chronologically sorted list of post titles/dates.
2. **The Post Layout:** Optimize for readability. Max width `65ch`, readable serif or high-end sans-serif font, precise line height. 
3. **The CTA Blocks:** Build a custom React component `<SignalCapture />` to be placed at the bottom of MDX posts. It should have two variants:
    * *Variant A (Talent/Founders):* "Building a team to exploit this architecture? DMs are open." -> Links to X/LinkedIn.
    * *Variant B (Investors/Dealflow):* "I invest in founders solving this constraint. Drop your GitHub." -> Input field linked to the `/api/subscribe` route.

#### Step 5: Substack CSV Migration Script
1. Write a standalone Node.js script (`scripts/migrate-substack.js`) that parses a standard Substack `.csv` export.
2. The script must iterate through the rows and batch-insert the existing 400+ emails into the Supabase `subscribers` table without triggering the Postmark welcome email.

### OUTPUT REQUIREMENTS
Execute these steps sequentially. Begin by providing the terminal commands for Step 1, then wait for my confirmation before writing the MDX configuration files. Do not generate generic filler content; use placeholders like "Hardcore AI Insight #1" if needed.