// src/config/sectionFields.ts

export const sectionFieldOptions: Record<
  SectionType,
  { heading: boolean; content: boolean }
> = {
  left: { heading: true, content: true },
  center: { heading: true, content: true },
  right: { heading: true, content: true },
};

// Define SectionType as a TypeScript union type
export type SectionType = "left" | "center" | "right";