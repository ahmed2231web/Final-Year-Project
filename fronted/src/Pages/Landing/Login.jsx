import React from "react";
import LoginForm from "../../Components/Forms/LoginForm";
import Image from "../../Components/Common/Image";
import Button from "../../Components/Common/Button";

function Login() {
  return (
    <div className="bg-[#0A690E] min-h-screen flex flex-col md:flex-row items-center justify-evenly">
      {/* Image Section */}
      <Image/>

      {/* Form Section */}
      <div className="w-full max-w-md px-4">
        {/* Title */}
        <div className="text-center mb-6"> {/* Reduced margin */}
          <h2 className="text-white text-l">Welcome to <span className="font-agbluma">AgroConnect</span></h2>
        </div>
        <div>
        <Button variant="navlink"/>
       </div>
        {/* Login Form */}
        <div className="mb-4 w-full bg-[#0A690E] p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;
