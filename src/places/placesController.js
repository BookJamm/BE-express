import baseResponse from "../../config/baseResponeStatus";
import { response } from "../../config/response";
import placesService from "./placesService";

const placesController = {
  searchPlaces: async (req, res) => {
    try {
      const {
        query: { keyword, sortBy = "rating", lat, lon },
      } = req;

      if (!keyword) {
        return res.status(400).json(response(baseResponse.SEARCH_KEYWORD_EMPTY));
      }

      const sortByKeyword = ["rating", "review", "distance"];

      if (!sortByKeyword.includes(sortBy)) {
        return res.status(400).json(response(baseResponse.SORT_BY_UNAVAILABLE));
      }

      if (sortBy === "distance" && !(lat && lon)) {
        return res.status(400).json(response(baseResponse.LOCATION_EMPTY));
      }

      const searchResults = await placesService.searchPlaces(keyword, sortBy, { lat, lon });

      return res.status(200).json(response(baseResponse.SUCCESS, searchResults));
    } catch (error) {
      console.log(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },
};

export default placesController;