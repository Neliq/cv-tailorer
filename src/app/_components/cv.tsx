// src/app/_components/cv.tsx

"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sectionFieldOptions, SectionType } from "@/config/sectionFields";
import { SectionField } from "@/types/section";
import { toast } from "@/hooks/use-toast"; // Replace with your actual toast implementation

interface Template {
  id: string;
  name: string;
  sections: {
    sectionType: SectionType;
    order: number;
  }[];
}

interface CVFormProps {
  cvId?: string; // Optional prop for editing
  onSuccess: () => void;
}

const CVForm: React.FC<CVFormProps> = ({ cvId, onSuccess }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [sections, setSections] = useState<SectionField[]>([]);
  const [name, setName] = useState("");

  const templates = api.template.list.useQuery();
  const cv = api.cv.get.useQuery({ id: cvId || "" }, { enabled: !!cvId });
  const createCV = api.cv.create.useMutation({
    onSuccess: () => {
      toast({
        title: "CV Created",
        message: "Your CV has been saved successfully.",
        type: "success",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        message: error.message || "Something went wrong.",
        type: "error",
      });
    },
  });
  const updateCV = api.cv.update.useMutation({
    onSuccess: () => {
      toast({
        title: "CV Updated",
        message: "Your CV has been updated successfully.",
        type: "success",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        message: error.message || "Something went wrong.",
        type: "error",
      });
    },
  });

  useEffect(() => {
    if (cv.data && cvId) {
      setName(cv.data.name);
      setSelectedTemplate(cv.data.templateId);
      setSections(
        cv.data.sections
          .sort((a, b) => a.order - b.order)
          .map((s) => ({
            id: s.id,
            sectionType: s.sectionType as SectionType,
            order: s.order,
            heading: s.heading,
            content: s.content,
          }))
      );
    }
  }, [cv.data, cvId]);

  useEffect(() => {
    if (selectedTemplate && !cvId) {
      const template = templates.data?.find((t) => t.id === selectedTemplate);
      if (template) {
        const initialSections: SectionField[] = template.sections.map(
          (s) => ({
            sectionType: s.sectionType,
            order: s.order,
            heading: "",
            content: "",
          })
        );
        setSections(initialSections);
      }
    }
    if (!selectedTemplate && !cvId) {
      setSections([]);
    }
  }, [selectedTemplate, templates.data, cvId]);

  const handleSectionChange = (
    index: number,
    field: keyof SectionField,
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate sections based on sectionFieldOptions
    for (let section of sections) {
      const options = sectionFieldOptions[section.sectionType];
      if (options.heading && !section.heading.trim()) {
        toast({
          title: "Validation Error",
          message: "Heading is required for some sections.",
          type: "error",
        });
        return;
      }
      if (options.content && !section.content.trim()) {
        toast({
          title: "Validation Error",
          message: "Content is required for some sections.",
          type: "error",
        });
        return;
      }
    }

    if (cvId) {
      // Update existing CV
      updateCV.mutate({
        id: cvId,
        name,
        sections: sections.map((s) => ({
          id: s.id,
          heading: s.heading,
          content: s.content,
          sectionType: s.sectionType,
          order: s.order,
        })),
      });
    } else {
      // Create new CV
      createCV.mutate({
        name,
        templateId: selectedTemplate,
        sections: sections.map((s) => ({
          heading: s.heading,
          content: s.content,
          sectionType: s.sectionType,
          order: s.order,
        })),
      });
    }
  };

  if (cvId && cv.isLoading) return <p>Loading CV...</p>;
  if (cvId && cv.error)
    return <p>Error loading CV: {cv.error.message}</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        placeholder="CV Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      {!cvId && (
        <Select
          value={selectedTemplate}
          onValueChange={(value) => setSelectedTemplate(value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Template" />
          </SelectTrigger>
          <SelectContent>
            {templates.data?.map((template: Template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {sections.map((section, index) => (
        <div key={index} className="space-y-2">
          {sectionFieldOptions[section.sectionType].heading && (
            <Input
              placeholder="Section Heading"
              value={section.heading}
              onChange={(e) =>
                handleSectionChange(index, "heading", e.target.value)
              }
              required
            />
          )}
          {sectionFieldOptions[section.sectionType].content && (
            <Textarea
              placeholder="Section Content"
              value={section.content}
              onChange={(e) =>
                handleSectionChange(index, "content", e.target.value)
              }
              required
            />
          )}
        </div>
      ))}
      <Button type="submit" disabled={createCV.isLoading || updateCV.isLoading}>
        {createCV.isLoading || updateCV.isLoading
          ? "Saving..."
          : cvId
          ? "Update CV"
          : "Save CV"}
      </Button>
    </form>
  );
};

export { CVForm };