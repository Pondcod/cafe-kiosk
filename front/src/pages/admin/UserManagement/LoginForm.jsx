import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "../../../assets/Sol-icon.png"; // Adjust path as needed

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md shadow-lg scale-[1.2]">
        <CardHeader className="flex flex-col items-center gap-3">
          <img src={logo} alt="Cafe Logo" className="h-16 w-16 mb-3" />
          <CardTitle className="text-3xl font-bold">Sol-Cafe Admin</CardTitle>
          <CardDescription className="text-lg text-center">
            Welcome back! Please log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for error/success messages */}
          <div className="mb-5 h-6 text-center text-base text-red-500"></div>
          <form className="flex flex-col gap-8">
            <div className="grid gap-4">
              <Label htmlFor="email" className="text-base">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="text-base py-3"
              />
            </div>
            <div className="grid gap-4">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="text-base py-3"
              />
            </div>
            <Button type="submit" className="w-full text-lg py-3">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}