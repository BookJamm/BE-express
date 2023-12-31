import baseResponse from "../../config/baseResponeStatus";
import { response } from "../../config/response";
import authProvider from "./authProvider";
import bcrypt from "bcrypt";
import authService from "./authService";
import logger from "../../config/logger";
import jwt from "../../config/jwt";

const validateEmail = (email) => {
  const emailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");

  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = new RegExp(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#%^&*()_+\-=\[\]{}|;':",./<>?~`\\])[A-Za-z\d!@#%^&*()_+\-=\[\]{}|;':",./<>?~`\\]{9,16}/
  ); // 영문자, 특수문자, 숫자 1개 이상 씩 포함하여 9자 이상 16자 이하

  return passwordRegex.test(password);
};

const authController = {
  checkEmailTaken: async (req, res) => {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json(response(baseResponse.NOT_EMAIL_EXP));
    }

    const checkResult = await authProvider.checkEmailTaken(email);

    return res.status(200).json(response(baseResponse.SUCCESS, { isEmailTaken: checkResult }));
  },

  recommendFriends: async (req, res) => {
    const friendsResult = await authProvider.recommendFriends();
    return res.status(200).json(response(baseResponse.SUCCESS, friendsResult));
  },

  signUp: async (req, res) => {
    try {
      const {
        body: { kakao, email, password, username },
      } = req;

      if (!validateEmail(email) || !validatePassword(password) || !kakao || !username || (await authProvider.checkEmailTaken(email))) {
        return res.status(400).json(response(baseResponse.INVALID_SIGNUP_REQ));
      }

      const hashedPassoword = await bcrypt.hash(password, 12);
      const newUserId = await authService.createNewUser({
        kakao,
        email,
        password: hashedPassoword,
        username,
      });

      return res.status(200).json(response(baseResponse.SUCCESS, { userId: newUserId }));
    } catch (error) {
      logger.error(error.message);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  login: async (req, res) => {
    try {
      const {
        body: { email, password },
      } = req;

      const user = await authProvider.findUserByEmail(email);

      if (!user) {
        return res.status(400).json(response(baseResponse.SIGNIN_FAILED));
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json(response(baseResponse.SIGNIN_FAILED));
      }

      // 비활성화 계정이라면
      if (user.disabled_at !== null) {
        return res.status(400).json(response(baseResponse.SIGNIN_INACTIVE_ACCOUNT));
      }

      const accessToken = await jwt.signTokenAsync({ userId: user.userId }, { expiresIn: "1h", issuer: "bookjam" });
      const refreshToken = await jwt.signTokenAsync({ userId: user.userId }, { expiresIn: "14d", issuer: "bookjam" });

      const saveResult = authProvider.saveRefresh(user.userId, refreshToken);

      if (saveResult.error) {
        return res.status(500).json(response(baseResponse.REFRESH_TOKEN_SAVE_ERROR));
      }

      const result = { accessToken, refreshToken };

      return res.status(200).json(response(baseResponse.SUCCESS, result));
    } catch (error) {
      logger.error(error.message);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },

  refresh: async (req, res) => {
    try {
      const token = jwt.extractTokenFromHeader(req);

      if (!token) {
        return res.status(400).json(response(baseResponse.TOKEN_EMPTY));
      }

      const isTokenValid = await authProvider.validateRefreshToken(token);

      if (!isTokenValid.result) {
        if (isTokenValid.name === "TokenExipredError") return res.status(401).json(response(baseResponse.REFRESH_TOKEN_EXPIRED));
        return res.status(401).json(response(baseResponse.JWT_VERIFICATION_FAILED));
      }

      const { userId } = await jwt.verifyTokenAsync(token);

      const accessToken = await jwt.signTokenAsync({ userId }, { expiresIn: "1h", issuer: "bookjam" });
      const refreshToken = await jwt.signTokenAsync({ userId }, { expiresIn: "14d", issuer: "bookjam" });

      await authProvider.saveRefresh(userId, refreshToken);

      return res.status(200).json(response(baseResponse.SUCCESS, { accessToken, refreshToken }));
    } catch (error) {
      logger.error(error.message);
      return res.status(500).json(response(baseResponse.SERVER_ERROR));
    }
  },
};

export default authController;
