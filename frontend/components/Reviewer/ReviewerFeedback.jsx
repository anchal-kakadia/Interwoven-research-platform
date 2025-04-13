import React, { useState, useEffect, Fragment } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { Dialog, Transition } from '@headlessui/react'
import { useSession } from 'next-auth/react';
import CkEditor from '../../components/Editor/Editor'
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';

import axios from 'axios'

const ReviewerFeedback = () => {

    const [isOpen, setIsOpen] = useState(false)
    const [isOpenReview, setIsOpenReview] = useState(false);
    const [editReview, setEditReview] = useState('');
    const [editFileId, setEditFileId] = useState('');
    const [editReviewId, setEditReviewId] = useState('');
    const [editReviewName, setEditReviewName] = useState('');
    const [editReviewerId, setEditReviewerId] = useState('');

    const [reviewId, setReviewId] = useState('');
    const [review, setReview] = useState(null);
    const [fileId, setFileId] = useState('');
    const [reviewers, setReviewers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(-1);

    const [sendReviewLoading, setSendReviewLoading] = useState(-1);
    const { data: session } = useSession();

    useEffect(() => {

        const getAllFiles = async () => {

            const response = await axios.get(
                `${process.env.API_URL}/api/user/getFilesReviewer`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            console.log(response.data);
            setReviewers(response.data);
        }

        getAllFiles()

    }, [loading, loadingEdit, loadingDelete, sendReviewLoading])

    function closeModal() {
        setFileId('');
        setReviewId('');
        setIsOpen(false)
    }

    function openModal(file_id, reviewId) {
        setFileId(file_id);
        setReviewId(reviewId)
        setIsOpen(true)
    }

    function closeModalReview() {
        setEditReview('');
        setEditFileId('');
        setEditReviewId('')
        setEditReviewName('');
        setIsOpenReview(false);
        setEditReviewerId('');
    }

    function openModalReview(review, file_id, review_id, name, reviewerId) {
        setEditReview(review);
        setEditFileId(file_id);
        setEditReviewId(review_id)
        setEditReviewName(name);
        setIsOpenReview(true);
        setEditReviewerId(reviewerId)
    }

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

    const handleReviewChange = async(text) => {
        setReview(text);
    }

    const handleAddReview = async (e) => {

        setLoading(true);
        const response = await axios.post(
            `${process.env.API_URL}/api/user/addReview`,
            { file_id: fileId, review_id: reviewId, review: review },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        setLoading(false);
        closeModal();
    }

    const handleSendReview = async (details, fileId, index) => {
        setSendReviewLoading(index);
        console.log(details)
        const response = await axios.post(
            `${process.env.API_URL}/api/user/sendReview`,
            { file_id: fileId, reviewDetails: details },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        setSendReviewLoading(-1);
    }

    //handleEdit(review.files.file_name,review.files.file_id,item.id
    const handleEdit = async () => {

        const reviewObj = { id: editReviewId, name: editReviewName, review: editReview }
        setLoadingEdit(true);
        const response = await axios.post(
            `${process.env.API_URL}/api/user/editReviewerReview`,
            { fileId: editFileId, reviewerId: editReviewerId, updatedReviewData: reviewObj },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        setLoadingEdit(false);
        closeModalReview();
    }

    const handleDelete = async (fileId, reviewId, reviewerId) => {
        const response = await axios.delete(
            `${process.env.API_URL}/api/user/deleteReviewerReview`,
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                },
                data: { fileId: fileId, reviewId: reviewId, reviewerId: reviewerId },
            }
        );
        setLoadingDelete(-1);
    }

    return (
        <div>
            <div className='flex flex-col justify-center items-center w-full'>

                {reviewers && reviewers.map((review, index) => {
                    return <div aria-label="group of cards" tabindex="0" class="focus:outline-none py-8 w-full">
                        <div class="lg:flex lg:flex-col items-center justify-center w-full">
                            <div tabindex="0" aria-label="card 1" class=" w-full mb-7 bg-white p-6 shadow rounded">

                                <div class="flex items-center">
                                    <div class="flex items-start justify-between w-full">
                                        <div class="pl-3">
                                            <p tabindex="0" class="focus:outline-none text-xl font-medium leading-5 text-gray-800 w-fit">{review.files.file_name}</p>
                                            <p tabindex="0" class="focus:outline-none text-sm leading-normal pt-2 text-[#BF83FF] hover:cursor-pointer w-fit" onClick={(e) => { handleGetFile(e, file.files.file_id) }}>View file</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="px-2">
                                    <p tabindex="0" class="focus:outline-none ml-1 text-sm leading-5 py-4 text-gray-600">{review.files.file_description}</p>

                                    <div tabindex="0" class="focus:outline-none flex">
                                        {sendReviewLoading === -1 && <button className='text-sm leading-5 text-[#3A974C] bg-white hover:bg-[#3A974C] hover:text-white px-4 py-2 rounded' onClick={() => { handleSendReview(review.files.reviewers[0].comments, review.files.file_id, index) }}>Send your Reviews</button>}
                                        {sendReviewLoading === index && <div className='flex items-center gap-2 text-sm leading-5 text-[#3A974C] bg-white hover:bg-[#3A974C] hover:text-white px-4 py-2 rounded'>
                                            <div
                                                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-success motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                                role="status">

                                            </div>
                                            Sending your Reviews</div>}

                                        <button className='text-sm leading-5 text-[#5B93FF] bg-white hover:bg-[#5B93FF] hover:text-white px-4 py-2 rounded' onClick={() => { openModal(review.files.file_id, review.files.reviewers[0].id) }}>Add Review</button>

                                    </div>
                                </div>
                                {review.files.reviewers[0].comments.length > 0 && <div className="w-full pt-4">
                                    <div className="w-full rounded-2xl bg-white p-2">
                                        <Disclosure>
                                            {({ open }) => (
                                                <>
                                                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-100 px-4 py-2 text-left text-sm font-medium   focus:outline-none focus-visible:ring">
                                                        <span className='text-blue-900'>Your Reviews</span>
                                                        <ChevronUpIcon
                                                            className={`${open ? 'rotate-180 transform' : ''
                                                                } h-5 w-5 text-blue-900`}
                                                        />
                                                    </Disclosure.Button>
                                                    <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                                                        <div className='flex flex-col gap-6'>


                                                            {review.files.reviewers[0].comments.map((item) => {
                                                                return <div ><p>
                                                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                                                        {item.review}
                                                                    </ReactMarkdown>
                                                                </p>
                                                                    <div className='flex flex-row gap-2 mt-2'>
                                                                        <button className='bg-white text-[#3A974C] py-1 px-3 rounded hover:bg-[#3A974C] hover:text-white' onClick={() => { openModalReview(item.review, review.files.file_id, item.id, review.files.file_name, review.files.reviewers[0].id) }}>Edit</button>
                                                                        <button className='flex items-center gap-2 bg-white text-[#c93f3f] py-1 px-3 rounded hover:bg-[#c93f3f] hover:text-white' onClick={() => { setLoadingDelete(index); handleDelete(review.files.file_id, item.id, review.files.reviewers[0].id) }}>
                                                                            {loadingDelete === index && <div
                                                                                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-danger motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                                                                role="status">

                                                                            </div>}
                                                                            {loadingDelete === index ? 'Deleting' : 'Delete'}
                                                                        </button>
                                                                    </div></div>
                                                            })}
                                                        </div>
                                                    </Disclosure.Panel>
                                                </>
                                            )}
                                        </Disclosure>

                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                })}


            </div>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg text-center font-medium leading-6 text-gray-900"
                                    >
                                        Give your review
                                    </Dialog.Title>
                                    <div className=" my-10 flex gap-4 flex-col">

                                        <div className='flex flex-row gap-10 items-center'>
                                            {/* <textarea
                                                className="w-full rounded-lg border-gray-500 p-4 text-sm shadow-lg resize-y"
                                                placeholder='Enter your review here'
                                                onChange={(e) => { setReview(e.target.value) }}
                                            /> */}
                                            <CkEditor content={editReview} handleReviewChange={handleReviewChange} />

                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={(e) => { handleAddReview(e) }}
                                        >
                                            {loading && <svg aria-hidden="true" role="status" class="inline w-4 h-4 mt-[0.15rem] mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                            </svg>}
                                            {loading ? 'Saving' : 'Save'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={isOpenReview} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeModalReview}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg text-center font-medium leading-6 text-gray-900"
                                    >
                                        Edit your review
                                    </Dialog.Title>
                                    <div className=" my-10 flex gap-4 flex-col">

                                        <div className='flex flex-row gap-10 items-center'>
                                            {/* <textarea
                                                className="w-full rounded-lg border-gray-500 p-4 text-sm shadow-lg resize-y"
                                                placeholder='Edit your review here'
                                                value={editReview}
                                                onChange={(e) => { setEditReview(e.target.value) }}
                                            /> */}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            type="button"
                                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={(e) => { handleEdit(e) }}
                                        >
                                            {loadingEdit && <svg aria-hidden="true" role="status" class="inline w-4 h-4 mt-[0.15rem] mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                            </svg>}
                                            {loadingEdit ? 'Saving' : 'Save'}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}

export default ReviewerFeedback