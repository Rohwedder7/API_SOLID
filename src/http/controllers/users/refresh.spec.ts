import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../../../app'

describe('refresh (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to refresh a token', async () => {
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

    const setCookieHeader = authResponse.get('set-cookie')
    const refreshTokenCookie = Array.isArray(setCookieHeader)
      ? setCookieHeader[0]
      : setCookieHeader

    expect(refreshTokenCookie).toBeDefined()
    if (!refreshTokenCookie) {
      throw new Error('Missing refresh token cookie')
    }

    const response = await request(app.server)
      .patch('/token/refresh')
      .set('Cookie', refreshTokenCookie.split(';')[0])
      .send()

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      token: expect.any(String),
    })
    expect(response.get('set-cookie')).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    )
  })
})
