const recordsDao = {
    selectRecordsByFriendId: async (connection, userId, friendId) => {
        const sql = `SELECT cr.record_id, cr.author, cr.created_at, cr.status, cr.date, cr.place_id, places.name, places.category, cr.isbn, cr.activities, cr.emotions, cr.contents, cr.comment_not_allowed, cr.comment_count, cr.like_count, cr.images_url, COUNT(likes.record_id) AS liked
        FROM (SELECT *, (SELECT GROUP_CONCAT(image_url separator '|') FROM record_images WHERE records.record_id = record_images.record_id) as images_url FROM records WHERE author = ${friendId}) AS cr 
        JOIN (SELECT place_id, category, name FROM places) AS places
        LEFT JOIN (SELECT record_id FROM record_likes WHERE liker = ${userId}) AS likes
        ON cr.place_id = places.place_id AND cr.record_id = likes.record_id
        WHERE cr.isNotPublic = 0 
        GROUP BY cr.record_id
        ORDER BY cr.created_at DESC`;
        try {
            const [records] = await connection.query(sql);
            return records;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    insertRecord: async (connection, recordData) => {
        const sql_record = `INSERT INTO records (author,  place_id, isbn, date, activities, emotions, contents, isNotPublic, comment_not_allowed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        try {
            await connection.beginTransaction();
            const [record_results] = await connection.query(sql_record, recordData);
            await connection.commit();
            return record_results;
        } catch (error) {
            await connection.rollback();
            console.error(error);
            return {error: true};
        }
        
    },

    selectRecordsAll: async (connection, userId) => {
        const sql = `SELECT cr.record_id, friends.user_id, cr.created_at, cr.status, cr.date, cr.place_id, places.name, places.category, cr.isbn, cr.activities, cr.emotions, cr.contents, cr.comment_not_allowed, cr.comment_count, cr.like_count, cr.images_url, COUNT(likes.record_id) AS liked
        FROM (SELECT *, (SELECT GROUP_CONCAT(image_url separator '|') FROM record_images WHERE records.record_id = record_images.record_id) as images_url FROM records) AS cr 
        JOIN (SELECT place_id, category, name FROM places) AS places 
        JOIN (SELECT followee AS user_id FROM follow WHERE follower = ${userId} UNION SELECT user_id FROM users WHERE user_id = ${userId}) AS friends
        LEFT JOIN (SELECT record_id FROM record_likes WHERE liker = ${userId}) AS likes
        ON cr.place_id = places.place_id AND cr.record_id = likes.record_id AND cr.author = friends.user_id
        WHERE cr.isNotPublic = 0
        GROUP BY cr.record_id
        ORDER BY cr.created_at DESC`;
        try {
            const [records] = await connection.query(sql);
            return records;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    checkFollow: async (connection, userId, friendId) => {
        const sql = `SELECT count(*) as c FROM follow WHERE followee = ${friendId} and follower = ${userId}`;
        try {
            const [[records]] = await connection.query(sql);
            return records.c;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    checkUser: async (connection, userId) => {
        const sql = `SELECT count(*) as c FROM users WHERE user_id = ${userId} AND disabled_at IS NULL`;
        try {
            const [[records]] = await connection.query(sql);
            return records.c;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    checkRecord: async (connection, recordId) => {
        const sql = `SELECT count(*) as c FROM records WHERE record_id = ${recordId}`;
        try {
            const [[records]] = await connection.query(sql);
            return records.c;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    insertRecordImages: async (connection, recordId, images_url) => {
        const sql_record_image = `INSERT INTO record_images (record_id, image_url) VALUES (?, ?)`;
        try {
            await connection.beginTransaction();
            for (let url of images_url) {
               await connection.query(sql_record_image, [recordId, url]);
            }
            await connection.commit();
            return {recorded: true};
        } catch (error) {
            await connection.rollback();
            console.error(error);
            return {error: true};
        }
        
    },

    updateRecord: async (connection, recordId, recordData) => {
        const sql = `UPDATE records SET ? , updated_at = NOW(6) where record_id = ${recordId}`;
        try {
            await connection.beginTransaction();
            const result = await connection.query(sql, recordData);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error(error);
            return {error: true};
        }
    },

    deleteRecordImages: async (connection, recordImagesId) => {
        const sql = `DELETE FROM record_images where id in (${recordImagesId})`;
        try {
            await connection.beginTransaction();
            const result = await connection.query(sql);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error(error);
            return {error: true};
        }
    },

    checkOwner: async (connection, userId, commentId) => {
        const sql = `SELECT count(*) as c FROM comments WHERE user_id = ${userId} and comment_id = ${commentId}`;
        try {
            const [[records]] = await connection.query(sql);
            return records.c;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    checkComment: async (connection, commentId) => {
        const sql = `SELECT count(*) as c FROM comments WHERE comment_id = ${commentId}`;
        try {
            const [[records]] = await connection.query(sql);
            return records.c;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    updateComment: async (connection, commentId, contents) => {
        const sql = `UPDATE comments SET contents = "${contents}", updated_at = NOW(6) WHERE comment_id = ${commentId}`;
        try {
            connection.beginTransaction();
            const [records] = await connection.query(sql);
            connection.commit();
            return records;
        } catch (error) {
            connection.rollback();
            console.log(error);
            return {error: true};
        }
    },

    selectRecordImagesUrl: async (connection, recordImagesId) => {
        const sql = `SELECT image_url FROM record_images WHERE id in (${recordImagesId})`;
        try {
            const [imagesUrl] = await connection.query(sql);
            return imagesUrl;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    deleteRecordComment: async (connection, recordId, commentId) => {
        const sql = `DELETE FROM comments where comment_id = ${commentId}`;
        try {
            await connection.beginTransaction();
            const result = await connection.query(sql);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            console.error(error);
            return { error:true };
        }
    },

    checkRecordComment: async (connection, recordId, commentId) => {
        const sql = `SELECT * FROM comments WHERE comment_id = ${commentId}`;
        try {
            const [[comments]] = await connection.query(sql);
            if (comments.record_id == recordId) {
                return { error:false };
            }
            else return { error:true };
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    checkCommentCnt: async (connection, recordId) => {
        const sql = `SELECT comment_count FROM records WHERE record_id = ${recordId}`;
        try {
            const [[records]] = await connection.query(sql);
            return records.comment_count;
        } catch (error) {
            console.log(error);
            return {error: true};
        }
    },

    updateCommentCnt: async (connection, recordId, newCommentCnt) => {
        const sql = `UPDATE records SET comment_count = "${newCommentCnt}" WHERE record_id = ${recordId}`;
        try {
            connection.beginTransaction();
            const [records] = await connection.query(sql);
            connection.commit();
            return records;
        } catch (error) {
            connection.rollback();
            console.log(error);
            return {error: true};
        }
    }
}

export default recordsDao;