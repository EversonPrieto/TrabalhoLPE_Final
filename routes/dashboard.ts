import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

router.get("/gerais", async (req, res) => {
  try {
    const clientes = await prisma.cliente.count()
    const lanches = await prisma.lanche.count()
    const pedidos = await prisma.pedido.count()
    res.status(200).json({ clientes, lanches, pedidos })
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/lanchesTipo", async (req, res) => {
  try {
    const lanches = await prisma.lanche.groupBy({
      by: ['tipoId'],
      _count: {
        id: true, 
      }
    })

    // Para cada lanche, inclui o nome do tipo relacionada ao tipoId
    const lanchesTipo = await Promise.all(
      lanches.map(async (lanche) => {
        const tipo = await prisma.tipo.findUnique({
          where: { id: lanche.tipoId }
        })
        return {
          tipo: tipo?.nome, 
          num: lanche._count.id
        }
      })
    )
    res.status(200).json(lanchesTipo)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
