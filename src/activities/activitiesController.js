
import activitiesProvider from "./activitiesProvider";
import { response } from "../../config/response";
import baseResponse from "../../config/baseResponeStatus";


const activitiesController = {
    getActivityByActivityId: async (req, res) => {
        try {
            const activityId = req.params.activityId;

            const activity = await activitiesProvider.retrieveActivityByActivityId(activityId);

            if(activity.error) {
                return res.status(400).json(response(baseResponse.ACTIVITY_ACTIVITYID_EMPTY));
            }
            return res.status(200).json(response(baseResponse.SUCCESS, {activity:activity}));
        } catch (error){
            console.log(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));
        }
    },
}

export default activitiesController;