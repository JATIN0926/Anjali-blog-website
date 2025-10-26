import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, setUser } from "../../../redux/slices/userSlice";
import { loginWithGoogle } from "../../../utils/loginWithGoogle";
import toast from "react-hot-toast";
import { setShowFallbackPopup } from "../../../redux/slices/authUiSlice";
import axiosInstance from "../../../utils/axiosInstance";
import "./Footer.css";

const Footer = () => {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [social, setSocial] = useState(false);
  const [journal, setJournal] = useState(false);

  const handleAuthClick = async () => {
    if (user) {
      // User is signed in, so sign out
      const logoutToast = toast.loading("Signing you out...");
      try {
        await axiosInstance.post(
          "/api/users/logout",
          {},
          { withCredentials: true }
        );
        dispatch(logoutUser());
        toast.success("Signed out successfully!", { id: logoutToast });
      } catch (err) {
        toast.error("Logout failed. Please try again.", { id: logoutToast });
        console.error("Logout failed", err);
      }
    } else {
      // const loginToast = toast.loading("Signing you in...");
      try {
        const userData = await loginWithGoogle(dispatch);
        if (userData) {
          dispatch(setUser(userData));
          console.log("inside if");
          toast.success("Signed in successfully!");
        } else {
          console.log("inside else");
          dispatch(setShowFallbackPopup(true));
        }
      } catch (err) {
        console.log("inside catch");
        dispatch(setShowFallbackPopup(true));
        toast.error("Login failed. Please try again.");
        console.error("Login failed. Please try again Now !", err);
      }
    }
  };

  const handleSubscribe = async () => {
    const finalEmail = user ? user.email : email;

    if (!finalEmail) {
      toast.error("Please enter your email!");
      return;
    }
    if (!social && !journal) {
      toast.error("Please select at least one category!");
      return;
    }

    const loadingToast = toast.loading("Subscribing...");

    try {
      const res = await axiosInstance.post("/api/blogs/subscribe", {
        email: finalEmail,
        subscribeTo: {
          social,
          diary: journal,
        },
      });

      if (res.data.message === "Already subscribed") {
        toast.error("You are already subscribed!", { id: loadingToast });
      } else {
        toast.success(res.data.message || "Subscribed successfully!", {
          id: loadingToast,
        });
      }

      if (!user) setEmail("");
      setSocial(false);
      setJournal(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Subscription failed. Try again!",
        { id: loadingToast }
      );
    }
  };

  return (
    <div
      className="w-full border-t-[1px] border-t-[#303130] py-4 pb-6 mt-16 main_container"
      style={{ fontFamily: "SometypeMono Regular, monospace" }}
    >
      {/* Left Section */}
      <div className="w-[30%] h-[25rem] flex flex-col items-start justify-between gap-4 left">
        <div className="w-full flex flex-col items-start gap-3">
          {user ? (
            <p className="w-full border border-[#303130] px-4 py-2 text-[0.9rem] text-[#303130]">
              <span className="font-medium">{user.email}</span>
            </p>
          ) : (
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email_input w-full border border-[#303130] px-4 py-3 placeholder:text-[#A6A6A6] placeholder:text-[1rem] placeholder:font-medium"
              placeholder="Stay in the loop – enter your email"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          )}

          <div className="flex items-start justify-center gap-5 checkbox_container">
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                checked={social}
                onChange={() => setSocial(!social)}
                className="w-5 h-5 accent-[#0F172A] border border-[#303130] rounded-sm"
              />
              <h4 className="text-[#30333B] tracking-[-3%] text-[1.1rem] social_pattern_footer">
                Social Pattern
              </h4>
            </div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                checked={journal}
                onChange={() => setJournal(!journal)}
                className="w-5 h-5 accent-[#0F172A] border border-[#303130] rounded-sm"
              />
              <h4 className="text-[#30333B] tracking-[-3%] text-[1.1rem] my_journal_footer">
                My Journal
              </h4>
            </div>
          </div>
          <button
            onClick={handleSubscribe}
            className="w-full px-8 py-2 bg-[#0F172A] text-white text-[1.2rem] cursor-pointer mt-2 subscribe"
          >
            Subscribe
          </button>
        </div>
        <div className="flex flex-col items-start copyright-desktop ">
          <p className="text-[0.75rem] text-[#201F1F]">Anjali Chaudhary</p>
          <p className="text-[0.75rem] text-[#201F1F]">Copyright © 2025</p>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-[30%] flex gap-4 h-[10.5rem] right">
        <div className=" h-full flex flex-col items-center justify-between">
          <div className="flex flex-col gap-1 links_container">
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

          {user ? (
            <button
              className="bg-[#DEDEDE] px-4 py-2 rounded-xl text-[0.9rem] cursor-pointer signout"
              onClick={handleAuthClick}
            >
              Signout
            </button>
          ) : (
            <button
              className="bg-[#DEDEDE] px-4 py-2 rounded-xl text-[0.9rem] cursor-pointer signin"
              onClick={handleAuthClick}
            >
              Sign in
            </button>
          )}
        </div>
        <div className="w-[70%] h-full self-start right_img">
          <img
            src="/images/footer_img.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col items-start copyright-mobile mt-6">
        <p className="text-[0.75rem] text-[#201F1F]">Anjali Chaudhary</p>
        <p className="text-[0.75rem] text-[#201F1F]">Copyright © 2025</p>
      </div>
    </div>
  );
};

export default Footer;
