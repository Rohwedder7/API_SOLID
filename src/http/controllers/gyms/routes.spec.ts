import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../../../app'
import { prisma } from '@/lib/prisma'

async function createAndAuthenticateUser(isAdmin = false) {
  const email = `johndoe-${randomUUID()}@example.com`
  const password = 'password123'

  await request(app.server).post('/users').send({
    name: 'John Doe',
    email,
    password,
  })

  if (isAdmin) {
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    })
  }

  const authResponse = await request(app.server).post('/sessions').send({
    email,
    password,
  })

  return {
    token: authResponse.body.token as string,
  }
}

describe('gyms routes (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a gym', async () => {
    const { token } = await createAndAuthenticateUser(true)
    const title = `JavaScript Gym ${randomUUID()}`

    const response = await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title,
        description: 'Gym for functional training',
        phone: '11999999999',
        latitude: -27.2092052,
        longitude: -49.6401091,
      })

    expect(response.status).toBe(201)

    const gymOnDatabase = await prisma.gym.findFirst({
      where: { title },
    })

    expect(gymOnDatabase).toBeTruthy()
  })

  it('should be able to search gyms', async () => {
    const { token } = await createAndAuthenticateUser()

    await prisma.gym.create({
      data: {
        title: `JavaScript Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    await prisma.gym.create({
      data: {
        title: `Crossfit Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    const response = await request(app.server)
      .get('/gyms/search')
      .set('Authorization', `Bearer ${token}`)
      .query({
        query: 'JavaScript',
        page: 1,
      })

    expect(response.status).toBe(200)
    expect(response.body.gyms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: expect.stringContaining('JavaScript Gym'),
        }),
      ]),
    )
  })

  it('should be able to fetch nearby gyms', async () => {
    const { token } = await createAndAuthenticateUser()

    const nearbyGym = await prisma.gym.create({
      data: {
        title: `Nearby Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    await prisma.gym.create({
      data: {
        title: `Far Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.1,
        longitude: -49.6,
      },
    })

    const response = await request(app.server)
      .get('/gyms/nearby')
      .set('Authorization', `Bearer ${token}`)
      .query({
        latitude: -27.2092052,
        longitude: -49.6401091,
      })

    expect(response.status).toBe(200)
    expect(response.body.gyms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: nearbyGym.id,
        }),
      ]),
    )
  })
})
