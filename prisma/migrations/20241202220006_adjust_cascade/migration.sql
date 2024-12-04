-- DropForeignKey
ALTER TABLE `imagens` DROP FOREIGN KEY `imagens_lancheId_fkey`;

-- AddForeignKey
ALTER TABLE `imagens` ADD CONSTRAINT `imagens_lancheId_fkey` FOREIGN KEY (`lancheId`) REFERENCES `lanches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
