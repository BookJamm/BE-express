import pool from "../../config/database";
import userDao from "./userDao";

const userProvider = {
  patchUsername: async (userId, username) => {
    try {
      const connection = await pool.getConnection();
      const result = await userDao.updateUsername(connection, userId, username);
      connection.release();
      if (result.error) return { error: true };
      return { changed: true };
    } catch (error) {
      console.error(error);
      return { error: true };
    }
  },

  patchPassword: async (userId, password) => {
    try {
      const connection = await pool.getConnection();
      const result = await userDao.updatePassword(connection, userId, password);
      connection.release();
      if (result.error) return { error: true };
      return { changed: true };
    } catch (error) {
      console.error(error);
      return { error: true };
    }
  },

  patchProfile: async (userId, profileImg) => {
    try {
      const connection = await pool.getConnection();
      const result = await userDao.updateProfile(connection, userId, profileImg);
      connection.release();
      if (result.error) return { error: true };
      return { changed: true };
    } catch (error) {
      console.error(error);
      return { error: true };
    }
  },

  patchDisabled: async (userId) => {
    try {
      const connection = await pool.getConnection();
      const result = await userDao.updateDisabled(connection, userId);
      connection.release();
      if (result.error) return { error: true };
      return { disabled: true };
    } catch (error) {
      console.error(error);
      return { error: true };
    }
  },

  checkFollowExists: async (userId, targetUserId) => {
    const connection = await pool.getConnection();
    const [alreadyFollowed] = await userDao.selectUserFollow(userId, targetUserId, connection);

    if (alreadyFollowed) {
      return true;
    }
    return false;
  },
};

export default userProvider;
