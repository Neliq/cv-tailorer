import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// src/server/api/routers/cv.ts

const contactInfoSchema = z.object({
  id: z.string().optional(),
  sectionType: z.literal("ContactInfo"),
  order: z.number(),
  name: z.string(),
  surname: z.string(),
  phone: z.string(),
  email: z.string(),
});

const socialsSchema = z.object({
  id: z.string().optional(),
  sectionType: z.literal("Socials"),
  order: z.number(),
  linkedin: z.string(),
  website: z.string(),
});

const bioSchema = z.object({
  id: z.string().optional(),
  sectionType: z.literal("Bio"),
  order: z.number(),
  heading: z.string(),
  content: z.string(),
});

const sectionSchema = z.discriminatedUnion("sectionType", [
  contactInfoSchema,
  socialsSchema,
  bioSchema,
]);

export const cvRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "CV name is required"),
        sections: z.array(sectionSchema).min(1, "At least one section is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, sections } = input;

      const existingCV = await ctx.db.cv.findUnique({
        where: { id },
        include: { sections: true },
      });

      if (!existingCV || existingCV.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "CV not found or unauthorized"
        });
      }

      const existingSectionIds = existingCV.sections.map((s) => s.id);
      const incomingSectionIds = sections.filter((s) => s.id).map((s) => s.id);
      const sectionsToDelete = existingSectionIds.filter(
        (id) => !incomingSectionIds.includes(id)
      );

      return ctx.db.cv.update({
        where: { id },
        data: {
          name,
          sections: {
            deleteMany: sectionsToDelete.map((sectionId) => ({
              id: sectionId,
            })),
            update: sections
              .filter((s) => s.id)
              .map((s) => {
                const baseData = {
                  sectionType: s.sectionType,
                  order: s.order,
                };

                switch (s.sectionType) {
                  case "ContactInfo":
                    return {
                      where: { id: s.id },
                      data: {
                        ...baseData,
                        name: s.name,
                        surname: s.surname,
                        phone: s.phone,
                        email: s.email,
                      },
                    };
                  case "Socials":
                    return {
                      where: { id: s.id },
                      data: {
                        ...baseData,
                        linkedin: s.linkedin,
                        website: s.website,
                      },
                    };
                  case "Bio":
                    return {
                      where: { id: s.id },
                      data: {
                        ...baseData,
                        heading: s.heading,
                        content: s.content,
                      },
                    };
                }
              }),
            create: sections
              .filter((s) => !s.id)
              .map((s) => {
                const baseData = {
                  sectionType: s.sectionType,
                  order: s.order,
                };

                switch (s.sectionType) {
                  case "ContactInfo":
                    return {
                      ...baseData,
                      name: s.name,
                      surname: s.surname,
                      phone: s.phone,
                      email: s.email,
                    };
                  case "Socials":
                    return {
                      ...baseData,
                      linkedin: s.linkedin,
                      website: s.website,
                    };
                  case "Bio":
                    return {
                      ...baseData,
                      heading: s.heading,
                      content: s.content,
                    };
                }
              }),
          },
        },
        include: {
          sections: true,
          template: true,
        },
      });
    }),

  // ... other procedures remain the same

  // src/server/api/routers/cv.ts

  // Procedure to delete a CV
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Use transaction to ensure atomicity
      return await ctx.db.$transaction(async (tx) => {
        // Verify ownership
        const cv = await tx.cv.findUnique({
          where: { id: input.id },
          include: { sections: true },
        });

        if (!cv || cv.userId !== ctx.session.user.id) {
          throw new Error("CV not found or unauthorized");
        }

        // Delete all sections first
        await tx.cvSection.deleteMany({
          where: { cvId: input.id },
        });

        // Then delete the CV
        return tx.cv.delete({
          where: { id: input.id },
        });
      });
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.cv.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          sections: {
            orderBy: {
              order: "asc",
            },
          },
          template: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch CVs",
        cause: error,
      });
    }
  }),

  // Add this procedure to cvRouter alongside other procedures
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const cv = await ctx.db.cv.findUnique({
          where: { id: input.id },
          include: {
            sections: {
              orderBy: {
                order: "asc",
              },
            },
            template: true,
          },
        });

        if (!cv || cv.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "CV not found or unauthorized",
          });
        }

        return cv;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch CV",
          cause: error,
        });
      }
    }),
});
