// import { PrismaClient } from "@prisma/client"
// import { Router } from "express"

// const prisma = new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//     {
//       emit: 'stdout',
//       level: 'error',
//     },
//     {
//       emit: 'stdout',
//       level: 'info',
//     },
//     {
//       emit: 'stdout',
//       level: 'warn',
//     },
//   ],
// })

// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })

// const router = Router()

// router.get("/", async (req, res) => {
//   try {
//     const lanches = await prisma.lanche.findMany({
//       include: {
//         tipo: true,
//       }
//     })
//     res.status(200).json(lanches)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.post("/", async (req, res) => {
//   const { nome, descricao, preco, imagem, tipoId } = req.body

//   if (!nome || !descricao || !preco || !imagem || !tipoId) {
//     res.status(400).json({ "erro": "Informe nome, descricao, preco, imagem e tipoId" })
//     return
//   }

//   try {
//     const lanche = await prisma.lanche.create({
//       data: { nome, descricao, preco, imagem, tipoId }
//     })
//     res.status(201).json(lanche)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.delete("/:id", async (req, res) => {
//   const { id } = req.params

//   try {
//     const lanche = await prisma.lanche.delete({
//       where: { id: Number(id) }
//     })
//     res.status(200).json(lanche)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.put("/:id", async (req, res) => {
//   const { id } = req.params
//   const { nome, descricao, preco, imagem, tipoId } = req.body

//   if (!nome || !descricao || !preco || !imagem || !tipoId) {
//     res.status(400).json({ "erro": "Informe nome, descricao, preco, imagem e tipoId" })
//     return
//   }

//   try {
//     const lanche = await prisma.lanche.update({
//       where: { id: Number(id) },
//       data: { nome, descricao, preco, imagem, tipoId }
//     })
//     res.status(200).json(lanche)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })

// router.get("/pesquisa/:termo", async (req, res) => {
//   const { termo } = req.params

//   // tenta converter o termo em número
//   const termoNumero = Number(termo)

//   // se não é número (Not a Number)
//   if (isNaN(termoNumero)) {

//     try {
//       const lanches = await prisma.lanche.findMany({
//         include: {
//           tipo: true,
//         },
//         where: {
//           OR: [
//             {
//               nome: { contains: termo }
//             },
//             {
//               tipo: { nome: termo }
//             }
//           ]
//         }
//       })
//       res.status(200).json(lanches)
//     } catch (error) {
//       res.status(400).json(error)
//     }

//   } else {

//     try {
//       const lanches = await prisma.lanche.findMany({
//         include: {
//           tipo: true,
//         },
//         where: {
//           OR: [
//             {
//               preco: { lte: termoNumero }
//             }
//           ]
//         }
//       })
//       res.status(200).json(lanches)
//     } catch (error) {
//       res.status(400).json(error)
//     }

//   }

// })

// router.get("/:id", async (req, res) => {
//   const { id } = req.params
//   try {
//     const lanche = await prisma.lanche.findUnique({
//       where: { id: Number(id) },
//       include: {
//         tipo: true,
//       }
//     })
//     res.status(200).json(lanche)
//   } catch (error) {
//     res.status(400).json(error)
//   }
// })



// export default router


import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { verificaToken } from "../middewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const lanches = await prisma.lanche.findMany({
      orderBy: { id: 'desc' },
      include: {
        tipo: true
      }
    })
    res.status(200).json(lanches)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/destaques", async (req, res) => {
  try {
    const lanches = await prisma.lanche.findMany({
      orderBy: { id: 'desc' },
      include: {
        tipo: true
      },
      where: { destaque: true }
    })
    res.status(200).json(lanches)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", verificaToken, async (req, res) => {
  const { nome, descricao, preco, imagem, tipoId } = req.body

  if (!nome || !descricao || !preco || !imagem || !tipoId) {
    res.status(400).json({ "erro": "Informe nome, descricao, preco, imagem e tipoId" })
    return
  }

  try {
    const lanche = await prisma.lanche.create({
      data: { nome, descricao, preco, imagem, tipoId }
    })
    res.status(201).json(lanche)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const lanche = await prisma.lanche.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(lanche)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.put("/destacar/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  try {
    const lancheDestacar = await prisma.lanche.findUnique({
      where: { id: Number(id) },
      select: { destaque: true }, 
    });

    const lanche = await prisma.lanche.update({
      where: { id: Number(id) },
      data: { destaque: !lancheDestacar?.destaque }
    })
    res.status(200).json(lanche)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params
  const { nome, descricao, preco, imagem, tipoId } = req.body

  if (!nome || !descricao || !preco || !imagem || !tipoId) {
    res.status(400).json({ "erro": "Informe nome, descricao, preco, imagem e tipoId" })
    return
  }

  try {
    const lanche = await prisma.lanche.update({
      where: { id: Number(id) },
      data: { nome, descricao, preco, imagem, tipoId }
    })
    res.status(200).json(lanche)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // tenta converter o termo em número
  const termoNumero = Number(termo)

  // se a conversão gerou um NaN (Not a Number)
  if (isNaN(termoNumero)) {
    try {
      const lanches = await prisma.lanche.findMany({
        include: {
          tipo: true
        },
        where: {
          OR: [
            { nome: { contains: termo } },
            { tipo: { nome: termo } }
          ]
        }
      })
      res.status(200).json(lanches)
    } catch (error) {
      res.status(400).json(error)
    }
  } else {
    try {
      const lanches = await prisma.lanche.findMany({
        include: {
          tipo: true
        },
        where: {
          OR: [
            { preco: { lte: termoNumero } }
            // { ano: termoNumero } tem virugla dps da chaves de cima
          ]
        }
      })
      res.status(200).json(lanches)
    } catch (error) {
      res.status(400).json(error)
    }
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const lanche = await prisma.lanche.findUnique({
      where: { id: Number(id) },
      include: {
        tipo: true
      }
    })
    res.status(200).json(lanche)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router