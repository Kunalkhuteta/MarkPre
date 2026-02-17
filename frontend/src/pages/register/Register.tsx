import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { registerSchema } from "@/schemas/auth.schema";
import type { RegisterFormValues } from "@/schemas/auth.schema";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { UserPlus, Sparkles, Zap, Palette, FileDown } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await api.post("/auth/register", values);
      toast.success("Registration successful! Please check your email to verify your account.");
      navigate("/login");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-12 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-white space-y-8 max-w-lg">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              Start creating amazing presentations today
            </h2>
            <p className="text-xl text-purple-100">
              Join thousands of users creating beautiful, professional presentations with AI.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
              <Sparkles className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-purple-100">Generate slides instantly</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
              <Palette className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Custom Themes</h3>
              <p className="text-sm text-purple-100">Design your style</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
              <FileDown className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Export Anywhere</h3>
              <p className="text-sm text-purple-100">PDF, HTML & more</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
              <Zap className="w-8 h-8 mb-2" />
              <h3 className="font-semibold">Lightning Fast</h3>
              <p className="text-sm text-purple-100">Real-time preview</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-purple-100">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-purple-100">Presentations</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-sm text-purple-100">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Logo/Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MarkPre
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground text-lg">
              Join MarkPre and start creating beautiful presentations
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel className="text-base">Password</FormLabel>
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
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </form>
          </Form>

          {/* Sign in link */}
          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in instead
            </Link>
          </p>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;