// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import CreateBlog from "./components/CreateBlog/CreateBlog";
import "./App.css";
import { Toaster } from "react-hot-toast";
import BlogDetail from "./components/BlogDetail/BlogDetail";
import EditBlog from "./components/EditBlog/EditBlog";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import SettingsPage from "./components/SettingsPage/SettingsPage";
import ViewStories from "./components/ViewStories/ViewStories";
import { useSelector } from "react-redux";
import GoogleFallbackPopup from "./components/GoogleFallbackPopup/GoogleFallbackPopup";

function App() {
  const showFallbackPopup = useSelector(
    (state) => state.authUi.showFallbackPopup
  );
  return (
    <>
      <Toaster />
      <Router>
        <div className="w-screen max-w-full flex flex-col gap-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/create-blog"
              element={
                <ProtectedRoute adminOnly>
                  <CreateBlog />
                </ProtectedRoute>
              }
            />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute adminOnly>
                  <EditBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute adminOnly>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-stories"
              element={
                <ProtectedRoute adminOnly>
                  <ViewStories />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {showFallbackPopup && <GoogleFallbackPopup />}
      </Router>
    </>
  );
}

export default App;
