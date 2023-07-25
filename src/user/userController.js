import baseResponse from "../../config/baseResponeStatus";
import { response } from "../../config/response";
import userService from "./userService";
import userProvider from "./userProvider";
import bcrypt from "bcrypt";
import logger from "../../config/logger";

const userController = {
  getRecordsByUserId: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const isUser = await userService.checkUser(userId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const records = await userService.getRecordsByUserId(userId);
      if (records.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(200).json(response(baseResponse.SUCCESS, records));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  patchUsername: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const isUser = await userService.checkUser(userId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const username = req.body.username;
      const result = await userProvider.patchUsername(userId, username);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(200).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  patchPassword: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const isUser = await userService.checkUser(userId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const password = await bcrypt.hash(req.body.password, 12);
      const result = await userProvider.patchPassword(userId, password);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(200).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  patchProfile: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const isUser = await userService.checkUser(userId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }

      const profileImg = req.files[0].path;
      const result = await userProvider.patchProfile(userId, profileImg);

      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(200).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  patchDisabled: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const isUser = await userService.checkUser(userId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const result = await userProvider.patchDisabled(userId);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(200).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  getMyPage: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const isUser = await userService.checkUser(userId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const result = await userService.getMyPage(userId);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(200).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  postFollowing: async (req, res) => {
    try {
      const { userId = 1 } = req; // TODO: jwt 추가되면 수정 할 것
      const {
        body: { targetUserId },
      } = req;

      const isUser = await userService.checkUser(targetUserId);
      if (!isUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }

      const alreadyFollowed = await userProvider.checkFollowExists(userId, targetUserId);
      if (alreadyFollowed) {
        return res.status(400).json(response(baseResponse.ALREADY_FOLLOWED));
      }

      const result = await userService.addFollower(userId, targetUserId);
      logger.info(`Follow Result: ${result}`);

      return res.status(201).json(response(baseResponse.SUCCESS, { following: true }));
    } catch (error) {
      logger.error(error.message);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },
};

export default userController;
