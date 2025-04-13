'use client'
import "./globals.css";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

export default function Home() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();


  useEffect(() => {
    if (session) {
      if (!session.user) {
        router.push('/signin');
        signOut();
      }
    } else {
      router.push('/signin');
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      if (session.user) {
          if(session.user.role === 'superAdmin')
          {
            window.location.href = "http://localhost:3000/admin";
          }
          else if(session.user.role === 'reviewer')
          {
            window.location.href = "http://localhost:3000/reviewer";
          }
          else if(session.user.role === 'author')
          {
            window.location.href = "http://localhost:3000/author";
          }
      }
    }
  }, [session]);
  return (
    <></>
  );
}
