// app/about/page.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on component mount
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg space-y-8 text-center border border-zinc-100">
        <div className="space-y-1">
          <Badge variant="secondary" className="mx-auto">
            <span className="text-xs font-medium tracking-wide">ABOUT THE DEVELOPER</span>
          </Badge>
          <h2 className="text-zinc-400 text-sm font-light">Creative Problem Solver</h2>
        </div>
        
        <div className="flex justify-center">
          <Avatar className="h-28 w-28 border-4 border-white shadow-md">
            <AvatarImage src="https://jfctjplvujhqsposskbb.supabase.co/storage/v1/object/sign/images/profile_sm.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kNWMyNWM5YS0zNTMxLTRlN2ItYjRjNy0wOTUxMmU3YzI1YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvcHJvZmlsZV9zbS5qcGciLCJpYXQiOjE3NTI1NTY0NDIsImV4cCI6MTc4NDA5MjQ0Mn0.DCDJs3O3npHNZFfDPm94OnPru3Qdf_R0Ng0aRK9YfmY" />
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-800">Clever Creative</h1>
          <p className="text-zinc-500 font-medium">Senior Graphic Designer & Web Developer</p>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">
            Creating visually stunning and technically robust digital experiences
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild className="w-full sm:w-auto px-6">
            <Link href="https://clevercreativeofficial.com/" target="_blank">
              View Portfolio
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild 
            className="w-full sm:w-auto px-6 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <Link href="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}