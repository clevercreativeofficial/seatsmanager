// app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, User, Mail, Armchair } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const MAX_SESSIONS = 20;
const isAllowedToLogin = true; // This can be toggled based on your business logic

const USER_CREDENTIALS = {
  admin: {
    password: 'admin@1234',
    isAdmin: true
  },
  staff: {
    password: 'wedding',
    isAdmin: false
  }
};

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
      // Check current active sessions count
      const { count } = await supabase
        .from('sessions')
        .select('*', {
          count: 'exact',
          head: true,
        });

      if (count && count >= MAX_SESSIONS) {
        setError('Maximum number of users reached. Please try again later.');
        return;
      }

      // Check credentials against predefined users
      const user = USER_CREDENTIALS[username as keyof typeof USER_CREDENTIALS];

      if (user && password === user.password) {
        // Generate session ID
        const sessionId = crypto.randomUUID();

        if (isAllowedToLogin) {
          // Store in localStorage
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('sessionId', sessionId);
          // Explicitly set isAdmin to false if user is not admin
          localStorage.setItem('isAdmin', user.isAdmin ? 'true' : 'false');
          setError(''); // Clear any previous error
        }
        // If not allowed to login, just clear localStorage
        else {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('isAdmin');
          setError('Login unavailable - try again later.');
          return;
        }

        // Store in Supabase
        const { error } = await supabase
          .from('sessions')
          .insert([{
            session_id: sessionId
            // created_at and expires_at will be set automatically
          }]);

        if (error) throw error;

        router.push('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
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
          <h1 className="mt-4 text-3xl font-bold text-center text-zinc-800">Wedding Seat Manager</h1>
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
        </form>
      </div>
    </div>
  );
}