import React from "react";
import Button from "../../ui/Button";
import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { signup } from "../../Services/apiSignupServices";
import toast from "react-hot-toast";
import Input from "../../ui/Input";

function SignUpForm() {
  const { isLoading: isAdding, mutate } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      toast.success("User added successfully:", data);
      reset();
    },
    onError: (error) => {
      toast.error("Error during signup:", error.message);
    },
  });
  

  const { register, handleSubmit,getValues, formState: { errors },reset } = useForm();

  const onSubmit = function (data) {
    console.log(data);
    mutate(data);
  };

  function onError(error){
    console.log(error);
  }
  return (
    <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit,onError)}>
      {/* Full Name */}
      <div>
      <Input
           id="fullName"
           type="text"
           placeholder="Enter your full name"
           label="Full Name"
           error={errors?.fullName?.message}
           {...register("fullName", {
             required: "Name is required",
           validate: value => value.length >= 8 && value.length <= 25 || "Length should be between 8 and 25 characters"
  })}
/>

      </div>
      {/* Email */}
      <div>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          label="Email Address"
          error={errors?.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Please enter a valid email address"
            }
        })}      
        />
      </div>
      {/* Phone */}
      <div>
        <Input
          id="phoneNo"
          type="text"
          placeholder="Enter your phone number"
          label="Phone Number"
          error={errors?.phoneNo?.message}
          {...register("phoneNo", {
            required: "Phone number is required",
            pattern: {
                value: /^[0-9]{10,15}$/,
                message: "Please enter a valid phone number (10-15 digits)"
            }
        })}    
        />
      </div>

      {/* Password */}
      <div>
        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          error={errors?.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
                value: 8,
                message: "Password must be at least 8 characters long"
            },
            pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            }
        })}        
        />
      </div>
      {/* Confirm Password */}
      <div>
        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors?.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Confirm Password is required",
            validate: value => value === getValues("password") || "Passwords do not match"
          })}
        />
      </div>

      {/* User Type
      <div>
        <label
          htmlFor="userType"
          className="block text-sm font-normal text-white mb-3"
        >
          User Type
        </label>
        <select
          id="userType"
          className="w-full max-w-xl rounded-full border px-6 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400"
          {...register("userType")}
        >
          <option value="customer">Customer</option>
          <option value="farmer">Farmer</option>
          <option value="dealer">Dealer</option>
        </select>
      </div> */}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button variant="button">{isAdding?"Registering":"Register"}</Button>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-white">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="font-medium text-white hover:text-yellow-300"
          >
            Sign in
          </NavLink>
        </p>
      </div>
    </form>
  );
}

export default SignUpForm;
