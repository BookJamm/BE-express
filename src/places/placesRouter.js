import express from "express";
import placesController from "./placesController";
import middlewares from "../../config/middlewares";

const placesRouter = express.Router();

placesRouter.get("/", placesController.getPlaces);
placesRouter.get("/search", placesController.searchPlaces);
placesRouter.get("/:placeId(\\d+)/reviews", placesController.getReviews);
placesRouter.get("/:placeId(\\d+)/activities", placesController.getActivities);
placesRouter.get("/:placeId(\\d+)/news", placesController.getNews);
placesRouter.get("/:placeId(\\d+)/books", placesController.getBooks);
placesRouter.get("/:placeId(\\d+)", placesController.getPlaceDetails);

placesRouter.post("/:placeId(\\d+)/reviews", placesController.postReview);
placesRouter.post("/:placeId(\\d+)/bookmarks", placesController.postBookmark);
placesRouter.delete("/:placeId(\\d+)/bookmarks", placesController.deleteBookmark);

export default placesRouter;
