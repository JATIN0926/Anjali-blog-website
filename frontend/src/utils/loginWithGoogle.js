import { setShowFallbackPopup } from "../redux/slices/authUiSlice";
import axiosInstance from "./axiosInstance";

export const loginWithGoogle = (dispatch) => {
  return new Promise((resolve, reject) => {
    /* global google */
    if (!window.google) return reject("Google API not loaded");

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_FIREBASE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await axiosInstance.post("/api/users/google-onetap", {
            credential: response.credential,
          });
          resolve(res.data.data.user);
        } catch (err) {
          reject(err); // on fail
        }
      },
      cancel_on_tap_outside: false,
    });

    google.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.getDismissedReason() === "credential_returned"
      ) {
        console.warn("Google One Tap dismissed/skipped");
        if (dispatch) {
          dispatch(setShowFallbackPopup(true));
        }
      }
    });
  });
};
