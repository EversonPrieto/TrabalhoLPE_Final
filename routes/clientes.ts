import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { verificaToken } from "../middewares/verificaToken"
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer"


const prisma = new PrismaClient()
const router = Router()

router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany()
    res.status(200).json(clientes)
  } catch (error) {
    res.status(400).json(error)
  }
})

function validaSenha(senha: string) {

  const mensa: string[] = []

  // .length: retorna o tamanho da string (da senha)
  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  // contadores
  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  // senha = "abc123"
  // letra = "a"

  // percorre as letras da variável senha
  for (const letra of senha) {
    // expressão regular
    if ((/[a-z]/).test(letra)) {
      pequenas++
    }
    else if ((/[A-Z]/).test(letra)) {
      grandes++
    }
    else if ((/[0-9]/).test(letra)) {
      numeros++
    } else {
      simbolos++
    }
  }

  if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
    mensa.push("Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos")
  }

  return mensa
}

router.post("/", async (req, res) => {
  const { nome, email, senha } = req.body

  if (!nome || !email || !senha) {
    res.status(400).json({ erro: "Informe nome, email e senha" })
    return
  }

  const erros = validaSenha(senha)
  if (erros.length > 0) {
    res.status(400).json({ erro: erros.join("; ") })
    return
  }

  // 12 é o número de voltas (repetições) que o algoritmo faz
  // para gerar o salt (sal/tempero)
  const salt = bcrypt.genSaltSync(12)
  // gera o hash da senha acrescida do salt
  const hash = bcrypt.hashSync(senha, salt)

  // para o campo senha, atribui o hash gerado
  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email, senha: hash }
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/login", async (req, res) => {
  const { email, senha } = req.body

  // em termos de segurança, o recomendado é exibir uma mensagem padrão
  // a fim de evitar de dar "dicas" sobre o processo de login para hackers
  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    // res.status(400).json({ erro: "Informe e-mail e senha do usuário" })
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    })

    if (cliente == null) {
      // res.status(400).json({ erro: "E-mail inválido" })
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    // se o e-mail existe, faz-se a comparação dos hashs
    if (bcrypt.compareSync(senha, cliente.senha)) {
      res.status(200).json({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      })
    } else {
      // res.status(400).json({ erro: "Senha incorreta" })

      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id }
    })

    if (cliente == null) {
      res.status(400).json({ erro: "Não Cadastrado" })
    } else {
      res.status(200).json({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email
      })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

// routes/clientes.ts

router.post("/recuperar-senha", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ erro: "Informe o e-mail" });
    return;
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email },
    });

    if (!cliente) {
      res.status(400).json({ erro: "E-mail não cadastrado" });
      return;
    }

    const codigoRecuperacao = String(Math.floor(100000 + Math.random() * 900000));    // Gera um código de 6 dígitos
    const agora = new Date();

    await prisma.cliente.update({
      where: { id: cliente.id },
      data: { 
        codigoRecuperacao, 
        codigoGeradoAt: agora // Armazena o timestamp atual
      },
    });

    // Enviar e-mail para o cliente com o código de recuperação
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_EMAIL,
      to: email,
      subject: "Recuperação de senha",
      text: `Seu código de recuperação é: ${codigoRecuperacao}`,
    });

    res.status(200).json({ mensagem: "Código de recuperação enviado com sucesso" });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/alterar-senha", async (req, res) => {
  const { email, codigoRecuperacao, novaSenha } = req.body;

  if (!email || !codigoRecuperacao || !novaSenha) {
    res.status(400).json({ erro: "Informe o e-mail, código de recuperação e nova senha" });
    return;
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email },
    });

    if (!cliente) {
      res.status(400).json({ erro: "E-mail não cadastrado" });
      return;
    }

    // Verifica se o código de recuperação é válido e não expirou
    const agora = new Date();
    const dezMinutos = 10 * 60 * 1000; // 10 minutos em milissegundos
    const codigoGeradoAt = cliente.codigoGeradoAt;

    // Verifica se o código de recuperação está definido
    if (
      cliente.codigoRecuperacao !== codigoRecuperacao || 
      !codigoGeradoAt ||
      (agora.getTime() - new Date(codigoGeradoAt).getTime()) > dezMinutos // Converter para milissegundos
    ) {
      res.status(400).json({ erro: "Código de recuperação inválido ou expirado" });
      return;
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(novaSenha, salt);

    await prisma.cliente.update({
      where: { id: cliente.id },
      data: { senha: hash, codigoRecuperacao: null, codigoGeradoAt: null }, // Limpa os dados de recuperação
    });

    res.status(200).json({ mensagem: "Senha alterada com sucesso" });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    await prisma.cliente.delete({
      where: { id },
    });

    res.status(200).json({ mensagem: "Cliente excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir cliente" });
  }
});


export default router