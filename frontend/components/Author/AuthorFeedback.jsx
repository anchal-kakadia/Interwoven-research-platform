import React, { useState, useEffect } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react';
import axios from "axios";
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';

const AuthorFeedback = () => {

    const [allFiles, setAllFiles] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {

            const response = await axios.get(
                `${process.env.API_URL}/api/user/getFileWithStatus`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            console.log(response.data)
            setAllFiles(response.data);
        }

        fetchData();
    }, [])

    const handleGetFile = async (e, file_id) => {

        const response = await fetch(`${process.env.API_URL}/api/user/getFile/${file_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': "application/json",
                authorization: `Bearer ${session?.user?.accessToken}`,
            },
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
    }

    const getStatus = (status) => {
        switch (status) {
            case 'pending':
                return <div class="py-2 px-4 text-xs leading-3 text-white rounded-full bg-slate-400">Not yet accepted</div>
                break;
            case 'inreview':
                return <div class="py-2 px-4 text-xs leading-3 text-[#f38063] rounded-full bg-[#FFF4DE]">In Review</div>
                break
            case 'rejected':
                return <div class="py-2 px-4 text-xs leading-3 text-[#f95478] rounded-full bg-[#FFE2E5]">Rejected</div>
                break
            case 'reviewed':
                return <div class="py-2 px-4 text-xs leading-3 text-[#3db952] rounded-full bg-[#DCFCE7]">Reviewed</div>
                break
            default:
                return <div>Status unknown!</div>
                break;
        }
    }

    return (
        <div className='flex flex-col justify-center items-center w-full'>
            <div aria-label="group of cards" tabindex="0" class="focus:outline-none py-8 w-full">
                <div class="lg:flex lg:flex-col items-center justify-center w-full">

                    {allFiles && allFiles.length > 0 ? allFiles.map((file, index) => {
                        return <div tabIndex={index} aria-label="card 1" class=" w-full mb-7 bg-white p-6 shadow rounded">
                            <div class="flex items-center">
                                <div class="flex items-start justify-between w-full">
                                    <div class="pl-3">
                                        <p tabIndex={index} class="focus:outline-none text-xl font-medium leading-5 text-gray-800 w-fit">{file.files.file_name}</p>
                                        <p tabIndex={index} class="focus:outline-none text-sm leading-normal pt-2 text-[#BF83FF] hover:cursor-pointer w-fit" onClick={(e) => { handleGetFile(e, file.files.file_id) }}>View file</p>
                                    </div>
                                </div>
                            </div>
                            <div class="px-2">
                                <p tabIndex={index} class="focus:outline-none text-sm leading-5 py-4 text-gray-600">{file.files.file_description}</p>

                                <div tabIndex={index} class="focus:outline-none flex">
                                    {getStatus(file.files.status)}
                                </div>
                            </div>
                            <div className="w-full pt-4">
                                <div className="w-full rounded-2xl bg-white p-2">
                                    <Disclosure>
                                        {({ open }) => (
                                            <>
                                                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-100 px-4 py-2 text-left text-sm font-medium   focus:outline-none focus-visible:ring">
                                                    <span className='text-blue-900'>{file.files.status === 'rejected' ? 'Reason for rejection' : 'Reviews'}</span>
                                                    <ChevronUpIcon
                                                        className={`${open ? 'rotate-180 transform' : ''
                                                            } h-5 w-5 text-blue-900`}
                                                    />
                                                </Disclosure.Button>
                                                {file.files.status === 'reviewed' && file.files.reviews[0]?.map((review) => {

                                                    {
                                                        return review.comments.length > 0 ? review?.comments?.map((item, index) => {
                                                            return <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                                                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                                                    {item.review}
                                                                </ReactMarkdown>

                                                            </Disclosure.Panel>
                                                        }) : <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                                                            {'This review is not available for some reason'}
                                                        </Disclosure.Panel>
                                                    }

                                                })}

                                                {file.files.status === 'rejected' &&
                                                    <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                                                        {file.files.reason}
                                                    </Disclosure.Panel>
                                                }
                                            </>
                                        )}
                                    </Disclosure>

                                </div>
                            </div>
                        </div>
                    }) : <div className='w-full flex justify-center items-center h-full'><div className='p-[20%]'>No feedbacks to show at the moment</div></div>}
                </div>
            </div>
        </div>
    )
}

export default AuthorFeedback