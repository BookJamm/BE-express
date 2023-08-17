import pool from "../../config/database";
import placesDao from "./placesDao";
import { getRegExp } from "korean-regexp";

const getTime = () => {
  const curr = new Date();
  const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const krCurr = new Date(utc + KR_TIME_DIFF);
  return krCurr;
};

const checkOpen = (hours, krCurr) => {
  if (!hours) {
    return null;
  }

  const { startTime, endTime } = hours;
  const baseTime = `${krCurr.getFullYear()}-${krCurr.getMonth() + 1}-${krCurr.getDate()}`;
  const startTimeDate = new Date(`${baseTime} ${startTime}`);
  const endTimeDate = new Date(`${baseTime} ${endTime}`);
  const open = startTimeDate.getTime() <= krCurr.getTime() && krCurr.getTime() <= endTimeDate.getTime();

  return open;
};

const placesService = {
  searchPlaces: async (keyword, sortBy, coord, last) => {
    const connection = await pool.getConnection();

    const koreanRegExp = getRegExp(keyword).toString().slice(1, -2);

    let searchResult = await placesDao.selectPlacesByRegExp(koreanRegExp, sortBy, coord, last, connection);

    searchResult = await Promise.all(
      searchResult.map(async (place) => {
        const { road, jibun, ...rest } = place;

        const images = await placesDao.selectPlaceImages(place.placeId, connection);

        return {
          ...rest,
          images,
          address: {
            road,
            jibun,
          },
        };
      })
    );

    connection.release();

    return searchResult;
  },
  findReviews: async (placeId, last) => {
    const connection = await pool.getConnection();

    const [placeExists] = await placesDao.selectPlaceById(placeId, connection);

    if (!placeExists) {
      return { error: true };
    }

    let reviews = await placesDao.selectPlaceReviews(placeId, last, connection);
    reviews = await Promise.all(
      reviews.map(async (review) => {
        const images = await placesDao.selectReviewImages(review.reviewId, connection);
        const { userId, username, profileImage, ...rest } = review;

        return {
          ...rest,
          images,
          author: {
            userId,
            username,
            profileImage,
          },
        };
      })
    );

    connection.release();

    return {
      error: false,
      result: reviews,
    };
  },
  addReview: async (review) => {
    const connection = await pool.getConnection();

    const [placeExists] = await placesDao.selectPlaceById(review.placeId, connection);
    if (!placeExists) {
      return { error: true };
    }

    const reviewId = await placesDao.insertReview(review, connection);
    connection.release();

    return { error: false, reviewId };
  },
  getPlacesByCategory: async (category, sortBy, coord, last) => {
    const connection = await pool.getConnection();

    let searchResult = await placesDao.selectPlacesByCategory(category, sortBy, coord, last, connection);

    const curr = getTime();

    searchResult = await Promise.all(
      searchResult.map(async (place) => {
        const [hours] = await placesDao.selectPlaceHoursByDay(place.placeId, curr.getDay(), connection);
        const open = checkOpen(hours, curr);

        const images = await placesDao.selectPlaceImages(place.placeId, connection);

        const { road, jibun, ...rest } = place;

        return {
          ...rest,
          open,
          images,
          address: {
            road,
            jibun,
          },
        };
      })
    );

    connection.release();

    return searchResult;
  },
  retrieveActivitiesByPlaceId: async (placeId) => {
    try {
      const connection = await pool.getConnection(async (conn) => conn);
      const activitiesResult = await placesDao.selectActivitiesByPlaceId(connection, placeId);
      console.log(activitiesResult);
      console.log(typeof activitiesResult);
      if (Object.keys(activitiesResult).length == 0) {
        return { error: true };
      }
      connection.release();
      return {
        error: false,
        result: activitiesResult,
      };
    } catch (err) {
      return { error: true };
    }
  },
  retrieveNewsByPlaceId: async (placeId) => {
    try {
      const connection = await pool.getConnection(async (conn) => conn);
      const newsResult = await placesDao.selectNewsByPlaceId(connection, placeId);
      const placeCnt = await placesDao.checkPlace(connection, placeId);

      connection.release();

      if (placeCnt == 0) {
        return { error: true, cause: "place" };
      }
      if (Object.keys(newsResult).length == 0) {
        return { error: true, cause: "news" };
      }
      return newsResult;
    } catch (error) {
      return { error: true };
    }
  },
  retrieveBooksByPlaceId: async (placeId) => {
    try {
      const connection = await pool.getConnection(async (conn) => conn);
      const bookResult = await placesDao.selectBooksByPlaceId(connection, placeId);
      const placeCnt = await placesDao.checkPlace(connection, placeId);

      connection.release();

      if (placeCnt == 0) {
        return { error: true, cause: "place" };
      }
      if (Object.keys(bookResult).length == 0) {
        return { error: true, cause: "books" };
      }
      return bookResult;
    } catch (error) {
      return { error: true };
    }
  },

  getPlaceDetails: async (placeId, userId) => {
    const connection = await pool.getConnection();

    const [isPlaceExists] = await placesDao.selectPlaceById(placeId, connection);

    if (!isPlaceExists) {
      return { error: { name: "PlaceNotFound" } };
    }

    const [details] = await placesDao.selectPlaceDetails(placeId, connection);

    const { jibun, road, ...rest } = details;

    let [bookmarked] = await placesDao.checkPlaceBookmarked(placeId, userId, connection);
    bookmarked = bookmarked ? true : false;

    const images = await placesDao.selectPlaceImages(placeId, connection);

    const curr = getTime();
    const [hours] = await placesDao.selectPlaceHoursByDay(placeId, curr.getDay(), connection);
    const open = checkOpen(hours, curr);

    return { error: null, result: { ...rest, address: { jibun, road }, images, open, bookmarked } };
  },
};

export default placesService;
