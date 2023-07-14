import pool from "../../config/database";
import recordsDao from "./recordsDao";
const recordsService = {
    getRecordsByUserId: async (userId) => {
        try{
            const connection = await pool.getConnection(async conn => conn);
            const recordsResult = await recordsDao.selectRecordsByUserId(connection, userId);
            connection.release();
            if (recordsResult.error)
                return {error: true}
            
            for (let i = 0; i < recordsResult.length; i++) {
                if(recordsResult[i].images_url)
                    recordsResult[i].images_url = recordsResult[i].images_url.split('|');
            }
            return recordsResult;
        }catch(err) {
            return {error: true}
        }
    },

    getRecordsAll: async (userId) => {
        try {
            const connection = await pool.getConnection(async conn => conn);
            const recordsResult = await recordsDao.selectRecordsAll(connection, userId);
            connection.release();
            if (recordsResult.error)
                return {error: true}
            for (let i = 0; i < recordsResult.length; i++) {
                if(recordsResult[i].images_url)
                    recordsResult[i].images_url = recordsResult[i].images_url.split('|');
            }
            return recordsResult;
        } catch (error) {
            console.error(error);
            return {error: true}
        }
    },

    checkFollow: async (userId, friendId) => {
        try {
            const connection = await pool.getConnection(async conn => conn);
            const chk = await recordsDao.checkFollow(connection, userId, friendId);
            connection.release();
            if (chk.error)
                return {error: true};
            return chk;
        } catch (error) {
            console.error(error);
            return {error: true};
        }
    },

    checkUser: async (userId) => {
        try {
            const connection = await pool.getConnection(async conn => conn);
            const chk = await recordsDao.checkUser(connection, userId);
            connection.release();
            if (chk.error)
                return {error: true};
            return chk;
        } catch (error) {
            console.error(error);
            return {error: true};
        }
    },
}

export default recordsService;