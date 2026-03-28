import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-syne font-bold text-6xl text-foreground">404</p>
        <p className="text-muted-foreground mt-3">This page doesn't exist.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}