// src/config/sectionFields.ts

export type SectionType = "ContactInfo" | "Socials" | "Bio";

export const sectionFieldOptions: Record<
  SectionType,
  Record<string, boolean>
> = {
  ContactInfo: {
    name: true,
    surname: true,
    phone: true,
    email: true,
  },
  Socials: {
    linkedin: true,
    website: true,
  },
  Bio: {
    heading: true,
    content: true,
  },
};