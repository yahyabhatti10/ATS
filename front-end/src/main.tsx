import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ResumeParser from "./pages/Home.tsx";
import VapiAssistant from "./pages/Vapi.tsx";
import Landing from "./pages/Landing.tsx"
import AdminDashboard from "./pages/AdminDashboard.tsx"
import AdminLogin from "./pages/adminLogin.tsx"
import JobListings from "./pages/JobListings.tsx";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

const router = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/upload-resume",
    element: <ResumeParser />,
  },
  {
    path: "/vapi/:id",
    element: <VapiAssistant />
  },
  {
    path: "/admin-dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/login-admin",
    element: <AdminLogin />,
  },
  {
    path: "/jobs",
    element: <JobListings />
  },
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
