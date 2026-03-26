import request from 'supertest'
import { app } from '../../../app'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'

describe('register (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register a new user', async () => {
    const email = `johndoe-${randomUUID()}@example.com`

    const response = await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
      password: 'password123',
    })

    expect(response.status).toBe(201)
  })
})
