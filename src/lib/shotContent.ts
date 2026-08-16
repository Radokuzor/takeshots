export type ShotContentType = "guide" | "recipe";

export interface ShotContent {
  id: string;
  type: ShotContentType;
  title: string;
  slug: string;
  metaDescription: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;

  // guide-only
  body?: string;

  // recipe-only
  spirit?: string;
  ingredients?: string[];
  instructions?: string[];
}

export function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
