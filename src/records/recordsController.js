import baseResponse from "../../config/baseResponeStatus";
import { response } from "../../config/response";
import recordsProvider from "./recordsProvider";
import recordsService from "./recordsService";

const recordsController = {
  postRecord: async (req, res) => {
    try {
      const { userId, place, isbn, date, emotions, activity, contents, isNotPublic, commentNotAllowed } = req.body;
      const chkUser = await recordsProvider.checkUser(userId);
      if (!chkUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const recordData = [userId, place, isbn, date, activity, emotions, contents, isNotPublic, commentNotAllowed];
      const result = await recordsService.postRecord(recordData);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(201).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  getFriendsRecords: async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        return res.status(400).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      }
      const chkUser = await recordsProvider.checkUser(userId);
      if (!chkUser) {
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const friendId = req.query.friendId;
      if (friendId) {
        const chkUser = await recordsProvider.checkUser(friendId);
        if (!chkUser) {
          return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
        } else {
          const chkFollow = await recordsProvider.checkFollow(userId, friendId);
          if (!chkFollow) {
            return res.status(400).json(response(baseResponse.NOT_FRIEND));
          } else {
            const records = await recordsProvider.getRecordsByUserId(userId, friendId);
            if (records.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
            return res.status(200).json(response(baseResponse.SUCCESS, records));
          }
        }
      } else {
        const records = await recordsProvider.getRecordsAll(userId);
        if (records.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
        return res.status(200).json(response(baseResponse.SUCCESS, records));
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  postRecordImages: async (req, res) => {
    try {
      const recordId = req.params.recordId;
      if (!recordId || recordsProvider.checkRecord(recordId).error) return res.status(404).json(response(baseResponse.RECORDID_NOT_FOUND));
      const photos = req.files;
      const images_url = [];
      for (let i = 0; i < photos.length; i++) {
        images_url.push(photos[i].location);
      }
      const result = await recordsService.postRecordImages(recordId, images_url);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(201).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  putRecord: async (req, res) => {
    try {
      const recordId = req.params.recordId;
      if (!recordId || recordsProvider.checkRecord(recordId).error) return res.status(404).json(response(baseResponse.RECORDID_NOT_FOUND));
      const recordData = req.body;
      const result = await recordsService.putRecord(recordId, recordData);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(202).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  deleteRecordImages: async (req, res) => {
    try {
      const recordId = req.params.recordId;
      const recordImagesId = req.body.recordImagesId;
      console.log(recordImagesId);
      const checkRecord = await recordsProvider.checkRecord(recordId);
      if (!recordId || checkRecord.error) return res.status(404).json(response(baseResponse.RECORDID_NOT_FOUND));
      const result = await recordsService.deleteRecordImages(recordImagesId);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(202).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  patchComment: async (req, res) => {
    try {
      const commentId = req.params.commentId;
      const userId = req.body.userId;
      const contents = req.body.contents;
      if (!commentId || (await recordsProvider.checkComment(commentId).error) === true)
        return res.status(404).json(response(baseResponse.COMMENT_NOT_FOUND));
      if (!userId) return res.status(404).json(response(baseResponse.RECORDS_USERID_READ_FAIL));
      const chkUser = await recordsProvider.checkUser(userId);
      if (chkUser.error) {
        console.log(123);
        return res.status(404).json(response(baseResponse.USER_NOT_FOUND));
      }
      const owner = await recordsProvider.checkOwner(userId, commentId);
      if (owner.owner === false) return res.status(401).json(response(baseResponse.IS_NOT_COMMENT_OWNER));
      if (owner.error) {
        return res.status(500).json(response(baseResponse.SERVER_ERROR));
      }
      const result = await recordsService.patchComment(commentId, contents);
      if (result.error) return res.status(500).json(response(baseResponse.SERVER_ERROR));
      return res.status(202).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  deleteRecordComment: async (req, res) => {
    try {
      const recordId = req.params.recordId;
      const commentId = req.params.commentId;
      const checkRecord = await recordsProvider.checkRecord(recordId);
      const checkComment = await recordsProvider.checkComment(commentId);
      const checkRecordComment = await recordsProvider.checkRecordComment(recordId, commentId);

      console.log(checkRecordComment);
      if (!recordId || checkRecord.error)
        return res.status(404).json(response(baseResponse.RECORDID_NOT_FOUND));
      if (!commentId || checkComment.error)
        return res.status(404).json(response(baseResponse.COMMENT_NOT_FOUND));
      if (checkRecordComment.error)
        return res.status(404).json(response(baseResponse.COMMENT_NOT_FOUND))
      const result = await recordsService.deleteRecordComment(recordId, commentId);
      return res.status(202).json(response(baseResponse.SUCCESS));
    } catch (error) {
      console.error(error);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  }
};

export default recordsController;
