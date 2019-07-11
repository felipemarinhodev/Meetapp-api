import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import authMiddleware from './app/middlewares/auth';

import UserController from './app/controller/UserController';
import FileController from './app/controller/FileController';
import MeetupController from './app/controller/MeetupController';
import SessionController from './app/controller/SessionController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.post('/files', upload.single('file'), FileController.store);
routes.use(authMiddleware);
routes.get('/users', UserController.get);
routes.put('/users', UserController.update);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.get('/meetups', MeetupController.index);
routes.delete('/meetups/:id', MeetupController.delete);

export default routes;
