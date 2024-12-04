/*
  Warnings:

  - You are about to drop the `fotos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `fotos` DROP FOREIGN KEY `fotos_lancheId_fkey`;

-- DropTable
DROP TABLE `fotos`;

-- CreateTable
CREATE TABLE `imagens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(30) NOT NULL,
    `codigoImagem` LONGTEXT NOT NULL,
    `lancheId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `imagens` ADD CONSTRAINT `imagens_lancheId_fkey` FOREIGN KEY (`lancheId`) REFERENCES `lanches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
