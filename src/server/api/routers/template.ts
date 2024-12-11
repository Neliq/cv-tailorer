// src/server/api/routers/template.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const templateRouter = createTRPCRouter({
  // Existing procedures...

  // Procedure to create a template
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Template name is required"),
        sections: z
          .array(
            z.object({
              sectionType: z.enum(["left", "center", "right"]).default("left"),
              order: z.number(),
            }),
          )
          .min(1, "At least one section is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.template.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          sections: {
            create: input.sections,
          },
        },
        include: {
          sections: true,
        },
      });
    }),

  // Procedure to list all templates for the authenticated user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.template.findMany({
      where: { userId: ctx.session.user.id },
      include: { sections: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Procedure to delete a template
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before deletion
      const template = await ctx.db.template.findUnique({
        where: { id: input.id },
      });

      if (!template || template.userId !== ctx.session.user.id) {
        throw new Error("Template not found or unauthorized");
      }

      return ctx.db.template.delete({
        where: { id: input.id },
      });
    }),

  // Procedure to update a template
  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Template name is required"),
        sections: z
          .array(
            z.object({
              id: z.string().optional(), // Existing sections will have an ID
              sectionType: z.enum(["left", "center", "right"]),
              order: z.number(),
            }),
          )
          .min(1, "At least one section is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, sections } = input;

      // Fetch existing sections
      const existingTemplate = await ctx.db.template.findUnique({
        where: { id },
        include: { sections: true },
      });

      if (!existingTemplate || existingTemplate.userId !== ctx.session.user.id) {
        throw new Error("Template not found or unauthorized");
      }

      const existingSectionIds = existingTemplate.sections.map((s) => s.id);
      const incomingSectionIds = sections.filter((s) => s.id).map((s) => s.id);

      // Determine which sections to delete
      const sectionsToDelete = existingSectionIds.filter(
        (id) => !incomingSectionIds.includes(id)
      );

      return ctx.db.template.update({
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
                  sectionType: s.sectionType,
                  order: s.order,
                },
              })),
            // Create new sections
            create: sections
              .filter((s) => !s.id)
              .map((s) => ({
                sectionType: s.sectionType,
                order: s.order,
              })),
          },
        },
        include: {
          sections: true,
        },
      });
    }),
});