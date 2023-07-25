import recordsDao from "./activitiesDao";
import pool from "../../config/database";
import activitiesDao from "./activitiesDao";

const activitiesProvider = {
    retrieveActivityByActivityId: async (activityId) => {
        try{
            const connection = await pool.getConnection(async conn => conn);
            const activityResult = await activitiesDao.selectActivityByActivityId(connection, activityId);

            if(Object.keys(activityResult).length === 0) {
                return {error: true};
            }
            connection.release();
            return {
                error: false,
                result: activityResult
            };
        } catch(err) {
            return {error: true};
        }
    },
}

export default activitiesProvider;