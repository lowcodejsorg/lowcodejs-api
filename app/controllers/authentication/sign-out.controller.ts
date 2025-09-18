import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import { Env } from '@start/env';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, POST } from 'fastify-decorators';

@Controller({
  route: 'authentication',
})
export default class SignOutController {
  @POST({
    url: '/sign-out',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Authentication'],
        summary: 'Authentication Sign Out',
        description: 'Authentication Sign Out',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const cookieOptions = {
      path: '/',
      secure: Env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      httpOnly: true,
    };

    response
      .setCookie('accessToken', '', {
        ...cookieOptions,
        maxAge: 0,
      })
      .setCookie('refreshToken', '', {
        ...cookieOptions,
        maxAge: 0,
      });

    return response.status(200).send();
  }
}
