import { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials-errors'
import { compare } from 'bcryptjs'
import { User } from 'generated/prisma'

interface AutenticateUserRequest {
  email: string
  password: string
}

interface AutenticateUserResponse {
  user: User
}

export class AuthenticationService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AutenticateUserRequest): Promise<AutenticateUserResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const doesPasswordMatches = await compare(password, user.password_hash)
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }

    return {
      user,
    }
  }
}
