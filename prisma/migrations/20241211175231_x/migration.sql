/*
  Warnings:

  - You are about to drop the column `alignment` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `contentENG` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `contentPL` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `Section` table. All the data in the column will be lost.
  - Added the required column `sectionType` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "Section_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("id", "order", "templateId") SELECT "id", "order", "templateId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE INDEX "Section_templateId_idx" ON "Section"("templateId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
