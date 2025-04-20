import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CartProvider } from "./contexts/CartContext";
import { Toaster } from "react-hot-toast";
import AppLayout from "./Layouts/AppLayout";
import FarmerLayout from "./Layouts/FarmerLayout";
import CustomerLayout from "./Layouts/CustomerLayout";
import Home from "./Pages/Landing/Home";
import AboutUs from "./Pages/Landing/AboutUs";
import ContactUs from "./Pages/Landing/ContactUs";
import Faq from "./Pages/Landing/Faq";
import Login from "./Pages/Landing/Login";
import PasswordRecovery from "./Pages/Landing/PasswordRecovery";
import PrivacyPolicy from "./Pages/Landing/PrivacyPolicy";
import Signup from "./Pages/Landing/Signup";
import TermsAndConditions from "./Pages/Landing/TermsAndConditions";
import Checkout from "./Pages/Checkout";
import OrderDetail from "./Pages/OrderDetail";
import FarmerOrderManagement from "./Pages/FarmerOrderManagement";
import FarmerOrdersPage from "./Pages/Farmer/Orders";
import ProductDetail from "./Pages/ProductDetail";
import OrderList from "./Pages/OrderList";

import Dashboard from "./Features/Farmer/Dashboard/Dashboard";
import Products from "./Features/Farmer/AllProducts/Products";
import CloudinaryTest from './Features/Farmer/AllProducts/CloudinaryTest';
import CloudinaryTestSimple from './Features/Farmer/AllProducts/CloudinaryTestSimple';
import EnvTest from './Features/Farmer/AllProducts/EnvTest';
import Chatbot from "./Features/Farmer/Chatbot";
import FarmerNews from "./Features/Farmer/News/FarmerNews";
import Weather from "./Pages/Farmer/Weather";
import ProtectedFarmerRoute from "./Components/Common/ProtectedRoute";
import ProtectedCustomerRoute from "./Components/Common/ProtectedCustomerRoute";
import CustomerDashboard from "./Features/Customer/Dashboard/CustomerDashboard";
import CustomerChatbotPage from "./Features/Customer/Chatbot/CustomerChatbotPage";

import CustomerChatList from "./Features/Customer/Chat/CustomerChatList";
import CustomerChatRoom from "./Features/Customer/Chat/CustomerChatRoom";
import FarmerChatList from "./Features/Farmer/Chat/FarmerChatList";
import FarmerChatRoom from "./Features/Farmer/Chat/FarmerChatRoom";

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
      },
      {
        path: "/cloudinary-test",
        element: <CloudinaryTest />,
      },
      {
        path: "/cloudinary-test-simple",
        element: <CloudinaryTestSimple />,
      },
      {
        path: "/env-test",
        element: <EnvTest />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/orders/:orderId",
        element: <OrderDetail />,
      },
      {
        path: "/products/:productId",
        element: <ProductDetail />,
      },
    ],
  },
  {
    path: "/farmer", // Route for Farmer Dashboard
    element: <ProtectedFarmerRoute><FarmerLayout /></ProtectedFarmerRoute>,
    children: [
      {
        index: true, // This makes it the default route for /farmer
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "chat",
        element: <FarmerChatList />,
      },
      {
        path: "chat/:roomId",
        element: <FarmerChatRoom />,
      },
      {
        path: "chatbot",
        element: <Chatbot/>,
      },
      {
        path: "news",
        element: <FarmerNews />,
      },
      {
        path: "news/:newsId", // Display the news for a specific newsId
        element: <FarmerNews />,
      },
      {
        path: "weather",
        element: <Weather />,
      },
      {
        path: "orders",
        element: <FarmerOrdersPage />,
      },
    ],
  },
  {
    path: "/customer", // Route for Customer Dashboard
    element: <ProtectedCustomerRoute><CustomerLayout /></ProtectedCustomerRoute>,
    children: [
      {
        index: true, // This makes it the default route for /customer
        element: <CustomerDashboard />,
      },
      {
        path: "dashboard",
        element: <CustomerDashboard />,
      },
      {
        path: "chat",
        element: <CustomerChatList />,
      },
      {
        path: "chat/:roomId",
        element: <CustomerChatRoom />,
      },
      {
        path: "chatbot",
        element: <CustomerChatbotPage />,
      },
      {
        path: "orders",
        element: <OrderList />,
      },
      {
        path: "orders/:orderId",
        element: <OrderDetail />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </CartProvider>
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