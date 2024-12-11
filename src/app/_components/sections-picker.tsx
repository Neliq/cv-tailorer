// src/app/_components/sections-picker.tsx
"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react"; // Import Lucide draggable icon

interface Section {
  id: string;
  sectionType: "left" | "center" | "right";
  order: number;
}

interface SectionPickerProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

export function SectionPicker({ sections, setSections }: SectionPickerProps) {
  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      sectionType: "left",
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(sections);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSections(
      reordered.map((section, index) => ({
        ...section,
        order: index + 1,
      }))
    );
  };

  const updateSectionType = (id: string, type: Section["sectionType"]) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, sectionType: type } : section
      )
    );
  };

  return (
    <div>
      <Button onClick={addSection} className="mb-4">
        Add Section
      </Button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <div
                        className="flex items-center space-x-2 mb-2 p-2 border rounded"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        {/* Draggable Icon */}
                        <div {...provided.dragHandleProps} className="cursor-grab mr-2">
                          <GripVertical className="w-4 h-4 text-gray-500" />
                        </div>

                        {/* Section Type Selector */}
                        <Select
                          value={section.sectionType}
                          onValueChange={(value) =>
                            updateSectionType(section.id, value as Section["sectionType"])
                          }
                          className="flex-1"
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Remove Button */}
                        <Button
                          onClick={() => removeSection(section.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}