// src/middleware/isAdmin.js

import { ApiError } from "../utils/ApiError.js";

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }

  if (!req.user.isAdmin) {
    return res.status(403).json(new ApiError(403, "Admin access only"));
  }

  next();
};

export default isAdmin;
