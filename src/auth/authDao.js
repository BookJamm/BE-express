import logger from "../../config/logger";

const authDao = {
  selectThreeRandomUsers: async (connection) => {
    const sql = "select user_id \"userId\", name, email, username, profile_image \"profileImage\", username from users where disabled_at IS NULL order by rand() limit 3";
    const [queryResult] = await connection.query(sql);
    return queryResult;
  },

  insertUser: async (connection, user) => {
    try {
      const { kakao, email, password, username } = user;
      const sql = `
      INSERT INTO users (email, password, username) VALUES ("${email}", "${password}", "${username}")`;
      await connection.beginTransaction();
      const [queryResult] = await connection.query(sql);
      await connection.commit();
      return queryResult.insertId;
    } catch (error) {
      await connection.rollback();
      logger.error(error.message);
    }
  },

  selectUserByEmail: async (email, connection) => {
    const sql = `
      select user_id userId, email, password, disabled_at
      from users
      where email = '${email}'
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },

  updateUserRefreshToken: async (userId, refreshToken, connection) => {
    const sql = `UPDATE users SET refresh_token = '${refreshToken}' WHERE user_id = ${userId}`;
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(sql);

      await connection.commit();

      return result;
    } catch (error) {
      logger.error(error.message);
      return { error: true };
    }
  },

  selectRefreshToken: async (userId, connection) => {
    const sql = `
      select refresh_token refreshToken
      from users
      where user_id = ${userId}
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
};

export default authDao;
