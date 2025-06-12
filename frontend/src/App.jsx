// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import CreateBlog from "./components/CreateBlog/CreateBlog";
import "./App.css";
import { Toaster } from "react-hot-toast";
import BlogDetail from "./components/BlogDetail/BlogDetail";
import EditBlog from "./components/EditBlog/EditBlog";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
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
           
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
