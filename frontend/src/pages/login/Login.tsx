import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema } from "@/schemas/auth.schema";
import type { LoginFormValues } from "@/schemas/auth.schema";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch } from "@/app/hooks";
import { loginUser } from "@/features/auth/authThunk";
import { LogIn, Sparkles } from "lucide-react";

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await dispatch(loginUser(values)).unwrap();
      navigate("/dashboard");
      toast.success("Welcome back!");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MarkPre
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign in
              </Button>
            </form>
          </Form>

          {/* Sign up link */}
          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Create one now
            </Link>
          </p>

          {/* Features */}
          <div className="pt-8 border-t space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              What you get with MarkPre:
            </p>
            <div className="space-y-2">
              {[
                "AI-powered slide generation",
                "Beautiful themes & customization",
                "Export to PDF, HTML & more",
                "Presentation mode with keyboard controls",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration/Image */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              Create stunning presentations in minutes
            </h2>
            <p className="text-xl text-blue-100">
              Write in Markdown, get beautiful slides. AI-powered, theme-based,
              and ready to present.
            </p>
          </div>

          {/* Mock presentation cards */}
          <div className="space-y-4">
            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Generation</h3>
                  <p className="text-sm text-blue-100">
                    Generate complete presentations from a topic in seconds
                  </p>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-transform">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Beautiful Themes</h3>
                  <p className="text-sm text-blue-100">
                    Choose from pro themes or create your own in minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;