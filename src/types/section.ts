// src/types/section.ts

export type SectionType = "left" | "center" | "right";

export interface SectionField {
  id?: string;
  heading: string;
  content: string;
  sectionType: SectionType;
  order: number;
}