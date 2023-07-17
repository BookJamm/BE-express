import express from "express";
import activityController from "./activityController";


const activityRouter = express.Router();

activityRouter.get('/:activityId(\\d+)', activityController.getActivityByActivityId);

export default activityRouter;