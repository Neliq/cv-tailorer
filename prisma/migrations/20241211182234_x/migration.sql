-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "Section_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("id", "order", "sectionType", "templateId") SELECT "id", "order", "sectionType", "templateId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE INDEX "Section_templateId_idx" ON "Section"("templateId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
