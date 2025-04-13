"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { HomeIcon, CreditCardIcon, UserIcon } from "@heroicons/react/24/solid";
import {AcademicCapIcon, UserCircleIcon, CheckCircleIcon, EnvelopeIcon} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

const SideBar = forwardRef(({ showNav, type, handleNavItemClick, selectedNavItem }, ref) => {
  const router = useRouter();

  const [item,selectedItem] = useState('');

  const navItemsAuthor = [
    // { path: "/author", label: "Home", icon: <HomeIcon className="h-5 w-5" /> },
    {
      path: "/author",
      label: "Submissions",
      icon: <AcademicCapIcon className="h-6 w-6" />,
    },
    {
      path: "/author",
      label: "Feedbacks",
      icon: <CreditCardIcon className="h-5 w-5" />,
    },
  ];

  const navItemsAdmin = [
    // { path: "/admin", label: "Home", icon: <HomeIcon className="h-6 w-6" /> },
    {
      path: "/admin", label: "Review Submissions", icon: <AcademicCapIcon className="h-6 w-6" />
    },
    {
      path: "/admin", label: "Submissions Accepted", icon: <AcademicCapIcon className="h-6 w-6" />
    },
    {
      path: "/admin", label: "Submissions InReview", icon: <AcademicCapIcon className="h-6 w-6" />
    },
    {
      path: "/admin", label: "Reviewers", icon: <UserCircleIcon className="h-6 w-6" />
    },
    {
      path: "/admin", label: "Authors", icon: <UserCircleIcon className="h-6 w-6" />
    },
    {
      path: "/admin", label: "Approve Reviews", icon: <CheckCircleIcon className="h-6 w-6" />
    },
    {
      path: "/admin", label: "Invite", icon: <EnvelopeIcon className="h-6 w-6" />
    },
  ];

  const navItemsReviewer = [
    // { path: "/", label: "Home", icon: <HomeIcon className="h-5 w-5" /> },
    {
      path: "/feedback",
      label: "Feedback",
      icon: <CreditCardIcon className="h-5 w-5" />,
    },
    // Add more items as needed
  ];

  return (
    <div ref={ref} className="fixed w-56 h-full bg-white shadow">
      <div className="flex gap-5 justify-center mt-6 mb-14 hover:cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9"
          />
        </svg>

        <div className="w-32 h-auto">Intervowen</div>
      </div>

      {type === "author" ? (
        <div className="flex flex-col">
          {navItemsAuthor.map(({ id, path, label, icon }) => (
            <Link href="/author">
              <div
                key={id}
                onClick={(e) => {
                  handleNavItemClick(label);
                  selectedItem(label); // Call the callback function with the selected item ID
                }}
                className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${item === label
                  ? "bg-[#5D5FEF] text-[#FFFFFF]"
                  : "text-gray-400 hover:bg-[#5D5FEF] hover:text-[#FFFFFF]"
                  }`}
              >
                <div className="mr-2">{icon}</div>
                <div>
                  <p>{label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : type === "admin" ? (
        <div className="flex flex-col justify-center items-stretch">
          {navItemsAdmin.map(({ id, path, label, icon }) => (
            <Link href="/admin">
              <div
                key={id}
                onClick={(e) => {
                  handleNavItemClick(label);
                  selectedItem(label); // Call the callback function with the selected item ID
                }}
                className={`px-3 py-3 mx-2 rounded-md text-center cursor-pointer mb-3 flex flex-row gap-2 transition-colors ${item === label
                  ? "bg-[#5D5FEF] text-[#FFFFFF]"
                  : "text-gray-400 hover:bg-[#5D5FEF] hover:text-[#FFFFFF]"
                  }`}
              >
                <div className="">{icon}</div>
                <div>
                  <p
                    className={`${label.length > 16 ? "w-[10rem] -ml-2" : ""}`}
                  >
                    {label}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          {navItemsReviewer.map(({ id, path, label, icon }) => (
            <Link href="/reviewer">
              <div
                key={id}
                onClick={(e) => {
                  handleNavItemClick(label);
                  selectedItem(label); // Call the callback function with the selected item ID
                }}
                className={`pl-6 py-3 mx-5 rounded text-center cursor-pointer mb-3 flex items-center transition-colors ${item === label
                  ? "bg-[#5D5FEF] text-[#FFFFFF]"
                  : "text-gray-400 hover:bg-[#5D5FEF] hover:text-[#FFFFFF]"
                  }`}
              >
                <div className="mr-2">{icon}</div>
                <div>
                  <p>{label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

SideBar.displayName = "SideBar";

export default SideBar;
