// src/components/GoogleOneTapLogin.jsx
import { useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";

const GoogleOneTapLogin = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_FIREBASE_CLIENT_ID,
        callback: async (response) => {
          const loginToast = toast.loading("Signing you in...");
          try {
            const res = await axios.post("/api/users/google-onetap", {
              credential: response.credential,
            });

            dispatch(setUser(res.data.data.user));

            toast.success("Signed in successfully!", { id: loginToast });

            console.log("User signed in:", res.data);
          } catch (error) {
            toast.error("One Tap Login failed!", { id: loginToast });
            console.error("One Tap Login failed", error);
          }
        },
        cancel_on_tap_outside: false,
      });

      google.accounts.id.prompt();
    }
  }, [dispatch]);

  return null;
};

export default GoogleOneTapLogin;
