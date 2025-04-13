"use client";
import "./globals.css";

import { Montserrat } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
// import Auth from "../components/Auth";
import React, { useEffect, useRef } from "react";

export default function RootLayout({ children }) {
  const scrollbar = useRef(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSignUpPage = pathname?.includes("/signup");
  const authPage =
    pathname?.includes("/signin") ||
    pathname?.includes("/signup") ||
    pathname?.includes("/signout");

  return (
      <html lang="en">
        <SessionProvider>
          {/* <Auth
          routesToSkip={{
            '/signin': true,
            '/signout': true,
          }}
        > */}
          <body>{children}</body>
          {/* </Auth> */}
        </SessionProvider>
      </html>
  );
}
