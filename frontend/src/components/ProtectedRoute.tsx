'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo 
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useAuth();
  const { user, loading } = state;

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (requireAuth && !user) {
      // Redirect to login with return URL
      const redirect = redirectTo || pathname;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (requireAdmin && (!user || user.role !== 'ADMIN')) {
      // Redirect to home if not admin
      router.push('/');
      return;
    }
  }, [user, loading, requireAuth, requireAdmin, router, pathname, redirectTo]);

  // Show loading while checking auth
  if (loading) {
    return <Loading size="lg" text="Yuklanmoqda..." fullScreen />;
  }

  // Don't render if auth requirements not met
  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && (!user || user.role !== 'ADMIN')) {
    return null;
  }

  return <>{children}</>;
}