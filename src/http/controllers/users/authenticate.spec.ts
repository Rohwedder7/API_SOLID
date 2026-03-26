import request from 'supertest'
import { app } from '../../../app'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'

describe('authenticate (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to authenticate', async () => {
    const email = `johndoe-${randomUUID()}@example.com`
    const password = 'password123'

    await request(app.server).post('/users').send({
      name: 'John Doe',
      email,
      password,
    })

    const authResponse = await request(app.server).post('/sessions').send({
      email,
      password,
    })

    expect(authResponse.status).toBe(200)
    expect(authResponse.body).toEqual({
      token: expect.any(String),
    })
  })
})
