import { Router } from 'express';

import UserController from './app/controller/UserController';

const routes = new Router();

routes.get('/users', UserController.get);

export default routes;
