/*
  Warnings:

  - You are about to drop the `cv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cvsection` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cv_userId_idx";

-- DropIndex
DROP INDEX "cvsection_cvId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "cv";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "cvsection";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Cv" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cv_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CvSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvSection_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "Cv" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "Section_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Section" ("id", "order", "sectionType", "templateId") SELECT "id", "order", "sectionType", "templateId" FROM "Section";
DROP TABLE "Section";
ALTER TABLE "new_Section" RENAME TO "Section";
CREATE INDEX "Section_templateId_idx" ON "Section"("templateId");
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("createdAt", "id", "name", "userId") SELECT "createdAt", "id", "name", "userId" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE INDEX "Template_userId_idx" ON "Template"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Cv_userId_idx" ON "Cv"("userId");

-- CreateIndex
CREATE INDEX "CvSection_cvId_idx" ON "CvSection"("cvId");
