import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import AppLayout from "./Layouts/AppLayout";
import FarmerLayout from "./Layouts/FarmerLayout";
import Home from "./Pages/Landing/Home";
import AboutUs from "./Pages/Landing/AboutUs";
import ContactUs from "./Pages/Landing/ContactUs";
import Faq from "./Pages/Landing/Faq";
import Login from "./Pages/Landing/Login";
import PasswordRecovery from "./Pages/Landing/PasswordRecovery";
import PrivacyPolicy from "./Pages/Landing/PrivacyPolicy";
import Signup from "./Pages/Landing/Signup";
import TermsAndConditions from "./Pages/Landing/TermsAndConditions";

import Dashboard from "./Features/Farmer/Dashboard/Dashboard";
import Products from "./Features/Farmer/AllProducts/Products";
import ChatComponent from "./Features/Farmer/Chats/ChatComponent";
import SidebarChat from "./Features/Farmer/Chats/SidebarChat";
import Chatbot from "./Features/Farmer/Chatbot";
import Notifications from "./Features/Farmer/Notifications";

import ActivationPending from "./Components/Forms/ActivationPending";
import ActivateAccount from "./Components/Forms/ActivateAccount";
import ForgotPassword from "./Components/Forms/ForgotPassword";
import PasswordResetConfirm from "./Components/Forms/PasswordResetConfirm";

// Initialize React Query Client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Public layout
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about",
        element: <AboutUs />,
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/faq",
        element: <Faq />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/passwordRecovery",
        element: <PasswordRecovery />,
      },
      {
        path: "/privacypolicy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/termsandconditions",
        element: <TermsAndConditions />,
      },
      {
        path: "/activation-pending",
        element: <ActivationPending />
      },
      {
        path: "/activate/:uid/:token/",
        element: <ActivateAccount />
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "/password-reset/:uid/:token",
        element: <PasswordResetConfirm />
      }
    ],
  },
  {
    path: "/farmer", // Route for Farmer Dashboard
    element: <FarmerLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
      path: "chatbot",
      element: <Chatbot/>,
      },
      {
        path: "notifications",
        element: <Notifications/>
      },
      {
        path: "chat",
        element: <SidebarChat />, // Display the list of customers
        children: [
          {
            path: ":customerId", // Display the chat for a specific customer
            element: <ChatComponent session={{ user: { id: "00000000-0000-0000-0000-000000000000" } }} />,
          },
        ],
      },
      
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster
        position="top-center"
        gutter={24}
        containerStyle={{
          margin: "8px",
        }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          style: {
            fontSize: "15px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "light-grey",
            color: "black",
          },
          error: {
            duration: 5000,
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;