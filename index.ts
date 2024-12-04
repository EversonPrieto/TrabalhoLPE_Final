import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import tiposRoutes from './routes/tipos'
import lanchesRoutes from './routes/lanches'
import imagensRoutes from './routes/imagens'
import clientesRoutes from './routes/clientes'
import pedidosRoutes from './routes/pedidos'
import adminsRoutes from './routes/admins'
import dashboardRoutes from './routes/dashboard'

const app = express()
const port = 3004

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
dotenv.config()


app.use("/tipos", tiposRoutes)
app.use("/lanches", lanchesRoutes)
app.use("/imagens", imagensRoutes)
app.use("/clientes", clientesRoutes)
app.use("/pedidos", pedidosRoutes)
app.use("/admins", adminsRoutes)
app.use("/dashboard", dashboardRoutes)

app.get('/', (req, res) => {
  res.send('API: Sistema de Lanchonete')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})
