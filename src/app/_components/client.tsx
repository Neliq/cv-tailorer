// src/app/_components/client.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { SectionPicker } from "./sections-picker";

interface Section {
  id: string;
  sectionType: "left" | "center" | "right";
  order: number;
}

interface Template {
  id: string;
  name: string;
  userId: string;
  sections: Section[];
  createdAt: Date;
}

interface Props {
  initialTemplates: Template[];
}

export function ClientPDFGenerator({ initialTemplates }: Props) {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [name, setName] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Mutation to create a new template
  const createTemplate = api.template.create.useMutation({
    onSuccess: () => {
      toast({ title: "Template saved successfully." });
      setName("");
      setSections([]);
      refetchTemplates();
    },
    onError: () => {
      toast({ title: "Error saving template." });
    },
  });

  // Mutation to update an existing template
  const updateTemplate = api.template.updateTemplate.useMutation({
    onSuccess: () => {
      toast({ title: "Template updated successfully." });
      setSelectedTemplate(null);
      setName("");
      setSections([]);
      refetchTemplates();
    },
    onError: () => {
      toast({ title: "Error updating template." });
    },
  });

  // Mutation to delete a template
  const deleteTemplate = api.template.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Template deleted successfully." });
      setSelectedTemplate(null);
      setName("");
      setSections([]);
      refetchTemplates();
    },
    onError: () => {
      toast({ title: "Error deleting template." });
    },
  });

  // Fetch templates
  const { data: templates, refetch: refetchTemplates } = api.template.list.useQuery();

  useEffect(() => {
    if (selectedTemplate) {
      setSections(selectedTemplate.sections);
      setName(selectedTemplate.name);
    }
  }, [selectedTemplate]);

  // Handle saving a new template or updating an existing one
  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Template name is required." });
      return;
    }

    if (selectedTemplate) {
      // Update existing template
      updateTemplate.mutate({
        id: selectedTemplate.id,
        name,
        sections,
      });
    } else {
      // Create new template
      createTemplate.mutate({ name, sections });
    }
  };

  // Handle clicking on a template to load it for editing
  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  // Handle deleting a template
  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate.mutate({ id: templateId });
    }
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">
        {selectedTemplate ? "Edit Template" : "Create New Template"}
      </h1>
      <input
        type="text"
        placeholder="Template Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <SectionPicker sections={sections} setSections={setSections} />
      <Button onClick={handleSave} disabled={createTemplate.isLoading || updateTemplate.isLoading}>
        {createTemplate.isLoading || updateTemplate.isLoading
          ? selectedTemplate
            ? "Updating..."
            : "Saving..."
          : selectedTemplate
          ? "Update Template"
          : "Save Template"}
      </Button>
      {selectedTemplate && (
        <Button
          onClick={() => setSelectedTemplate(null)}
          className="ml-2"
          variant="secondary"
        >
          Cancel
        </Button>
      )}

      <div className="mt-8">
        <h2 className="text-xl mb-4">Existing Templates</h2>
        {templates?.map((template) => (
          <div key={template.id} className="mb-4 p-4 border rounded">
            <div className="flex justify-between items-center">
              <h3 className="text-lg">{template.name}</h3>
              <Button
                onClick={() => handleDeleteTemplate(template.id)}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
            <Button
              onClick={() => handleTemplateClick(template)}
              className="mt-2"
              variant="outline"
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}