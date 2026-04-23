// Helper to build public Supabase Storage URLs for the `assets` bucket.
// Usage in MDX: <img src={assetUrl("my-image.png")} />
export function assetUrl(filename: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/assets/${filename}`;
}
