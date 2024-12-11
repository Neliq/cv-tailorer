// src/server/api/routers/template.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Define section schema with new types
const sectionSchema = z.object({
  id: z.string().optional(),
  sectionType: z.enum(["ContactInfo", "Socials", "Bio"]),
  order: z.number(),
});

export const templateRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Template name is required"),
        sections: z
          .array(sectionSchema)
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

  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.template.findMany({
      where: { userId: ctx.session.user.id },
      include: { sections: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const template = await tx.template.findUnique({
          where: { id: input.id },
          include: { sections: true }
        });

        if (!template || template.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Template not found or unauthorized"
          });
        }

        await tx.section.deleteMany({
          where: { templateId: input.id }
        });

        return tx.template.delete({
          where: { id: input.id }
        });
      });
    }),

  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Template name is required"),
        sections: z
          .array(sectionSchema)
          .min(1, "At least one section is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, sections } = input;

      const existingTemplate = await ctx.db.template.findUnique({
        where: { id },
        include: { sections: true },
      });

      if (!existingTemplate || existingTemplate.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Template not found or unauthorized"
        });
      }

      const existingSectionIds = existingTemplate.sections.map((s) => s.id);
      const incomingSectionIds = sections.filter((s) => s.id).map((s) => s.id);
      const sectionsToDelete = existingSectionIds.filter(
        (id) => !incomingSectionIds.includes(id)
      );

      return ctx.db.template.update({
        where: { id },
        data: {
          name,
          sections: {
            deleteMany: sectionsToDelete.map((sectionId) => ({ id: sectionId })),
            update: sections
              .filter((s) => s.id)
              .map((s) => ({
                where: { id: s.id },
                data: {
                  sectionType: s.sectionType,
                  order: s.order,
                },
              })),
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