/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrlSecret` on the `Attachment` table. All the data in the column will be lost.
  - Added the required column `value` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Attachment_fileUrl_key";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "fileUrl",
DROP COLUMN "fileUrlSecret",
ADD COLUMN     "value" BYTEA NOT NULL;
