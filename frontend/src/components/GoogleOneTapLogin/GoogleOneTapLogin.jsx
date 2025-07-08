import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { setShowFallbackPopup } from "../../redux/slices/authUiSlice";
import axiosInstance from "../../utils/axiosInstance";

const GoogleOneTapLogin = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  const didSignInRef = useRef(false);

  useEffect(() => {
    if (user) return;
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_FIREBASE_CLIENT_ID,
        callback: async (response) => {
          const loginToast = toast.loading("Signing you in...");
          try {
            const res = await axiosInstance.post("/api/users/google-onetap", {
              credential: response.credential,
            });

            dispatch(setUser(res.data.data.user));
            dispatch(setShowFallbackPopup(false));
            didSignInRef.current = true;

            toast.success("Signed in successfully!", { id: loginToast });

            console.log("User signed in:", res.data);
          } catch (error) {
            toast.error("One Tap Login failed!", { id: loginToast });
            console.error("One Tap Login failed", error);
          }
        },
        cancel_on_tap_outside: false,
      });

      google.accounts.id.prompt((notification) => {
        const dismissedReason = notification.getDismissedReason?.();

        if (
          !didSignInRef.current &&
          (notification.isNotDisplayed() || notification.isSkippedMoment())
        ) {
          console.warn("Google One Tap dismissed or skipped:", dismissedReason);
          dispatch(setShowFallbackPopup(true));
        }

        if (dismissedReason === "credential_returned") {
          console.log("Credential returned successfully");
        }
      });
    }
  }, [dispatch, user]);

  return null;
};

export default GoogleOneTapLogin;
