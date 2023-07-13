import recordsDao from "./activityDao";
import pool from "../../config/database";
import activityDao from "./activityDao";

const activityProvider = {
    retrieveActivityByActivityId: async (activityId) => {
        try{
            const connection = await pool.getConnection(async conn => conn);
            const activityResult = await activityDao.selectActivityByActivityId(connection, activityId);

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

    retrieveActivitiesByPlaceId: async (placeId) => {
        try {
            const connection = await pool.getConnection(async conn => conn);
            const activitiesResult = await activityDao.selectActivitiesByPlaceId(connection, placeId);
            console.log(activitiesResult);
            console.log(typeof(activitiesResult));
            if(Object.keys(activitiesResult).length == 0) {
                return {error: true};
            }
            connection.release();
            return {
                error: false,
                result: activitiesResult
            };
        } catch (err) {
            return {error: true};
        }
    }

}

export default activityProvider;