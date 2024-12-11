// src/server/api/routers/cv.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PrismaClient } from "@prisma/client";

export const cvRouter = createTRPCRouter({
  // Procedure to create a CV
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "CV name is required"),
        templateId: z.string(),
        sections: z
          .array(
            z.object({
              heading: z.string().min(1, "Heading is required"),
              content: z.string().min(1, "Content is required"),
              sectionType: z.enum(["left", "center", "right"]),
              order: z.number(),
            })
          )
          .min(1, "At least one section is required"),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: { db: PrismaClient, session: { user: { id: string } } }, input: { name: string, templateId: string, sections: { heading: string, content: string, sectionType: "left" | "center" | "right", order: number }[] } }) => {
      // Ensure the template belongs to the user
      const template = await ctx.db.template.findUnique({
        where: { id: input.templateId },
      });

      if (!template || template.userId !== ctx.session.user.id) {
        throw new Error("Template not found or unauthorized");
      }

      return ctx.db.cv.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          templateId: input.templateId,
          sections: {
            create: input.sections,
          },
        },
        include: {
          sections: true,
          template: true,
        },
      });
    }),

  // Procedure to list all CVs for the authenticated user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.cv.findMany({
      where: { userId: ctx.session.user.id },
      include: { template: true, sections: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Procedure to get a single CV by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const cv = await ctx.db.cv.findUnique({
        where: { id: input.id },
        include: { template: true, sections: true },
      });

      if (!cv || cv.userId !== ctx.session.user.id) {
        throw new Error("CV not found or unauthorized");
      }

      return cv;
    }),

  // Procedure to update a CV
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "CV name is required"),
        sections: z
          .array(
            z.object({
              id: z.string().optional(),
              heading: z.string().min(1, "Heading is required"),
              content: z.string().min(1, "Content is required"),
              sectionType: z.enum(["left", "center", "right"]),
              order: z.number(),
            })
          )
          .min(1, "At least one section is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, sections } = input;

      // Fetch existing CV
      const existingCV = await ctx.db.cv.findUnique({
        where: { id },
        include: { sections: true },
      });

      if (!existingCV || existingCV.userId !== ctx.session.user.id) {
        throw new Error("CV not found or unauthorized");
      }

      const existingSectionIds = existingCV.sections.map((s) => s.id);
      const incomingSectionIds = sections.filter((s) => s.id).map((s) => s.id);

      // Determine which sections to delete
      const sectionsToDelete = existingSectionIds.filter(
        (id) => !incomingSectionIds.includes(id)
      );

      return ctx.db.cv.update({
        where: { id },
        data: {
          name,
          sections: {
            // Delete removed sections
            deleteMany: sectionsToDelete.map((sectionId) => ({ id: sectionId })),
            // Update existing sections
            update: sections
              .filter((s) => s.id)
              .map((s) => ({
                where: { id: s.id },
                data: {
                  heading: s.heading,
                  content: s.content,
                  sectionType: s.sectionType,
                  order: s.order,
                },
              })),
            // Create new sections
            create: sections
              .filter((s) => !s.id)
              .map((s) => ({
                heading: s.heading,
                content: s.content,
                sectionType: s.sectionType,
                order: s.order,
              })),
          },
        },
        include: {
          sections: true,
          template: true,
        },
      });
    }),

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
        include: { sections: true }
      });

      if (!cv || cv.userId !== ctx.session.user.id) {
        throw new Error("CV not found or unauthorized");
      }

      // Delete all sections first
      await tx.cvSection.deleteMany({
        where: { cvId: input.id }
      });

      // Then delete the CV
      return tx.cv.delete({
        where: { id: input.id }
      });
    });
  }),
});