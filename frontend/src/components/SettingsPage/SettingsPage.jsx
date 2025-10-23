import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setUser } from "../../redux/slices/userSlice";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const [editingField, setEditingField] = useState(null);
  const [inputValues, setInputValues] = useState({
    email: user?.contact_email || "",
    linkedin: user?.linkedin || "",
    medium: user?.medium || "",
    instagram: user?.instagram || "",
  });
  const [activeTab, setActiveTab] = useState("contacts");

  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/api/notifications/latest");
        console.log("res", res.data);
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);

  const handleSave = async (field) => {
    if (!inputValues[field] || inputValues[field] === user?.[field]) {
      setEditingField(null);
      return;
    }

    let toastId;
    try {
      toastId = toast.loading("Updating...");
      const res = await axiosInstance.patch(
        "/api/users/socials",
        { [field]: inputValues[field] },
        { withCredentials: true }
      );
      dispatch(setUser(res.data.user));
      toast.success("Updated successfully!", { id: toastId });
      setEditingField(null);
    } catch (err) {
      toast.error("Update failed", { id: toastId });
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
        <h1
          className="text-[#201F1F] hover:underline cursor-pointer"
          onClick={() => navigate("/")}
        >
          Anjali Chaudhary
        </h1>
      </div>

      <div className="w-[60%] justify-self-center pt-16 flex flex-col gap-16">
        <h1
          className="text-5xl font-semibold font-serif text-black"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          Settings
        </h1>

        <div className="w-full border-b border-gray-300 flex gap-8 text-lg">
          <button
            className={`pb-2 cursor-pointer ${
              activeTab === "contacts"
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("contacts")}
          >
            My Contacts
          </button>
          <button
            className={`pb-2 cursor-pointer ${
              activeTab === "notifications"
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        {activeTab === "contacts" ? (
          <div className="flex flex-col gap-10 text-[#201F1F]">
            {renderField("Email Address", "contact_email")}
            {renderField("LinkedIn", "linkedin")}
            {renderField("Medium", "medium")}
            {renderField("Instagram", "instagram")}
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-4">
            {notifications.length === 0 ? (
              <p className="text-gray-600 text-lg">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className="flex items-start gap-4 border-b pb-4"
                >
                  <img
                    src={notif.user?.photoURL || "/icons/user.png"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[1rem] font-medium text-[#201F1F]">
                      {notif.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
