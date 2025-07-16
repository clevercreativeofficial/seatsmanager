// app/not-found.tsx
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-8xl font-bold text-zinc-200">404</h1>
          <h2 className="text-2xl font-medium text-zinc-600">Page Not Found</h2>
          <p className="max-w-md mx-auto text-zinc-500">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="max-w-fit mx-auto w-full bg-accent hover:text-white hover:border-transparent" asChild>
            <Link href="/">
            <Rocket className="h-4 w-4" />
              Go back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}