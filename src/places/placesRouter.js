import express from "express";
import placesController from "./placesController";

const placesRouter = express.Router();

placesRouter.get("/search", placesController.searchPlaces);
placesRouter.get("/:placeId(\\d+)/reviews", placesController.getReviews);
placesRouter.post("/:placeId(\\d+)/reviews", placesController.postReview);

export default placesRouter;
