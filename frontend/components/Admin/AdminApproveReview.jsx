import React, { useState, useEffect, Fragment } from 'react'
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react'
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import CkEditor from '../../components/Editor/Editor'

const AdminApproveReview = () => {

    const [toApprove, setToApprove] = useState(null);
    const { data: session } = useSession();
    const [approveLoading, setApproveLoading] = useState(-1);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(-1);
    const [editReview, setEditReview] = useState('');
    const [editFileId, setEditFileId] = useState('');
    const [editReviewId, setEditReviewId] = useState('');
    const [editReviewName, setEditReviewName] = useState('');
    const [editReviewerId, setEditReviewerId] = useState('');
    const [isOpenReview, setIsOpenReview] = useState(false);

    useEffect(() => {

        const fetchData = async () => {

            const response = await axios.get(
                `${process.env.API_URL}/api/user/getAdminReviewFiles`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            console.log(response.data)
            setToApprove(response.data);

        }

        fetchData();

    }, [approveLoading, loadingEdit, loadingDelete])

    function closeModalReview() {
        setEditReview('');
        setEditFileId('');
        setEditReviewId('')
        setEditReviewName('');
        setIsOpenReview(false)
    }

    function openModalReview(review, file_id, review_id, name, reviewerId) {
        setEditReview(review);
        setEditFileId(file_id);
        setEditReviewId(review_id);
        setEditReviewName(name);
        setEditReviewerId(reviewerId)
        setIsOpenReview(true)
    }

    const handleApprove = async (files, index) => {
        setApproveLoading(index)

        const reviewObj = files.reviewers;
        const file_id = files.file_id;
        const author_id = files.authorId;

        const response = await axios.post(
            `${process.env.API_URL}/api/user/approveReview`,
            { file_id: file_id, author_id: author_id, reviewObject: reviewObj },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );

        setApproveLoading(-1);
    }

    const handleReviewChange = async(text) => {
        setEditReview(text);
    }

    const handleEdit = async () => {

        const reviewObj = { id: editReviewId, name: editReviewName, review: editReview }
        setLoadingEdit(true);

        const response = await axios.post(
            `${process.env.API_URL}/api/user/editAdminReviewerReview`,
            { fileId: editFileId, reviewerId: editReviewerId, reviewId: editReviewId, review: editReview },
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

    const handleDelete = async (index, fileId, reviewId, reviewerId) => {
        setLoadingDelete(index);
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
                <div aria-label="group of cards" tabindex="0" class="focus:outline-none py-8 w-full">

                    {toApprove && toApprove.length > 0 ? toApprove.map((item, index) => {
                        return <div class="lg:flex lg:flex-col items-center justify-center w-full">
                            <div tabindex="0" aria-label="card 1" class=" w-full mb-7 bg-white p-6 shadow rounded">

                                <div class="flex items-center">
                                    <div class="flex items-start justify-between w-full">
                                        <div class="pl-3">
                                            <p tabindex="0" class="focus:outline-none text-xl font-medium leading-5 text-gray-800 w-fit">{item.files.file_name}</p>
                                            <p tabindex="0" class="focus:outline-none text-sm leading-normal pt-2 text-[#BF83FF] hover:cursor-pointer w-fit">View file</p>
                                        </div>
                                        <button className='bg-white flex justify-center items-center gap-2 rounded-md text-sm px-3 py-2 text-black hover:bg-green-400 hover:text-white' onClick={() => { handleApprove(item.files, index) }}>
                                            {approveLoading === index &&
                                                <div
                                                    className="inline-block h-4 w-4 mt-[0.1rem] animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                                    role="status">

                                                </div>
                                            }
                                            {approveLoading === index ? 'Approving' : 'Approve'}
                                        </button>
                                    </div>
                                </div>
                                <div class="px-2">
                                    <p tabindex="0" class="focus:outline-none text-sm leading-5 py-4 text-gray-600">{item.files.file_description}</p>

                                    <div tabindex="0" class="focus:outline-none flex">
                                        <div class="py-2 px-4  text-xs leading-3 text-[#3db952] rounded-full bg-[#DCFCE7]">Admin Review</div>
                                    </div>
                                </div>

                                {item.files.reviewers.length > 0 && item.files.reviewers.map((reviewer, index) => {
                                    return <div className="w-full pt-4">
                                        <div className="w-full rounded-2xl bg-white p-2">
                                            <Disclosure>
                                                {({ open }) => (
                                                    <>
                                                        <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-100 px-4 py-2 text-left text-sm font-medium   focus:outline-none focus-visible:ring">
                                                            <span className='text-blue-900'>{reviewer.name}</span>
                                                            <ChevronUpIcon
                                                                className={`${open ? 'rotate-180 transform' : ''
                                                                    } h-5 w-5 text-blue-900`}
                                                            />
                                                        </Disclosure.Button>
                                                        <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                                                            <div className='flex flex-col gap-6'>
                                                                {reviewer.comments.length === 0 && <div>Review is pending from reviewer</div>}
                                                                {reviewer.comments.map((comment) => {
                                                                    return <div>
                                                                        <p>
                                                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                                                                {comment.review}
                                                                            </ReactMarkdown>
                                                                        </p>
                                                                        <div className='flex flex-row gap-2 mt-2'>
                                                                            <button className='bg-white text-[#3A974C] py-1 px-3 rounded hover:bg-[#3A974C] hover:text-white' onClick={() => { openModalReview(comment.review, item.files.file_id, comment.id, item.files.file_name, reviewer.id) }}>Edit</button>
                                                                            <button className='bg-white text-[#c93f3f] py-1 px-3 rounded hover:bg-[#c93f3f] hover:text-white' onClick={() => { handleDelete(index, item.files.file_id, comment.id, reviewer.id) }}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                })}


                                                            </div>
                                                        </Disclosure.Panel>
                                                    </>
                                                )}
                                            </Disclosure>
                                        </div>
                                    </div>
                                })}

                            </div>

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

                                                        {/* <div className='flex flex-row gap-10 items-center'>
                                                            <textarea
                                                                className="w-full rounded-lg border-gray-500 p-4 text-sm shadow-lg resize-y"
                                                                placeholder='Edit your review here'
                                                                value={editReview}
                                                                onChange={(e) => { setEditReview(e.target.value) }}
                                                            />
                                                        </div> */}
                                                        <CkEditor content={editReview} handleReviewChange={handleReviewChange} />

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
                    }) : <div className='w-full flex justify-center items-center h-full'><div className='p-[20%]'>No file reviews pending to approve at the moment</div></div>}
                </div>
            </div>
        </div>
    )
}

export default AdminApproveReview