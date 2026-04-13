import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthContext } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email({ message: "invlaid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type FormData = z.infer<typeof schema>;

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const auth = useContext(AuthContext);
  const onSubmit = async (data: FormData) => {
    try {
      const url = isLogin
        ? "http://localhost:5000/api/login"
        : "http://localhost:5000/api/register";
      const res = await axios.post(url, data);

      if (isLogin && res.data.token) {
        auth?.login(res.data.token);
        alert("login successful");
      } else {
        alert("registration Successful! please login");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("full Error Object:", err);
      alert(err.response?.data?.message || "an error occured");
    }
  };
  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.email ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.password ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-md"
        >
          {isLogin ? "Sign In" : "Register"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          {isLogin
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
