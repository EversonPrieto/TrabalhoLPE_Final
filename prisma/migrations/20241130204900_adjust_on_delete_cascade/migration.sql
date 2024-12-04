-- DropForeignKey
ALTER TABLE `pedidos` DROP FOREIGN KEY `pedidos_clienteId_fkey`;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
