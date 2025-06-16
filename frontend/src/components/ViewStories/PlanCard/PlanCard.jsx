import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/axiosInstance";

const PlanCard = ({ title, id, onEditSuccess, isEditing, onStartEdit, onCancelEdit, onSaveEdit }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleDelete = async () => {
    setShowConfirmModal(false);
    const toastId = toast.loading("Deleting plan...");
    try {
      await axiosInstance.delete(`/api/plans/${id}`);
      toast.success("Plan deleted successfully", { id: toastId });
      onEditSuccess?.("delete", id);
    } catch (error) {
      toast.error("Failed to delete plan", { id: toastId });
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <div className="w-full py-4 border-b-[#E7EAEE] border-b flex flex-col items-start justify-center gap-1">
        {isEditing ? (
          <div className="flex w-full items-center gap-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 w-full"
            />
            <button
              onClick={() => onSaveEdit(id, editTitle)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="text-gray-500 hover:text-black text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h1
              className="text-[2.1rem] tracking-[-0.84px] font-medium"
              style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
            >
              {title}
            </h1>
            <div className="w-full flex items-center justify-between">
              <div></div>
              <div className="flex items-center justify-center gap-5">
                <img
                  src="/icons/edit.svg"
                  alt="Edit"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => onStartEdit(id)}
                />
                <img
                  src="/icons/delete.svg"
                  alt="Delete"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setShowConfirmModal(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-[#504E4F] rounded-md p-6 w-[90%] max-w-md text-center shadow-lg">
            <p className="text-[#201F1F] text-xl mb-6">
              Are you sure you want to delete this plan?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-[#303130] text-white px-6 py-2 rounded hover:bg-[#201F1F] cursor-pointer"
                onClick={handleDelete}
              >
                Yes Delete
              </button>
              <button
                className="border border-[#504E4F] text-[#201F1F] px-6 py-2 rounded hover:bg-[#F3F3F3] cursor-pointer"
                onClick={() => setShowConfirmModal(false)}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlanCard;
