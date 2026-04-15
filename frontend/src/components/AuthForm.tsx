import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthContext } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
const schema = z.object({
  email: z.string().email({ message: "invlaid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type FormData = z.infer<typeof schema>;

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
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
        navigate("/");
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
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-transparent">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-extrabold tracking-tighter text-gray-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {isLogin
              ? "Enter your credentials to continue"
              : "Join us to start your journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className={`rounded-full px-4 py-6 ${errors.email ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className={`rounded-full px-4 py-6 ${errors.password ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-500 text-sm font-medium hover:text-black transition-colors"
            >
              {isLogin
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
