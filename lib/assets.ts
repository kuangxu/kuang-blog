// Usage in MDX: <img src={assetUrl("my-image.png")} />
export function assetUrl(filename: string): string {
  return `/assets/${filename}`;
}
