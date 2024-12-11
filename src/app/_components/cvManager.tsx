// src/app/_components/cvManager.tsx

"use client";

import React, { useState } from "react";
import { CVForm } from "@/app/_components/cv";
import { CVList } from "@/app/_components/cvList";

const CVManager: React.FC = () => {
  const [editingCV, setEditingCV] = useState<string | null>(null);

  return (
    <>
      {/* CV List Section */}
      <CVList onEdit={(cvId) => setEditingCV(cvId)} />

      {/* CV Form Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">
          {editingCV ? "Edit CV" : "Create New CV"}
        </h2>
        <CVForm
          cvId={editingCV}
          onSuccess={() => setEditingCV(null)}
        />
      </div>
    </>
  );
};

export default CVManager;