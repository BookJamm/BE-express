import express from "express";
import activityController from "./activityController";


const activityRouter = express.Router();

activityRouter.get('(/places/activities/:activityId(\\d+))', activityController.getActivityByActivityId);

export default activityRouter;