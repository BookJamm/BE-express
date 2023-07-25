import pool from "../../config/database";
import userDao from "./userDao";
const userService = {
  getRecordsByUserId: async (userId) => {
    try {
      const connection = await pool.getConnection(async (conn) => conn);
      const recordsResult = await userDao.selectRecordsByUserId(connection, userId);
      connection.release();
      if (recordsResult.error) return { error: true };

      for (let i = 0; i < recordsResult.length; i++) {
        if (recordsResult[i].images_url) recordsResult[i].images_url = recordsResult[i].images_url.split("|");
      }
      return recordsResult;
    } catch (err) {
      return { error: true };
    }
  },

  checkUser: async (userId) => {
    try {
      const connection = await pool.getConnection(async (conn) => conn);
      const chk = await userDao.checkUser(connection, userId);
      connection.release();
      if (chk.error) return 0;
      return chk;
    } catch (error) {
      console.error(error);
      return 0;
    }
  },

  getMyPage: async (userId) => {
    try {
      const connection = await pool.getConnection(async (conn) => conn);
      const userOutline = await userDao.selectMypageUserOutline(connection, userId);
      const activities = await userDao.selectMypageActivities(connection, userId);
      const records = await userDao.selectMypageRecords(connection, userId);
      const reviews = await userDao.selectMypageReviews(connection, userId);
      connection.release();
      if (userOutline.error || activities.error || records.error || reviews.error) return { error: true };
      return { userOutline: userOutline, activities: activities, records: records, reviews: reviews };
    } catch (error) {
      console.error(error);
      return { error: true };
    }
  },

  addFollower: async (userId, targetUserId) => {
    const connection = await pool.getConnection();

    const result = await userDao.insertFollow(userId, targetUserId, connection);

    connection.release();

    return result;
  },
};

export default userService;
