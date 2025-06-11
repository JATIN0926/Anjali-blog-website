import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const client = new OAuth2Client(process.env.FIREBASE_CLIENT_ID);

export const loginWithOneTap = async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json(new ApiError(400, "No credential provided"));

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.FIREBASE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture: photoURL, sub: uid } = payload;

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ name, email, photoURL, uid });
    }

    const token = jwt.sign(
      { id: user._id, uid: user.uid },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const { createdAt, updatedAt, __v, ...safeUser } = user.toObject();

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Signed in via One Tap",
        user: safeUser,
      })
    );
  } catch (error) {
    console.error("Google One Tap login failed", error);
    return res.status(500).json(new ApiError(500, "Login failed"));
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json(
      new ApiResponse(200, {
        message: "Logged out successfully",
      })
    );
  } catch (error) {
    console.error("Logout failed", error);
    return res.status(500).json(new ApiError(500, "Logout failed"));
  }
};
