-- CreateTable
CREATE TABLE "CV" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CV_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CVSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CVSection_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CV_userId_idx" ON "CV"("userId");

-- CreateIndex
CREATE INDEX "CVSection_cvId_idx" ON "CVSection"("cvId");
