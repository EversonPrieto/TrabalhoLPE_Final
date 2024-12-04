import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import nodemailer from "nodemailer"
import { verificaToken } from "../middewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        cliente: true,
        lanche: true
      },
      orderBy: { id: 'desc'}
    })
    res.status(200).json(pedidos)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", async (req, res) => {
  const { clienteId, lancheId, descricao } = req.body

  if (!clienteId || !lancheId || !descricao) {
    res.status(400).json({ erro: "Informe clienteId, lancheId e descricao" })
    return
  }

  try {
    const pedido = await prisma.pedido.create({
      data: { clienteId, lancheId, descricao }
    })
    res.status(201).json(pedido)
  } catch (error) {
    res.status(400).json(error)
  }
})


async function enviaEmail(nome: string, email: string,
  descricao: string, entrega: string) {

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: process.env.EMAIL_SECURE === 'true', // converter para booleano
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
  const info = await transporter.sendMail({
    from: process.env.EMAIL_EMAIL, // sender address
    to: email, // list of receivers
    subject: "Re: Pedido Lanchonete Senac", // Subject line
    text: entrega, // plain text body
    html: `<h3>Estimado Cliente: ${nome}</h3>
           <h3>pedido: ${descricao}</h3>
           <h3>entrega do pedido: ${entrega}</h3>
           <p>Muito obrigado pelo seu contato</p>
           <p>Lanchonete Senac</p>`
  });

  console.log("Message sent: %s", info.messageId);
}

router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { entrega } = req.body

  if (!entrega) {
    res.status(400).json({ "erro": "Informe a entrega deste pedido" })
    return
  }

  try {
    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { entrega }
    })

    const dados = await prisma.pedido.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: true
      }
    })

    enviaEmail(dados?.cliente.nome as string,
      dados?.cliente.email as string,
      dados?.descricao as string,
      entrega)

    res.status(200).json(pedido)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/:clienteId", async (req, res) => {
  const { clienteId } = req.params
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { clienteId },
      include: {
        lanche: true
      }
    })
    res.status(200).json(pedidos)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const pedido = await prisma.pedido.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(pedido)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router