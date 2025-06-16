import React, { useEffect, useState } from "react";
import ViewCard from "./ViewCard/ViewCard";
import toast from "react-hot-toast";
import "./ViewStories.css";
import PlanCard from "./PlanCard/PlanCard";
import axiosInstance from "../../utils/axiosInstance";
const ViewStories = () => {
  const [activeTab, setActiveTab] = useState("Diary");
  const [blogStatus, setBlogStatus] = useState("Published");
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [plans, setPlans] = useState([]);

  // Add New Plan
  const handleAddPlan = async () => {
    if (!newPlanTitle.trim()) return;

    const toastId = toast.loading("Adding plan...");
    try {
      const res = await axiosInstance.post("/api/plans/create", {
        title: newPlanTitle,
        type: activeTab,
      });
      setPlans((prev) => [...prev, res.data.data]);
      setNewPlanTitle("");
      setIsAddingPlan(false);
      toast.success("Plan added successfully!", { id: toastId });
    } catch (err) {
      console.error("Error adding plan:", err);
      toast.error("Failed to add plan", { id: toastId });
    }
  };

  // Cancel Add/Edit
  const handleCancelPlan = () => {
    setIsAddingPlan(false);
    setNewPlanTitle("");
    setEditingPlanId(null);
  };

  const handleUpdatePlan = async () => {
    if (!newPlanTitle.trim()) return;

    const toastId = toast.loading("Updating plan...");
    try {
      const res = await axiosInstance.put(`/api/plans/${editingPlanId}`, {
        title: newPlanTitle,
      });
      setPlans((prev) =>
        prev.map((plan) => (plan._id === editingPlanId ? res.data.data : plan))
      );
      setNewPlanTitle("");
      setIsAddingPlan(false);
      setEditingPlanId(null);
      toast.success("Plan updated successfully!", { id: toastId });
    } catch (err) {
      console.error("Error updating plan:", err);
      toast.error("Failed to update plan", { id: toastId });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (blogStatus === "Plan to Publish") {
          const res = await axiosInstance.get(`/api/plans/all`, {
            params: { type: activeTab },
          });

          setPlans(res.data.data || []);
        } else {
          const res = await axiosInstance.get(`/api/blogs/status-type`, {
            params: {
              status: blogStatus,
              type: activeTab,
            },
          });
          setBlogs(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [blogStatus, activeTab]);

  return (
    <div className="w-full p-4">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
      <div
        className="w-full flex items-center justify-between mt-4"
        style={{ fontFamily: "SometypeMono Regular, monospace" }}
      >
        <h1 className="text-[#201F1F]">Anjali Chaudhary</h1>
        <img
          src="/icons/notification.svg"
          alt="Notification"
          className="w-6 h-6 object-cover cursor-pointer"
        />
      </div>

      <div className="w-[60%] justify-self-center pt-16 flex flex-col gap-10 relative z-0">
        <h1
          className="text-[3.3rem] font-semibold font-serif text-black"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          View Stories
        </h1>

        {/* Status Tabs */}
        <div className="w-full flex items-center justify-between border-b-[0.79px] border-b-[#E7EAEE]">
          <div className="flex items-center justify-center gap-7">
            {["Published", "Draft"].map((status) => (
              <h3
                key={status}
                className={`text-base text-[#201F1F] cursor-pointer hover:underline transition-all ${
                  blogStatus === status ? "underline font-semibold" : ""
                }`}
                style={{ fontFamily: "Inter, sans-serif " }}
                onClick={() => setBlogStatus(status)}
              >
                {status}
              </h3>
            ))}

            <h3
              className={`text-base text-[#201F1F] cursor-pointer hover:underline transition-all ${
                blogStatus === "Plan to Publish"
                  ? "underline font-semibold"
                  : ""
              }`}
              style={{ fontFamily: "Inter, sans-serif " }}
              onClick={() => setBlogStatus("Plan to Publish")}
            >
              Plan to Publish
            </h3>
          </div>

          {/* Toggle Switch */}
          <div className="relative flex bg-[#E6E6E6] rounded-xl p-2 w-40">
            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[48%] bg-white rounded-xl transition-all duration-300 flex items-center justify-center ${
                activeTab === "Diary" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <span className="text-black text-sm font-medium">
                {activeTab}
              </span>
            </div>

            {/* Type Tabs */}
            <button
              className={`flex-1 z-10 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                activeTab === "Diary" ? "text-transparent" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Diary")}
            >
              Diary
            </button>

            <button
              className={`flex-1 z-10 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                activeTab === "Article" ? "text-transparent" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Article")}
            >
              Article
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col gap-6 transition-all duration-300 ease-in-out">
          {blogStatus === "Plan to Publish" ? (
            plans.length > 0 ? (
              plans.map((plan, index) => (
                <div
                  key={plan._id}
                  className="transition-all duration-500 ease-in-out opacity-0 translate-y-5 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <PlanCard
                    title={plan.title}
                    id={plan._id}
                    isEditing={editingPlanId === plan._id}
                    onStartEdit={(id) => {
                      setEditingPlanId(id);
                    }}
                    onCancelEdit={() => {
                      setEditingPlanId(null);
                    }}
                    onSaveEdit={async (id, updatedTitle) => {
                      if (!updatedTitle.trim()) return;
                      const toastId = toast.loading("Updating plan...");
                      try {
                        const res = await axiosInstance.put(`/api/plans/${id}`, {
                          title: updatedTitle,
                        });
                        setPlans((prev) =>
                          prev.map((plan) =>
                            plan._id === id ? res.data.data : plan
                          )
                        );
                        setEditingPlanId(null);
                        toast.success("Plan updated successfully!", {
                          id: toastId,
                        });
                      } catch (err) {
                        console.error("Error updating plan:", err);
                        toast.error("Failed to update plan", { id: toastId });
                      }
                    }}
                    onEditSuccess={(action, id) => {
                      if (action === "delete") {
                        setPlans((prev) => prev.filter((p) => p._id !== id));
                      }
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center text-lg italic opacity-0 translate-y-5 animate-fade-in">
                No plans yet. Add a future blog idea!
              </div>
            )
          ) : blogs.filter((blog) => blog.type === activeTab).length > 0 ? (
            blogs
              .filter((blog) => blog.type === activeTab)
              .map((blog, index) => (
                <div
                  key={blog._id}
                  className="transition-all duration-500 ease-in-out opacity-0 translate-y-5 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <ViewCard
                    title={blog.title}
                    date={new Date(blog.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    id={blog._id}
                  />
                </div>
              ))
          ) : (
            <div className="text-gray-500 text-center text-lg italic opacity-0 translate-y-5 animate-fade-in flex flex-col items-center gap-2">
              <span>
                No {blogStatus.toLowerCase()} {activeTab.toLowerCase()}s yet.
              </span>
              <a
                href="/create-blog"
                className="text-blue-600 underline text-base transition-opacity duration-300 hover:opacity-80"
              >
                Create one →
              </a>
            </div>
          )}
          {blogStatus === "Plan to Publish" && (
            <div className="flex flex-col gap-4 pt-6">
              {isAddingPlan ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newPlanTitle}
                    onChange={(e) => setNewPlanTitle(e.target.value)}
                    placeholder="Enter plan title..."
                    className="px-3 py-2 rounded-md border border-gray-300 w-full"
                  />
                  <button
                    onClick={editingPlanId ? handleUpdatePlan : handleAddPlan}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelPlan}
                    className="text-gray-500 hover:text-black text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingPlan(true)}
                  className="text-sm text-white bg-[#201F1F] px-4 py-2 rounded-md w-max cursor-pointer"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  + Add Plan
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStories;
