import { JWTPayload, Permission, UserGroup } from '@core/entity.core';
import { Env } from '@start/env';
import MagicLinkUseCase from '@use-case/authentication/magic-link.use-case';
import { AuthenticationMagicLinkSchema } from '@validators/authentication.validator';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET, getInstanceByToken } from 'fastify-decorators';

@Controller({
  route: '/authentication',
})
export default class {
  constructor(
    private readonly useCase: MagicLinkUseCase = getInstanceByToken(
      MagicLinkUseCase,
    ),
  ) {}

  @GET({
    url: '/magic-link',
    options: {
      schema: {
        tags: ['Authentication'],
        summary: 'Authentication Magic Link',
        description: 'Authentication Magic Link',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = AuthenticationMagicLinkSchema.parse(request.query);

    const result = await this.useCase.execute(payload);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    const group: UserGroup = result?.value?.group as UserGroup;
    const permissions: Permission[] = group?.permissions as Permission[];

    const jwt: JWTPayload = {
      email: result?.value?.email,
      name: result?.value?.name,
      permissions: permissions?.flatMap((permission) => permission.slug),
      group: {
        name: group?.name,
        description: group?.description,
        slug: group?.slug,
      },
      sub: result?.value?._id?.toString(),
    };

    const accessToken = await response.jwtSign(jwt, {
      sub: result?.value?._id?.toString(),
      expiresIn: '1d',
    });

    const refreshToken = await response.jwtSign(
      {
        sub: result?.value?._id?.toString(),
        type: 'refresh',
      },
      {
        sub: result?.value?._id?.toString(),
        expiresIn: '7d',
      },
    );

    const cookieOptions = {
      path: '/',
      secure: Env.NODE_ENV === 'production', // Só HTTPS em produção
      sameSite: 'strict' as const, // Proteção CSRF mais rígida
      httpOnly: true,
      // domain: Env.NODE_ENV === 'production' ? Env.COOKIE_DOMAIN : undefined,
    };

    response
      .setCookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 1000, // 1 dia em ms
      })
      .setCookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
      });

    return response
      .status(302)
      .redirect(Env.APP_CLIENT_URL.concat('/dashboard?authentication=success'));
  }
}
