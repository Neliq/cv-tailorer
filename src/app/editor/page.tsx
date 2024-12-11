// src/app/pdf-generator/page.tsx
import { auth } from "@/server/auth";
import { appRouter } from "@/server/api/root"; // Import appRouter
import { createTRPCContext } from "@/server/api/trpc"; // Import createTRPCContext
import { ClientPDFGenerator } from "@/app/_components/client";
import { Suspense } from "react";

export default async function PDFGeneratorPage() {
  const session = await auth();

  // Create the tRPC context
  const ctx = await createTRPCContext({ headers: new Headers() });

  // Create a caller from the appRouter and context
  const caller = appRouter.createCaller(ctx);

  // Call the 'list' procedure directly
  const templates = await caller.template.list();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPDFGenerator initialTemplates={templates} />
    </Suspense>
  );
}