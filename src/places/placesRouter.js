import express from "express";
import placesController from "./placesController";

const placesRouter = express.Router();

placesRouter.get("/search", placesController.searchPlaces);
placesRouter.get("/:placeId(\\d+)/reviews", placesController.getReviews);
placesRouter.get("/:placeId(\\d+)/activities", placesController.getActivities)

export default placesRouter;
