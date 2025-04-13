'use client'

import { Fragment } from "react";
import {
  Bars3CenterLeftIcon,
  PencilIcon,
  ChevronDownIcon,
  CreditCardIcon,
  Cog8ToothIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import { BellIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Menu, Transition, Popover } from "@headlessui/react";
import ManSmiling from '../assets/images/man-smiling.jpg'
import Image from 'next/image'
import Link from "next/link";
import { useSession } from 'next-auth/react';


export default function TopBar({ showNav, setShowNav }) {

  const { data: session, status } = useSession();


  return (
    <div
      className={`fixed w-full h-16 bg-white flex justify-between items-center transition-all duration-[400ms] ${showNav ? "pl-56" : ""
        }`}
    >
      <div className="pl-4 md:pl-16">
        <Bars3CenterLeftIcon
          className="h-7 w-7 text-gray-700 cursor-pointer"
          onClick={() => setShowNav(!showNav)}
        /> 
      </div>
      <div className="flex items-center pr-4 md:pr-16">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full justify-center items-center">
              {/* <Image
                  src={ManSmiling}   
                  alt="profile picture"
                  className="rounded-full w-8 h-8 md:mr-4 border-2 border-white shadow-sm"
                /> */}
              <span className="hidden md:block font-medium text-gray-700">
                {session?.user?.name}              
              </span>
              <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-700" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform scale-95"
            enterTo="transform scale-100"
            leave="transition ease-in duration=75"
            leaveFrom="transform scale-100"
            leaveTo="transform scale-95"
          >
            <Menu.Items className="absolute right-0 w-56 z-50 mt-2 origin-top-right bg-white rounded shadow-sm">
              <div className="p-1">
                <Menu.Item>
                  <Link
                    href="#"
                    className="flex hover:bg-orange-500 hover:text-white text-gray-700 rounded p-2 text-sm group transition-colors items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link
                    href="#"
                    className="flex hover:bg-orange-500 hover:text-white text-gray-700 rounded p-2 text-sm group transition-colors items-center"
                  >
                    <Cog8ToothIcon className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}