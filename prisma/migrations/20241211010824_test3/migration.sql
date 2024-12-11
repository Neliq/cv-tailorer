/*
  Warnings:

  - You are about to drop the column `content` on the `Section` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT NOT NULL,
    "contentPL" TEXT,
    "contentENG" TEXT,
    "alignment" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "Section_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("alignment", "heading", "id", "order", "templateId") SELECT "alignment", "heading", "id", "order", "templateId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE INDEX "Section_templateId_idx" ON "Section"("templateId");
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("createdAt", "id", "name", "userId") SELECT "createdAt", "id", "name", "userId" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE INDEX "Template_userId_idx" ON "Template"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
