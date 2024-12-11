/*
  Warnings:

  - You are about to drop the `CV` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CVSection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CV";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CVSection";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "cv" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cv_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cvsection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "cvsection_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cv" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "cv_userId_idx" ON "cv"("userId");

-- CreateIndex
CREATE INDEX "cvsection_cvId_idx" ON "cvsection"("cvId");
