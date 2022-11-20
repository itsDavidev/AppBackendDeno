import { config as initDotenvConfig } from 'npm:dotenv@16.0.3';

import Logger from 'https://deno.land/x/logger@v1.0.2/logger.ts';
import { Application, isHttpError } from '$oak/mod.ts';
import { router } from '@infrastructure/clients/router.ts';
import '@infrastructure/routes/user.routes.ts';
import { errorMiddleware } from './infrastructure/middlewares/error.middleware.ts';

export const logger: Logger = new Logger();
export const app: Application = new Application();

initDotenvConfig();

const abortController: AbortController = new AbortController();

async function $bootstrap(abortController: AbortController): Promise<void> {
	app.use(errorMiddleware);
	app.use(router.routes());
	app.use(router.allowedMethods());

	try {
		app.addEventListener('listen', () => {
			logger.info('Server started on port 8080');
		});

		await app.listen({
			port: 8080,
			signal: abortController.signal,
		});
	} catch (err) {
		app.removeEventListener('listen', () => {
			logger.error(err.message);
			abortController.abort();
		});
	}
}

$bootstrap(abortController);
