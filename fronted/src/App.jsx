import React from "react";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from "./Layouts/AppLayout";
import Home from "./Pages/Landing/Home";
import AboutUs from "./Pages/Landing/AboutUs";
import ContactUs from "./Pages/Landing/ContactUs";
import Faq from "./Pages/Landing/Faq";
import Login from "./Pages/Landing/Login";
import PasswordRecovery from "./Pages/Landing/PasswordRecovery";
import PrivacyPolicy from "./Pages/Landing/PrivacyPolicy";
import Signup from "./Pages/Landing/Signup";
import TermsAndConditions from "./Pages/Landing/TermsAndConditions";
import ActivationPending from "./Components/Forms/ActivationPending";
import ActivateAccount from "./Components/Forms/ActivateAccount";
import ForgotPassword from "./Components/Forms/ForgotPassword";
import PasswordResetConfirm from "./Components/Forms/PasswordResetConfirm";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/about",
        element: <AboutUs />
      },
      {
        path: "/contact",
        element: <ContactUs />
      },
      {
        path: "/faq",
        element: <Faq />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/passwordRecovery",
        element: <PasswordRecovery />
      },
      {
        path: "/privacypolicy",
        element: <PrivacyPolicy />
      },
      {
        path: "/signup",
        element: <Signup />
      },
      {
        path: "/termsandconditions",
        element: <TermsAndConditions />
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
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
