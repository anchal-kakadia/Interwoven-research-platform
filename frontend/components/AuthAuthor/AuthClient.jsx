'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';


export default function AuthClient({
    routesToSkip,
    children,
}) {
    const pathname = usePathname();
    const router = useRouter();

    const { data: session, status } = useSession();

    const isAuthorized = useMemo(() => {
        return (
            session &&
            session.user &&
            session.user.role === 'author'
        );
    }, [session]);

    const handleSignOut = () => {
        router.push(`/signout`);
    };

    const renderAuthClient = () => {
        if (routesToSkip[pathname] || status === 'loading' || isAuthorized)
            return children;

        return (
            <div className="min-h-screen flex items-center justify-center h-auto bg-[#ececec]">
                <div className="max-w-md w-full bg-white flex flex-col items-center justify-center px-4 py-8 rounded-2xl">
                    <div className="pt-6 flex flex-col items-center">
                        <p className="pt-2 text-center text-2xl text-black">
                            {session?.user?.name ? (
                                <span>
                                    Hi <strong>{session?.user?.name}</strong>,
                                    {''}
                                </span>
                            ) : null}{' '}
                            You are not authorised!
                        </p>
                        <p className="pt-2 text-center text-base">
                            Please contact your admin
                        </p>
                        <div className="pt-4">
                            <button

                                onClick={handleSignOut}
                            >
                                Signout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return renderAuthClient();
}
