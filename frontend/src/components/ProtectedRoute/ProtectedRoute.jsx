import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { loginWithGoogle } from "../../utils/loginWithGoogle";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const location = useLocation();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        toast.error("🔒 You must be logged in to access this page.");

        // Trigger Google login
        try {
          const userData = await loginWithGoogle();
          if (userData) {
            dispatch(setUser(userData));
            toast.success("Signed in successfully!");
          } else {
            toast.error("Login failed. Please try again.");
            setRedirect(true);
          }
        } catch (err) {
          toast.error("Login failed. Please try again.");
          console.error(err);
          setRedirect(true);
        }
      } else if (adminOnly && !user.isAdmin) {
        toast.error("🔒 Admin access only.");
        setRedirect(true);
      }
    };

    checkAccess();
  }, [user, adminOnly, dispatch]);

  if (!user || (adminOnly && !user.isAdmin) || redirect) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
