import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator } from '#validators/user'

export default class ApiSessionController {
  async store({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user, ['*'], {
      name: 'api',
      expiresIn: '30 days',
    })

    return token.toJSON()
  }

  async destroy({ auth, response }: HttpContext) {
    const user = auth.use('api').getUserOrFail()

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return response.noContent()
  }
}
