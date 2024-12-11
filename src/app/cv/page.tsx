// src/app/cv/page.tsx

import React from "react";
import CVManager from "@/app/_components/cvManager";

export default function CVPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Your CVs</h1>
      <CVManager />
    </main>
  );
}