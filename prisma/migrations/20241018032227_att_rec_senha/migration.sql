-- AlterTable
ALTER TABLE `cliente` ADD COLUMN `codigoGeradoAt` DATETIME(3) NULL,
    MODIFY `codigoRecuperacao` VARCHAR(191) NULL;
