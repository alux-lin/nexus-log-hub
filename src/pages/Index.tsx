import { Navigate } from "react-router-dom";

// Index just redirects to the dashboard
export default function Index() {
  return <Navigate to="/" replace />;
}
