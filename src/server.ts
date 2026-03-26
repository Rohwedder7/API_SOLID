import { app } from './app'
import { env } from './env'

app.ready().then(async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.log(`Server is running on http://localhost:${env.PORT}`)
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
})
