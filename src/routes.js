import { Router } from 'express';

import UserController from './app/controller/UserController';

const routes = new Router();

routes.get('/users', UserController.get);
routes.put('/users', UserController.update);
routes.post('/users', UserController.store);

export default routes;
