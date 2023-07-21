import express from 'express';
import recordsController from './recordsController';
import middlewares from '../../config/middlewares';

const recordsRouter = express.Router();

recordsRouter.get('/:userId(\\d+)/friends', recordsController.getFriendsRecords);
recordsRouter.post('/', recordsController.postRecord);
recordsRouter.post('/:recordId(\\d+)/images', middlewares.s3Upload.array("images"), recordsController.postRecordImages);


export default recordsRouter;
