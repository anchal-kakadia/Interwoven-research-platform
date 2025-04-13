"use client";
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import './SignOut.css';

const SignOut = () => {
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        if (!session) {
            router.push('/signin');
        }
    }, [session, router]);

    const handleSignOut = async () => {
        try {
            await signOut({ redirect: false });
            router.push('/signin');
        } catch (error) {
            console.error('Sign-out error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center h-auto sign-out-bg">
            <div className="max-w-md w-full bg-white sign-out-box">
                <div className="text-center sign-out-logo-image">
                </div>
                <div className="">
                    {session ? (
                        <div className='flex justify-center flex-col'>
                            <p className="mb-4 text-center w-full font-small sign-out-label-text">Are you sure you want to sign out?</p>
                            <button
                                onClick={handleSignOut}
                                className="w-full rounded-md mt-2 sign-out-button"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className='flex justify-center flex-col'>
                            <p className="text-red-500 mt-2 font-small text-center">You are not signed in.</p>
                            <p className="redirect-text" onClick={() => { router.push('/signin') }}>
                                Sign In here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignOut;
