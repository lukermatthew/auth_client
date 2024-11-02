"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type LoginSchema = z.infer<typeof loginSchema>;

type SignInResponse = {
  ok: boolean;
  error?: string;
  status?: number;
  url?: string;
};

const LoginForm: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session?.user) {
      router.push("/home");
      return;
    }

    setIsRedirecting(false);
  }, [session, status, router]);

  const onSubmit = async (data: LoginSchema) => {
    setLoading(true);
    setError(null);

    const result = (await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    })) as SignInResponse | undefined;

    if (result?.ok) {
      router.push("/home");
    } else {
      setLoading(false);
      reset();
      setError(result?.error || "Login failed");
    }
  };

  if (isRedirecting) {
    return null;
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            Login
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
