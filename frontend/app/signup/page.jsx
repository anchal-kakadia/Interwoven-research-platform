'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { Suspense } from "react"

import axios from 'axios';

const SignIn = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false);
    const callbackUrl = searchParams.get('callbackUrl');

    const router = useRouter();

    const { formState: { isSubmitting, errors }, register, handleSubmit } = useForm({
        defaultValues: {
            name: '',
            username: '',
            password: '',
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


    const handleSignUp = async (values) => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.API_URL}/auth/signUp`,
                { name: values.name, username: values.username, password: values.password, email: values.email },
            );

            setLoading(false)

            if (response.status === 409) {
                alert(`User with username ${values.username} already exists`);
            }

            if (response.status === 200) {
                toast.success(`Hey ${values.name}, Sign up successful!`);

                setTimeout(() => {
                    router.push('/signin');
                }, 1000);
            }



        } catch (error) {
            console.error('Sign-in error:', error.message);
            setError('Sign-in failed');
        }
    };

    return (
        <Suspense>
            <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">

                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

                <div class="mx-auto max-w-lg">
                    <h1 class="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">Intervowen</h1>

                    <p class="mx-auto mt-4 max-w-md text-center text-gray-500">
                        A portal by Navrachana University which helps authors review their research and academic papers
                    </p>

                    <form noValidate class="mb-0 mt-6 space-y-2 rounded-lg p-4 shadow-lg sm:p-6 lg:p-6" onSubmit={handleSubmit(
                        handleSignUp,
                        handleSignInFormError
                    )}>
                        <p class="text-center text-lg font-medium">Sign up</p>

                        <div className='border-[1.5px] rounded-lg'>
                            <label for="email" class="sr-only">Name</label>

                            <div class="relative">
                                <input
                                    class="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="Enter name"
                                    {...register('name', {
                                        required: 'Please enter your name',
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
                            <label for="username" class="sr-only">Username</label>

                            <div class="relative">
                                <input
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

                        <div className='border-[1.5px] rounded-lg'>
                            <label for="password" class="sr-only">Email</label>

                            <div class="relative">
                                <input
                                    type="email"
                                    class="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                    placeholder="Enter email"
                                    {...register('email', {
                                        required: 'Please enter your email',
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

                        <div className='w-full flex justify-center items-center'>
                            <button
                                type="submit"
                                class="w-full flex flex-row justify-center items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
                            >
                                {loading && <><div
                                    className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                    role="status">
                                </div>
                                    <div>Signing up</div></>}

                                {!loading && <div>Sign up</div>}

                            </button>
                        </div>

                        <div class="text-center text-sm text-gray-500 flex flex-row justify-center">
                            <p className='px-2'>Already have an account?</p>
                            <a class="underline" href="/signin">Sign in</a>
                        </div>
                    </form>
                </div>
            </div>
        </Suspense>
    )
}

export default SignIn;