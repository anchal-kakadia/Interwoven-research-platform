'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { Suspense } from "react"


const SignIn = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const searchParams = useSearchParams()

    const callbackUrl = searchParams.get('callbackUrl');

    const router = useRouter();

    const { formState: { isSubmitting, errors }, register, handleSubmit } = useForm({
        defaultValues: {
            username: '',
            password: '',
            name: '',
            email: '',
        }
    })

    const handleSignInFormError = (errors) => {
        for (const key in errors) {
            if (errors[key]?.message) {
                setError(errors[key]?.message || '')
                return;
            }
        }
    }


    const handleSignIn = async (values) => {
        try {
            setError('')
            const signInResponse = await signIn('credentials', {
                username: values.username,
                password: values.password,
                redirect: false,
                callbackUrl: callbackUrl || '/'
            });

            if (!signInResponse || !signInResponse.ok) {
                setError('Invalid credentials. Please try again.');
                return;
            }

            router.push(callbackUrl || '/')
        } catch (error) {
            console.error('Sign-in error:', error.message);
            setError('Sign-in failed');
        }
    };

    return (
        <Suspense>
            <div class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                <div class="mx-auto max-w-lg">
                    <h1 class="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">Intervowen</h1>

                    <p class="mx-auto mt-4 max-w-md text-center text-gray-500">
                        A portal by Navrachana University which helps authors review their research and academic papers
                    </p>

                    <form noValidate class="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8" onSubmit={handleSubmit(
                        handleSignIn,
                        handleSignInFormError
                    )}>
                        <p class="text-center text-lg font-medium">Sign in to your account</p>

                        <div className='border-[1.5px] rounded-lg'>
                            <label for="email" class="sr-only">Username</label>

                            <div class="relative">
                                <input
                                    type="email"
                                    class="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="Enter username"
                                    {...register('username', {
                                        required: 'Please enter your username',
                                    })}
                                />

                                <span class="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className='border-[1.5px] rounded-lg'>
                            <label for="password" class="sr-only">Password</label>

                            <div class="relative">
                                <input
                                    type="password"
                                    class="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="Enter password"
                                    {...register('password', {
                                        required: 'Please enter your password',
                                    })}
                                />

                                <span class="absolute inset-y-0 end-0 grid place-content-center px-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="size-4 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            class="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                        >
                            Sign in
                        </button>

                        <div class="text-center text-sm text-gray-500 flex flex-row justify-center">
                            <p className='px-2'>No account?</p>
                            <a class="underline" href="/signup">Sign up</a>
                        </div>
                    </form>
                </div>
            </div>
        </Suspense>
    )
}

export default SignIn;