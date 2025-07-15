// File: app/page.tsx (Login Page with Username/Password Auth)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, User } from 'lucide-react';

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
      
      if (username === 'admin' && password === '1234') {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-[375px] w-full bg-white rounded-xl shadow-2xl shadow-zinc-200 overflow-hidden border border-zinc-100">
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <h1 className="mt-4 text-3xl font-bold text-center text-zinc-800">Wedding Seating Manager</h1>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 py-6 text-base border-zinc-300 focus:border-rose-300 focus:ring-rose-200"
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
                className="pl-10 py-6 text-base border-zinc-300 focus:border-rose-300 focus:ring-rose-200"
                required
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full py-6 bg-rose-600 hover:bg-rose-700 focus:ring-rose-200"
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

          <div className="text-center text-sm text-zinc-500">
            <p>Default credentials: admin / 1234</p>
          </div>
        </form>
      </div>
    </div>
  );
}