import pool from "../../config/database";
import recordsDao from "./recordsDao";

const recordsProvider = {
    postRecord: async (recordData) => {
        try {
            const connection = await pool.getConnection();
            const record = await recordsDao.insertRecord(connection, recordData);
            connection.release();
            if (record.error)
                return {error: true}
            return {recorded: true, recordId: record.insertId};
        } catch (error) {
            return {error: true}
        }
    },

    postRecordImages: async (recordId, images_url) => {
        try {
            const connection = await pool.getConnection();
            const record = await recordsDao.insertRecordImages(connection, recordId, images_url);
            connection.release();
            if (record.error)
                return {error: true}
            return {recorded: true};
        } catch (error) {
            return {error: true}
        }
    },

    retrieveCommentsByRecordId: async (recordId) => {
        try {
            const connection = await pool.getConnection(async conn => conn);
            const commentResult = await recordsDao.selectCommentsByRecordId(connection, recordId);

            const recordCnt = await recordsDao.checkRecord(connection, recordId);
            console.log(recordCnt);
            if (recordCnt == 0) {
                return {error: true, cause:"record"};
            }

            if(Object.keys(commentResult).length == 0) {
                return {error: true, cause:"comment"};
            }
            connection.release();
            return {
                error:false,
                result:commentResult
            };
        } catch (err) {
            return { error:true };
        }
    },

    putRecord: async (recordId, recordData) => {
        try {
            const connection = await pool.getConnection();
            const result = await recordsDao.updateRecord(connection, recordId, recordData);
            connection.release();
            if (result.error)
                return {error: true}
            return {updated: true};
        } catch (error) {
            return { error:true };
        }
    },

    deleteRecordImages: async (recordId) => {
        try {
            const connection = await pool.getConnection();
            const result = await recordsDao.deleteRecordImages(connection, recordId);
            connection.release();
            if (result.error)
                return {error: true}
            return {deleted: true};
        } catch (error) {
            return { error:true };
        }
    },

    patchComment: async (commentId, contents) => {
        try {
            const connection = await pool.getConnection();
            const result = await recordsDao.updateComment(connection, commentId, contents);
            connection.release();
            if (result.error)
                return {error: true}
            return {updated: true};
        } catch (error) {
            console.log(error);
            return { error:true };
        }
    },
}

export default recordsProvider;