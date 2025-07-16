// File: app/page.tsx (Login Page with Username/Password Auth)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, User, Mail, Armchair } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (username === 'admin' && password === 'wedding') {
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 px-2">
      <div className="max-w-[375px] w-full bg-white rounded-xl shadow-2xl shadow-zinc-200 overflow-hidden border border-zinc-200">
        <form onSubmit={handleLogin} className="py-8 md:px-8 px-4 space-y-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full">
            <Armchair className="h-10 w-10 text-accent" />
            </div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-center text-zinc-800">Wedding Table Manager</h1>
          <p className="text-center text-sm text-zinc-500">
            Please enter your credentials to continue
          </p>
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 py-4 text-sm border-zinc-300 focus:border-rose-300 focus:ring-rose-200"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 py-4 text-sm border-zinc-300 focus:border-rose-300 focus:ring-rose-200"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full py-4 bg-accent hover:bg-rose-700 focus:ring-rose-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <div className="text-center text-sm text-zinc-500 mt-3">
            <div className="inline-flex flex-col items-center gap-1">
              <p>
                Having trouble logging in?
              </p>
              <Link
                href="mailto:hello@clevercreativeofficial.com"
                className="text-zinc-600 hover:text-zinc-800 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Contact support
              </Link>
            </div>

          </div>

          {/* <div className="text-center text-sm text-zinc-500">
            <p>Default credentials: admin / wedding</p>
          </div> */}
        </form>
      </div>
    </div>
  );
}