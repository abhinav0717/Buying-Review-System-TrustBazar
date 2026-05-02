import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../store/authSlice.js";

export default function Protected({ children }) {
  const location = useLocation();
  const { token } = useSelector(selectAuth);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

