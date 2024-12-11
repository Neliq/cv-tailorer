/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Template_id_userId_key" ON "Template"("id", "userId");
