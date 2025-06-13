import React from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logoutUser, setUser } from "../../../redux/slices/userSlice";
import { loginWithGoogle } from "../../../utils/loginWithGoogle";
import toast from "react-hot-toast";

const Footer = () => {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const handleAuthClick = async () => {
    if (user) {
      // User is signed in, so sign out
      const logoutToast = toast.loading("Signing you out...");
      try {
        await axios.post("/api/users/logout", {}, { withCredentials: true });
        dispatch(logoutUser());
        toast.success("Signed out successfully!", { id: logoutToast });
      } catch (err) {
        toast.error("Logout failed. Please try again.", { id: logoutToast });
        console.error("Logout failed", err);
      }
    } else {
      const loginToast = toast.loading("Signing you in...");
      try {
        const userData = await loginWithGoogle();
        if (userData) {
          dispatch(setUser(userData));
          toast.success("Signed in successfully!", { id: loginToast });
        } else {
          toast.error("Login failed. Please try again.", { id: loginToast });
        }
      } catch (err) {
        toast.error("Login failed. Please try again.", { id: loginToast });
        console.error("Login failed", err);
      }
    }
  };

  return (
    <div
      className="w-full flex items-start justify-between border-t-[1px] border-t-[#303130] py-4 pb-20"
      style={{ fontFamily: "SometypeMono Regular, monospace" }}
    >
      {/* Left Section */}
      <div className="w-[30%] h-[25rem] flex flex-col items-start justify-between gap-4">
        <div className="w-full flex flex-col items-start gap-3">
          <input
            type="text"
            className="email_input w-full  border border-[#303130] px-4 py-3 placeholder:text-[#A6A6A6] placeholder:text-[1rem] placeholder:font-medium"
            placeholder="Stay in the loop – enter your email"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
          <div className="flex items-start justify-center gap-5">
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#0F172A] border border-[#303130] rounded-sm"
              />

              <h4 className="text-[#30333B] tracking-[-3%] text-[1.1rem]">
                Social Pattern
              </h4>
            </div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#0F172A] border border-[#303130] rounded-sm"
              />
              <h4 className="text-[#30333B] tracking-[-3%] text-[1.1rem]">
                My Journal
              </h4>
            </div>
          </div>
          <button className="w-full px-8 py-2 bg-[#0F172A] text-white text-[1.2rem] cursor-pointer mt-2">
            Subscribe
          </button>
        </div>
        <div className="flex flex-col items-start ">
          <p className="text-[0.75rem] text-[#201F1F]">Anjali Chaudhary</p>
          <p className="text-[0.75rem] text-[#201F1F]">Copyright © 2025</p>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-[30%] flex gap-4">
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col gap-1">
            <a
              href={user?.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#201F1F] w-max text-[0.8rem] tracking-[-0.24px] cursor-pointer"
            >
              Twitter
            </a>
            <a
              href={user?.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#201F1F] w-max text-[0.8rem] tracking-[-0.24px] cursor-pointer"
            >
              Instagram
            </a>
            <a
              href={user?.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#201F1F] w-max text-[0.8rem] tracking-[-0.24px] cursor-pointer"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${user?.email}`}
              className="underline text-[#201F1F] w-max text-[0.8rem] tracking-[-0.24px] cursor-pointer"
            >
              Email me
            </a>
          </div>

          {user?.isAdmin ? (
            <button
              className="bg-[#DEDEDE] px-4 py-2 rounded-xl text-[0.9rem] cursor-pointer"
              onClick={handleAuthClick}
            >
              Signout
            </button>
          ) : (
            <button
              className="bg-[#DEDEDE] px-4 py-2 rounded-xl text-[0.9rem] cursor-pointer"
              onClick={handleAuthClick}
            >
              Sign in
            </button>
          )}
        </div>
        <div className="w-[70%] self-start">
          <img
            src="/images/footer_img.png"
            alt=""
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
