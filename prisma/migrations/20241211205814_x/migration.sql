-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CvSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heading" TEXT,
    "content" TEXT,
    "name" TEXT,
    "surname" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "website" TEXT,
    "sectionType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "cvId" TEXT NOT NULL,
    CONSTRAINT "CvSection_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "Cv" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CvSection" ("content", "cvId", "heading", "id", "order", "sectionType") SELECT "content", "cvId", "heading", "id", "order", "sectionType" FROM "CvSection";
DROP TABLE "CvSection";
ALTER TABLE "new_CvSection" RENAME TO "CvSection";
CREATE INDEX "CvSection_cvId_idx" ON "CvSection"("cvId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
