import express from 'express';
import recordsController from './recordsController';
import middlewares from '../../config/middlewares';

const recordsRouter = express.Router();

recordsRouter.get('/friends', recordsController.getFriendsRecords);
recordsRouter.post('/', recordsController.postRecord);
recordsRouter.post('/:recordId(\\d+)/images', middlewares.s3Upload.array("images"), recordsController.postRecordImages);
recordsRouter.put('/:recordId(\\d+)', recordsController.putRecord);
recordsRouter.delete('/:recordId(\\d+)/images', recordsController.deleteRecordImages);
recordsRouter.patch('/comment/:commentId', recordsController.patchComment);

export default recordsRouter;
