
import activityProvider from "./activityProvider";
import { response } from "../../config/response";
import baseResponse from "../../config/baseResponeStatus";

/**
 * API No. 1
 * API Name : 활동 세부 정보 조회
 * [GET] /places/activities/{activityId}
 */
const activityController = {
    getActivityByActivityId: async (req, res) => {
        try {
            const activityId = req.params.activityId;

            const activity = await activityProvider.retrieveActivityByActivityId(activityId);

            if(activity.error) {
                return res.status(400).json(response(baseResponse.ACTIVITY_ACTIVITYID_EMPTY));
            }


            return res.status(200).json(response(baseResponse.SUCCESS, activity));
        } catch (error){
            console.log(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));


        }
    }
}

export default activityController;