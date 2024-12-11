// src/app/_components/cvList.tsx

"use client";

import React from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";

interface CVListProps {
  onEdit: (cvId: string) => void;
}

const CVList: React.FC<CVListProps> = ({ onEdit }) => {
  const { data: cvs, isLoading, error, refetch } = api.cv.list.useQuery();
  const deleteCV = api.cv.delete.useMutation({
    onSuccess: () => {
      // Optionally, implement a toast or notification here
      refetch();
    },
    onError: (err) => {
      // Optionally, implement error handling here
      console.error("Delete CV Error:", err);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this CV?")) {
      deleteCV.mutate({ id });
    }
  };

  if (isLoading) return <p>Loading CVs...</p>;
  if (error) return <p>Error loading CVs: {error.message}</p>;
  if (!cvs || cvs.length === 0) return <p>No CVs found. Create one!</p>;

  return (
    <div className="space-y-4">
      {cvs.map((cv: CVType) => (
        <div
          key={cv.id}
          className="flex justify-between items-center p-4 border rounded"
        >
          <div>
            <h3 className="text-xl font-semibold">{cv.name}</h3>
            <p className="text-sm text-gray-600">
              Template: {cv.template?.name || "N/A"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(cv.id)}
              className="flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(cv.id)}
              className="flex items-center"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { CVList };