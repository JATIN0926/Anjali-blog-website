// src/components/GoogleFallbackPopup/GoogleFallbackPopup.jsx
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";

import { setUser } from "../../redux/slices/userSlice";
import { setShowFallbackPopup } from "../../redux/slices/authUiSlice";
import { app } from "../../../firebase";
import axiosInstance from "../../utils/axiosInstance";

const GoogleFallbackPopup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = async () => {
    const loginToast = toast.loading("Signing you in...");
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { displayName, email, photoURL, uid } = result.user;

      const res = await axiosInstance.post(
        "/api/users/google-popup",
        {
          displayName,
          email,
          photoURL,
          uid,
        },
        { withCredentials: true }
      );

      dispatch(setUser(res.data.data.user));
      dispatch(setShowFallbackPopup(false));
      toast.success("Signed in successfully!", { id: loginToast });

      // Navigate to where user was
      navigate(location.pathname);
    } catch (err) {
      console.error("Fallback Sign-in failed:", err);
      toast.error("Google sign-in failed!", { id: loginToast });
    }
  };

  const handleClose = () => {
    dispatch(setShowFallbackPopup(false));
  };

  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[9999]">
      <div className=" relative bg-white rounded-lg px-10 py-12 shadow-2xl flex flex-col items-center gap-5 animate-fadeIn border border-[#E7E6E6]">
        {/* Close icon */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition cursor-pointer"
        >
          <img src="/icons/CloseIcon.svg" alt="Close" className="w-5 h-5" />
          {/* Replace /icons/close.svg with your own close icon path */}
        </button>
        <button
          onClick={handleSignIn}
          className="flex items-center gap-3 px-6 py-3 bg-[#0F172A] text-white text-base font-medium rounded-md shadow-md transition cursor-pointer"
        >
          Sign in with Google
          <img src="/icons/GoogleLogo.svg" alt="Google" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default GoogleFallbackPopup;
