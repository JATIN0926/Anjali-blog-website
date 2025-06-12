import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ViewCard = ({ title, date, id }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = async () => {
    setShowConfirmModal(false);
    const toastId = toast.loading("Deleting blog...");
    try {
      await axios.delete(`/api/blogs/delete/${id}`);
      toast.success("Blog deleted successfully", { id: toastId });
      // Refresh or update UI
      window.location.reload(); // or lift state to parent and re-fetch
    } catch (error) {
      toast.error("Failed to delete blog", { id: toastId });
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <div className="w-full py-6 border-b-[#E7EAEE] border-b flex flex-col items-start justify-center gap-1">
        <h1
          className="text-[2.1rem] tracking-[-0.84px] font-medium"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          {title}
        </h1>
        <div className="w-full flex items-center justify-between">
          <p
            className="text-[0.7rem] tracking-[-1px] text-[#6F6B6B]"
            style={{ fontFamily: "SometypeMono Regular, monospace" }}
          >
            {date}
          </p>
          <div className="flex items-center justify-center gap-5">
            <img
              src="/icons/edit.svg"
              alt="Edit"
              className="w-6 h-6 cursor-pointer"
              onClick={() => navigate(`/edit/${id}`)}
            />
            <img src="/icons/share.svg" alt="Share" className="w-6 h-6" />
            <img
              src="/icons/delete.svg"
              alt="Delete"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setShowConfirmModal(true)}
            />
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0  z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white border border-[#504E4F] rounded-md p-6 w-[90%] max-w-md text-center shadow-lg"
            style={{ fontFamily: "SometypeMono Regular, monospace" }}
          >
            <p className="text-[#201F1F] text-xl mb-6">
              Are you sure you want to delete this blog?
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

export default ViewCard;
