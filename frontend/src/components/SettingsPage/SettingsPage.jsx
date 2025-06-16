import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setUser } from "../../redux/slices/userSlice";
import axiosInstance from "../../utils/axiosInstance";

const SettingsPage = () => {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const [editingField, setEditingField] = useState(null);
  const [inputValues, setInputValues] = useState({
    email: user?.email || "",
    linkedin: user?.linkedin || "",
    medium: user?.medium || "",
    instagram: user?.instagram || "",
  });

  const handleSave = async (field) => {
    if (!inputValues[field] || inputValues[field] === user?.[field]) {
      setEditingField(null);
      return;
    }

    try {
      const toastId = toast.loading("Updating...");
      const res = await axiosInstance.patch(
        "/api/users/socials",
        { [field]: inputValues[field] },
        { withCredentials: true }
      );
      dispatch(setUser(res.data.user));
      toast.success("Updated successfully!", { id: toastId });
      setEditingField(null);
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    }
  };

  const renderField = (label, fieldKey) => (
    <div className="flex items-center justify-between w-full" key={fieldKey}>
      <h1 className="text-[1.4rem] font-medium">{label}</h1>
      {editingField === fieldKey ? (
        <input
          className="text-[1.2rem] px-2 py-1 border border-gray-300 rounded"
          value={inputValues[fieldKey]}
          onChange={(e) =>
            setInputValues({ ...inputValues, [fieldKey]: e.target.value })
          }
          onBlur={() => handleSave(fieldKey)}
          onKeyDown={(e) => e.key === "Enter" && handleSave(fieldKey)}
          autoFocus
        />
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-[1.2rem]">{user?.[fieldKey] || "Not Set"}</p>
          {user?.isAdmin && (
            <img
              src="/icons/edit.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setEditingField(fieldKey)}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full p-4">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
      <div
        className="w-full flex items-center justify-between mt-4"
        style={{ fontFamily: "SometypeMono Regular, monospace" }}
      >
        <h1 className="text-[#201F1F]">Anjali Chaudhary</h1>
      </div>

      <div className="w-[60%] justify-self-center pt-16 flex flex-col gap-16">
        <h1
          className="text-5xl font-semibold font-serif text-black"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          Settings
        </h1>

        <div className="flex flex-col gap-10 text-[#201F1F]">
          {renderField("Email Address", "email")}
          {renderField("LinkedIn", "linkedin")}
          {renderField("Medium", "medium")}
          {renderField("Instagram", "instagram")}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
