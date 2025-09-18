import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, PUT } from 'fastify-decorators';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import z from 'zod';

@Controller({
  route: '/setting',
})
export default class {
  @PUT({
    url: '',
    // url: '/:filename',
    options: {
      onRequest: [AuthenticationMiddleware],
      schema: {
        tags: ['Setting'],
        summary: 'System Setting Update',
        description: 'System Setting Update',
      },
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    // const paramsSchema = z.object({
    //   filename: z.string(),
    // });

    const bodySchema = z.object({
      locale: z.enum(['pt-br', 'en-us']),
      fileUploadMaxSize: z.string().min(1),
      fileUploadMaxFilesPerUpload: z.string().min(1),
      fileUploadAccepted: z.string().min(1),
      fileUploadPath: z.string().min(1),
      paginationPerPage: z.string().min(1),
    });

    try {
      // const { filename } = paramsSchema.parse(request.params);
      const {
        locale,
        fileUploadMaxSize,
        fileUploadAccepted,
        fileUploadMaxFilesPerUpload,
        fileUploadPath,
        paginationPerPage,
      } = bodySchema.parse(request.body);

      // const pathname = join(process.cwd(), '_system', `${filename}.properties`);
      const pathname = join(process.cwd(), '_system', `setting.properties`);

      // Lê o arquivo atual
      let fileContent: string;
      try {
        // fileContent = readFileSync(pathname, 'utf-8');
        fileContent = await readFile(pathname, 'utf-8');
      } catch (error) {
        console.error('Error reading file:', error);
        return response.status(404).send({
          message: 'Configuration file not found',
        });
      }

      // Atualiza o LOCALE se fornecido
      if (locale) {
        fileContent = fileContent.replace(/LOCALE=.*/, `LOCALE=${locale}`);
      }

      if (fileUploadMaxSize) {
        fileContent = fileContent.replace(
          /FILE_UPLOAD_MAX_SIZE=.*/,
          `FILE_UPLOAD_MAX_SIZE=${fileUploadMaxSize}`,
        );
      }

      if (fileUploadAccepted) {
        fileContent = fileContent.replace(
          /FILE_UPLOAD_ACCEPTED=.*/,
          `FILE_UPLOAD_ACCEPTED=${fileUploadAccepted}`,
        );
      }

      if (fileUploadMaxFilesPerUpload) {
        fileContent = fileContent.replace(
          /FILE_UPLOAD_MAX_FILES_PER_UPLOAD=.*/,
          `FILE_UPLOAD_MAX_FILES_PER_UPLOAD=${fileUploadMaxFilesPerUpload}`,
        );
      }

      if (fileUploadPath) {
        fileContent = fileContent.replace(
          /FILE_UPLOAD_PATH=.*/,
          `FILE_UPLOAD_PATH=${fileUploadPath}`,
        );
      }

      if (paginationPerPage) {
        fileContent = fileContent.replace(
          /PAGINATION_PER_PAGE=.*/,
          `PAGINATION_PER_PAGE=${paginationPerPage}`,
        );
      }

      // Salva o arquivo atualizado
      // writeFileSync(pathname, fileContent);
      await writeFile(pathname, fileContent);

      // Retorna sucesso
      // return response.send({});
      return response.status(200).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).send({
          message: 'Invalid request data',
          // errors: error.errors,
        });
      }

      console.error('Error updating system settings:', error);
      return response.status(500).send({
        message: 'Internal server error while updating settings',
      });
    }
  }
}
