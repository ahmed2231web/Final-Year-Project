import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from "./Layouts/AppLayout"
import Home from "./Pages/Landing/Home"
import AboutUs from "./Pages/Landing/AboutUs"
import ContactUs from "./Pages/Landing/ContactUs"
import Faq from "./Pages/Landing/Faq"
import Login from "./Pages/Landing/Login"
import PasswordRecovery from "./Pages/Landing/PasswordRecovery"
import PrivacyPolicy from "./Pages/Landing/PrivacyPolicy"
import Signup from "./Pages/Landing/Signup"
import TermsAndConditions from "./Pages/Landing/TermsAndConditions"

const router=createBrowserRouter([
  {
    element:<AppLayout/>,
    children:[
      
        {
          path: "/",
          element:<Home/>
        },
        {
          path: "/about",
          element:<AboutUs/>
          
        },
        {
            path:"/contact",
            element:<ContactUs/>
        },
        {
          path:"/faq",
          element:<Faq/>
        },
        {
        path : "/Login",
        element:<Login/>,
        },
         {
            path:"passwordRecovery",
            element:<PasswordRecovery/>
         },
        
        {
          path:"/privacypolicy",
          element:<PrivacyPolicy/>       
        },

        {
            path:"/signup",
            element:<Signup/>,
           
        },
        
        {
            path:"/termsandconditions",
            element:<TermsAndConditions/>
        }
      
    ]
  }
])


function App() {
  return (
    <RouterProvider router={router}/>
  )
}

export default App

