import baseResponse from "../../config/baseResponeStatus";
import { response } from "../../config/response";
import userService from "./userService";
import userProvider from "./userProvider";
import bcrypt from "bcrypt";

const userController = {
    getRecordsByUserId: async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (!userId) {
                return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
            }
            const isUser = await userService.checkUser(userId)
            if (!isUser) {
                return res.status(404).json(response(baseResponse.USER_NOT_FOUND))
            }
            const records = await userService.getRecordsByUserId(userId);
            if (records.error)
                return res.status(500).json(response(baseResponse.SERVER_ERROR));
            return res.status(200).json(response(baseResponse.SUCCESS, records));
        } catch (error){
            console.error(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));
        }
    },

    putUsername: async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (!userId) {
                return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
            }
            const isUser = await userService.checkUser(userId);
            if (!isUser) {
                return res.status(404).json(response(baseResponse.USER_NOT_FOUND))
            }
            const username = req.body.username;
            const result = await userProvider.putUsername(userId, username);
            if (result.error)
                return res.status(500).json(response(baseResponse.SERVER_ERROR));
            return res.status(200).json(response(baseResponse.SUCCESS, "닉네임 변경 성공"));
        } catch (error){
            console.error(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));
        }
    }, 

    putPassword: async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (!userId) {
                return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
            }
            const isUser = await userService.checkUser(userId)
            if (!isUser) {
                return res.status(404).json(response(baseResponse.USER_NOT_FOUND))
            }
            const password = await bcrypt.hash(req.body.password, 12)
            const result = await userProvider.putPassword(userId, password);
            if (result.error)
                return res.status(500).json(response(baseResponse.SERVER_ERROR));
            return res.status(200).json(response(baseResponse.SUCCESS, "비밀번호 변경 성공"));
        } catch (error){
            console.error(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));
        }
    }, 

    putProfile: async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (!userId) {
                return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
            }
            const isUser = await userService.checkUser(userId)
            if (!isUser) {
                return res.status(404).json(response(baseResponse.USER_NOT_FOUND))
            }
            const profileImg = req.files[0].path;
            const result = await userProvider.putProfile(userId, profileImg);
            if (result.error)
                return res.status(500).json(response(baseResponse.SERVER_ERROR));
            return res.status(200).json(response(baseResponse.SUCCESS, "프로필 사진 변경 성공"));
        } catch (error){
            console.error(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));
        }
    }, 

    putDisabled: async (req, res) => {
        try {
            const userId = Number(req.params.userId);
            if (!userId) {
                return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
            }
            const isUser = await userService.checkUser(userId)
            if (!isUser) {
                return res.status(404).json(response(baseResponse.USER_NOT_FOUND))
            }
            const result = await userProvider.putDisabled(userId);
            if (result.error)
                return res.status(500).json(response(baseResponse.SERVER_ERROR));
            return res.status(200).json(response(baseResponse.SUCCESS, "회원 탈퇴 성공"));
        } catch (error){
            console.error(error);
            return res.status(500).json(response(baseResponse.SERVER_ERROR));
        }
    }, 

}

export default userController;