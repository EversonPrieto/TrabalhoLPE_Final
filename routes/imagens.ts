import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

const router = Router();

// Rota para obter todas as imagens
router.get("/", async (req, res) => {
  try {
    const imagens = await prisma.imagem.findMany();
    res.status(200).json(imagens);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Rota para obter imagens de um lanche específico
router.get("/:lancheId", async (req, res) => {
  const { lancheId } = req.params;

  try {
    const imagens = await prisma.imagem.findMany({
      where: { lancheId: Number(lancheId) }
    });
    res.status(200).json(imagens);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", upload.single('codigoImagem'), async (req, res) => {
  const { descricao, lancheId } = req.body;
  const codigo = req.file?.buffer.toString("base64");

  if (!descricao || !lancheId || !codigo) {
    res.status(400).json({ "erro": "Informe descricao, lancheId e codigoImagem" });
    return;
  }

  try {
    const imagem = await prisma.imagem.create({
      data: {
        descricao, lancheId: Number(lancheId),
        codigoImagem: codigo as string
      }
    });
    res.status(201).json(imagem);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const imagem = await prisma.imagem.delete({
      where: { id: Number(id) }
    });
    res.status(200).json(imagem);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
