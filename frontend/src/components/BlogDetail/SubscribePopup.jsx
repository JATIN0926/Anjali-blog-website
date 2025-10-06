import React, { useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const SubscribePopup = ({ onClose }) => {
  const user = useSelector((state) => state.user.currentUser);
  const [socialChecked, setSocialChecked] = useState(false);
  const [diaryChecked, setDiaryChecked] = useState(false);

  const handleSubscribe = async () => {
    if (!socialChecked && !diaryChecked) {
      toast.error("Please select at least one option");
      return;
    }

    const toastId = toast.loading("Subscribing...");

    try {
      const res = await axiosInstance.post("/api/blogs/subscribe", {
        email: user.email,
        subscribeTo: {
          social: socialChecked,
          diary: diaryChecked,
        },
      });

      toast.dismiss(toastId);
      if (res.data.message === "Already subscribed") {
        toast.error("You are already subscribed!");
      } else {
        toast.success(res.data.message || "Subscribed successfully!");
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error("Subscription failed. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg flex flex-col items-start gap-3">
        {/* Replacing email input with subscription text */}
        <p
          className="w-full border border-[#303130] px-4 py-3 text-[1rem] font-medium"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <span className="text-[#0F172A]">{user.email}</span>
        </p>

        <div className="flex items-start justify-center gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 accent-[#0F172A] border border-[#303130] rounded-sm"
              checked={socialChecked}
              onChange={(e) => setSocialChecked(e.target.checked)}
            />
            <h4 className="text-[#30333B] tracking-[-3%] text-[1.1rem]">
              Social Pattern
            </h4>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 accent-[#0F172A] border border-[#303130] rounded-sm"
              checked={diaryChecked}
              onChange={(e) => setDiaryChecked(e.target.checked)}
            />
            <h4 className="text-[#30333B] tracking-[-3%] text-[1.1rem]">
              My Journal
            </h4>
          </label>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full px-8 py-2 bg-[#0F172A] text-white text-[1.2rem] cursor-pointer mt-2"
        >
          Subscribe
        </button>

        <button
          onClick={onClose}
          className="mt-3 cursor-pointer text-lg text-gray-600 w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SubscribePopup;
