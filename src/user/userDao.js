import logger from "../../config/logger";

const userDao = {
  selectRecordsByUserId: async (connection, userId) => {
    const sql = `SELECT cr.record_id, cr.author, cr.created_at, cr.status, cr.date, cr.place_id, places.name, places.category, cr.isbn, cr.activities, cr.emotions, cr.contents, cr.isNotPublic, cr.comment_not_allowed, cr.comment_count, cr.like_count, cr.images_url
        FROM (SELECT *, (SELECT GROUP_CONCAT(image_url separator '|') FROM record_images WHERE records.record_id = record_images.record_id) as images_url FROM records WHERE author = ${userId}) AS cr 
        JOIN (SELECT place_id, category, name FROM places) AS places
        ON cr.place_id = places.place_id
        ORDER BY cr.created_at DESC`;
    try {
      const [records] = await connection.query(sql);
      return records;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  checkUser: async (connection, userId) => {
    const sql = `SELECT count(*) as c FROM users WHERE user_id = ${userId} AND disabled_at IS NULL`;
    try {
      const [[records]] = await connection.query(sql);
      return records.c;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  updateUsername: async (connection, userId, username) => {
    const sql = `UPDATE users SET username = '${username}' WHERE user_id = ${userId}`;
    try {
      const [result] = await connection.query(sql);
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  updatePassword: async (connection, userId, password) => {
    const sql = `UPDATE users SET password = '${password}' WHERE user_id = ${userId}`;
    try {
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  updateProfile: async (connection, userId, profileImg) => {
    const sql = `UPDATE users SET profile_image = '${profileImg}' WHERE user_id = ${userId}`;
    try {
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  updateDisabled: async (connection, userId) => {
    const sql = `UPDATE users SET disabled_at = NOW(6) WHERE user_id = ${userId}`;
    try {
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  selectMypageUserOutline: async (connection, userId) => {
    const sql = `SELECT j1.user_id, j1.profile_image, j1.username, j1.review_count, count(re.record_id) as record_count
        FROM (select u.user_id, u.profile_image, u.username, COUNT(pr.review_id) as review_count FROM (SELECT user_id, profile_image, username FROM users WHERE user_id = ${userId}) as u
        LEFT JOIN (SELECT author, review_id FROM activity_reviews WHERE author = ${userId} UNION SELECT author, review_id FROM place_reviews WHERE author = ${userId}) as pr
        ON u.user_id = pr.author
        GROUP BY u.user_id) AS j1
        LEFT JOIN (SELECT author, record_id FROM records WHERE author = ${userId}) as re
        ON j1.user_id = re.author
        group by j1.user_id`;
    try {
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  selectMypageActivities: async (connection, userId) => {
    const sql = `SELECT ar.activity_id, a.title, a.total_rating, a.review_count, a.image_url FROM activity_reservations as ar
        JOIN activities as a
        ON ar.activity_id = a.activity_id
        order by a.created_at desc
        LIMIT 5`;
    try {
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  selectMypageRecords: async (connection, userId) => {
    const sql = `SELECT r.record_id, r.date, r.comment_count, r.like_count, p.name, ri.image_url FROM (select * from records WHERE author = 1) as r
        JOIN (select * from places where category = ?) as p
        ON r.place_id = p.place_id
        LEFT JOIN (select * from record_images group by record_id) as ri
        ON r.record_id = ri.record_id
        ORDER BY r.created_at desc
        limit 5`;
    try {
      const [bookStore] = await connection.query(sql, 1);
      const [playground] = await connection.query(sql, 2);
      const [library] = await connection.query(sql, 3);
      return { bookStore: bookStore, playground: playground, library: library };
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  selectMypageReviews: async (connection, userId) => {
    const sql = `SELECT r.review_id, r.visited_at, p.name, p.category, ri.image_url
        FROM (select * from place_reviews WHERE author = ${userId}) as r
        JOIN places as p
        ON r.place_id = p.place_id
        LEFT JOIN (select * from place_review_images group by review_id) as ri
        ON r.review_id = ri.review_id
        ORDER BY r.created_at desc
        limit 5`;
    try {
      const [result] = await connection.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return { error: true };
    }
  },

  insertFollow: async (userId, targetUserId, connection) => {
    const sql = `
      insert into follow(follower, followee) 
      values (${userId}, ${targetUserId})
    `;

    try {
      await connection.beginTransaction();
      const [queryResult] = await connection.query(sql);

      await connection.commit();
      return queryResult;
    } catch (error) {
      logger.error(error.message);
      await connection.rollback();
    }
  },

  selectUserFollow: async (userId, targetUserId, connection) => {
    const sql = `
      select id
      from follow
      where follower = ${userId} and followee = ${targetUserId}
      limit 1
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
};

export default userDao;
