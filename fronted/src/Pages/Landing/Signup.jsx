import React from 'react';
import SignupForm from '../../Components/Forms/SignupForm';
import Image from "../../ui/Image";
import Button from '../../ui/Button';

function Signup() {
  return (
    <div className="bg-[#0A690E] min-h-screen flex flex-col md:flex-row items-center justify-evenly">
    {/* Image Section */}
    <Image/>

    {/* Form Section */}
    <div className="w-full max-w-md px-4 mt-10">
      {/* Title */}
      <div className="text-center mb-6"> {/* Reduced margin */}
        <h2 className="text-white text-l">Welcome to <span className="font-agbluma">AgroConnect</span></h2>
      </div>
      <div>
     <Button variant="navlink"/>
     </div>
      {/* Login Form */}
      <div className="mb-4 w-full bg-[#0A690E] p-8">
        <SignupForm/>
      </div>
    </div>
  </div>
  );
}

export default Signup;