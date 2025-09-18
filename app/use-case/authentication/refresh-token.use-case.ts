import { Either, left, right } from '@core/either.core';
import { User as Entity } from '@core/entity.core';
import ApplicationException from '@exceptions/application.exception';
import { User as Model } from '@model/user.model';
import { Service } from 'fastify-decorators';

type Response = Either<ApplicationException, Entity>;

@Service()
export default class RefreshTokenUseCase {
  async execute({ userId }: { userId: string }): Promise<Response> {
    const user = await Model.findOne({ _id: userId });

    if (!user) {
      return left(
        ApplicationException.Unauthorized('User not found', 'USER_NOT_FOUND'),
      );
    }

    // Opcional: verificar se o usuário ainda está ativo
    // if (!user.active) {
    //   return left(ApplicationException.Unauthorized('Usuário inativo'));
    // }

    return right({
      ...user.toJSON(),
      _id: user._id.toString(),
    });
  }
}
