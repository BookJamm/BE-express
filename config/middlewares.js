import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "./s3";
import morgan from "morgan";
import logger from "./logger";
import baseResponse from "./baseResponeStatus";
import jwt from "jsonwebtoken";
require("dotenv").config();

const format = () => {
  const result = process.env.NODE_ENV === "production" ? "combined" : "dev";
  return result;
};

// 로그 작성을 위한 Output stream옵션.
const stream = {
  write: (message) => {
    logger.info(message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ""));
  },
};

const skip = (_, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.ststusCode < 400;
  }
  return false;
};

const multerS3Uploader = multerS3({
  s3,
  bucket: "bookjam-bucket",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

const extractTokenFromHeader = (req) => {
  const [type, token] = req.headers.authorization?.split(" ") ?? [];

  return type === "Bearer" ? token : null;
};

const verifyTokenAsync = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
      if (error) reject(error);
      resolve(payload);
    });
  });

const middlewares = {
  s3Upload: multer({
    dest: "uploads/images/",
    limits: {
      fieldSize: 5 * 1024 * 1024,
    },
    storage: multerS3Uploader,
  }),

  logger: morgan(format(), { stream, skip }),

  authCheck: async (req, res, next) => {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json(baseResponse.JWT_TOKEN_EMPTY);
    }

    try {
      const payload = await verifyTokenAsync(token);
      req.user = payload;
      next();
    } catch (error) {
      logger.error(error.message);
      return res.status(401).json(baseResponse.JWT_VERIFICATION_FAILED);
    }
  },
};

export default middlewares;
