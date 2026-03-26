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

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  })

  return {
    token: authResponse.body.token as string,
    userId: user.id,
  }
}

describe('check-ins routes (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a check-in', async () => {
    const { token } = await createAndAuthenticateUser()

    const gym = await prisma.gym.create({
      data: {
        title: `Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    const response = await request(app.server)
      .post(`/gyms/${gym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: -27.2092052,
        longitude: -49.6401091,
      })

    expect(response.status).toBe(201)
  })

  it('should be able to fetch check-ins history', async () => {
    const { token, userId } = await createAndAuthenticateUser()

    const gym = await prisma.gym.create({
      data: {
        title: `History Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    await prisma.checkIn.createMany({
      data: [
        {
          user_id: userId,
          gym_id: gym.id,
        },
        {
          user_id: userId,
          gym_id: gym.id,
        },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/history')
      .set('Authorization', `Bearer ${token}`)
      .query({
        page: 1,
      })

    expect(response.status).toBe(200)
    expect(response.body.checkins).toHaveLength(2)
  })

  it('should be able to get check-ins metrics', async () => {
    const { token, userId } = await createAndAuthenticateUser()

    const gym = await prisma.gym.create({
      data: {
        title: `Metrics Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    await prisma.checkIn.create({
      data: {
        user_id: userId,
        gym_id: gym.id,
      },
    })

    const response = await request(app.server)
      .get('/check-ins/metrics')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      checkInsCount: 1,
    })
  })

  it('should be able to validate a check-in', async () => {
    const { token, userId } = await createAndAuthenticateUser(true)

    const gym = await prisma.gym.create({
      data: {
        title: `Validate Gym ${randomUUID()}`,
        description: '',
        phone: '',
        latitude: -27.2092052,
        longitude: -49.6401091,
      },
    })

    const checkIn = await prisma.checkIn.create({
      data: {
        user_id: userId,
        gym_id: gym.id,
      },
    })

    const response = await request(app.server)
      .patch(`/check-ins/${checkIn.id}/validate`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)

    const checkInOnDatabase = await prisma.checkIn.findUnique({
      where: {
        id: checkIn.id,
      },
    })

    expect(checkInOnDatabase?.validated_at).toEqual(expect.any(Date))
  })
})
