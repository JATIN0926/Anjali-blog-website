// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import CreateBlog from "./components/CreateBlog/CreateBlog";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="w-screen max-w-full flex flex-col gap-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-blog" element={<CreateBlog />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
