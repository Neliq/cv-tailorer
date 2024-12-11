// src/app/_components/cv.tsx

"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sectionFieldOptions, SectionType } from "@/config/sectionFields";
import { toast } from "@/hooks/use-toast";

interface SectionField {
  id?: string;
  sectionType: SectionType;
  order: number;
  // Fields for Bio
  heading?: string;
  content?: string;
  // Fields for ContactInfo
  name?: string;
  surname?: string;
  phone?: string;
  email?: string;
  // Fields for Socials
  linkedin?: string;
  website?: string;
}

interface Template {
  id: string;
  name: string;
  sections: {
    sectionType: SectionType;
    order: number;
  }[];
}

interface CVFormProps {
  cvId?: string;
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
      toast({ title: "CV Created", description: "Your CV has been saved successfully." });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });
  const updateCV = api.cv.update.useMutation({
    onSuccess: () => {
      toast({ title: "CV Updated", description: "Your CV has been updated successfully." });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (cv.data && cvId) {
      setName(cv.data.name);
      setSelectedTemplate(cv.data.templateId);
      setSections(cv.data.sections.sort((a, b) => a.order - b.order));
    }
  }, [cv.data, cvId]);

  useEffect(() => {
    if (selectedTemplate && !cvId) {
      const template = templates.data?.find((t) => t.id === selectedTemplate);
      if (template) {
        setSections(template.sections.map((s) => ({ ...s, heading: "", content: "" })));
      }
    }
    if (!selectedTemplate && !cvId) {
      setSections([]);
    }
  }, [selectedTemplate, templates.data, cvId]);

  const handleSectionChange = (index: number, field: keyof SectionField, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  const renderSectionFields = (section: SectionField, index: number) => {
    switch (section.sectionType) {
      case "ContactInfo":
        return (
          <>
            <Input
              placeholder="Name"
              value={section.name || ""}
              onChange={(e) => handleSectionChange(index, "name", e.target.value)}
              required
            />
            <Input
              placeholder="Surname"
              value={section.surname || ""}
              onChange={(e) => handleSectionChange(index, "surname", e.target.value)}
              required
            />
            <Input
              placeholder="Phone Number"
              value={section.phone || ""}
              onChange={(e) => handleSectionChange(index, "phone", e.target.value)}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={section.email || ""}
              onChange={(e) => handleSectionChange(index, "email", e.target.value)}
              required
            />
          </>
        );

      case "Socials":
        return (
          <>
            <Input
              placeholder="LinkedIn URL"
              value={section.linkedin || ""}
              onChange={(e) => handleSectionChange(index, "linkedin", e.target.value)}
              required
            />
            <Input
              placeholder="Website URL"
              value={section.website || ""}
              onChange={(e) => handleSectionChange(index, "website", e.target.value)}
              required
            />
          </>
        );

      case "Bio":
        return (
          <>
            <Input
              placeholder="Heading"
              value={section.heading || ""}
              onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
              required
            />
            <Textarea
              placeholder="Content"
              value={section.content || ""}
              onChange={(e) => handleSectionChange(index, "content", e.target.value)}
              required
            />
          </>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validateSection = (section: SectionField): boolean => {
      switch (section.sectionType) {
        case "ContactInfo":
          return !!(section.name && section.surname && section.phone && section.email);
        case "Socials":
          return !!(section.linkedin && section.website);
        case "Bio":
          return !!(section.heading && section.content);
        default:
          return false;
      }
    };

    if (!sections.every(validateSection)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields for each section",
        variant: "destructive",
      });
      return;
    }

    if (cvId) {
      updateCV.mutate({ id: cvId, name, sections });
    } else {
      createCV.mutate({ name, templateId: selectedTemplate, sections });
    }
  };

  if (cvId && cv.isLoading) return <p>Loading CV...</p>;
  if (cvId && cv.error) return <p>Error loading CV: {cv.error.message}</p>;

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
          onValueChange={setSelectedTemplate}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Template" />
          </SelectTrigger>
          <SelectContent>
            {templates.data?.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {sections.map((section, index) => (
        <div key={index} className="space-y-2 rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-2">{section.sectionType}</h3>
          {renderSectionFields(section, index)}
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