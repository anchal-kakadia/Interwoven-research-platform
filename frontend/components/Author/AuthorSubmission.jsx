import React, { useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useSession } from 'next-auth/react';
import axios from "axios";

const AuthorSubmission = () => {

    const [isOpen, setIsOpen] = useState(false)
    const [isSubmissionOpen, setIsSubmissionOpen] = useState(false)
    const [fileId, setFileId] = useState('');
    const [file, setFile] = useState('');
    const [title, setTitle] = useState('');
    const [editFileName, setEditFileName] = useState('');
    const [editFileDescription, setEditFileDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [allFiles, setAllFiles] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(-1);
    const [description, setDescription] = useState('');
    const { data: session } = useSession();

    useEffect(() => {

        const fetchData = async () => {

            const data = await getAllFiles();
            setAllFiles(data);
        }

        fetchData()
    }, [loading, loadingDelete])

    const handleEditFileName = (e) => {
        setEditFileName(e.target.value)
    }

    const handleEditFileDescription = (e) => {
        setEditFileDescription(e.target.value)
    }

    function closeModal() {
        setIsOpen(false)
    }

    function openModal(fileId, filename, file_description) {
        setEditFileName(filename)
        setEditFileDescription(file_description)
        setFileId(fileId);
        setIsOpen(true)
    }

    function closeSubmissionModal() {
        setIsSubmissionOpen(false)
    }

    function openSubmissionModal() {
        setIsSubmissionOpen(true)
    }

    const handleFileSelect = (e) => {

        if (e.target.files[0].type !== 'application/pdf') {
            alert("Please upload a file in PDF Format")
        }
        else {
            setTitle(e.target.files[0].name);
            setFile(e.target.files[0]);
        }

    }

    const handleDescription = (e) => {
        setDescription(e.target.value);
    }

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", file);
        formData.append("description", description);
        formData.append("author_name", session.user.name);


        const response = await axios.post(
            `${process.env.API_URL}/api/user/uploadFile`,
            formData,
            {
                headers: {
                    'Content-Type': "multipart/form-data",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );

        setLoading(false);
        closeSubmissionModal();
    }

    const handleFileUpdate = async (e) => {
        setLoading(true)
        e.preventDefault();
        const response = await axios.post(
            `${process.env.API_URL}/api/user/updateFileDetails`,
            { file_id: fileId, updatedName: editFileName, updatedDescription: editFileDescription },
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

    const handleDeleteFile = async (e, fileId) => {
        e.preventDefault();
        const response = await axios.delete(
            `${process.env.API_URL}/api/user/deleteFile`,
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                },
                data: { file_id: fileId },
            }
        );

        setLoadingDelete(-1);
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

    const getAllFiles = async () => {

        const response = await axios.get(
            `${process.env.API_URL}/api/user/getFiles`,
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        return response.data;
    }


    const getStatus = (status) => {
        switch (status) {
            case 'pending':
                return <div class="py-2 px-4 text-xs leading-3 text-white rounded-full bg-slate-400">Not yet accepted</div>
                break;
            case 'inreview':
                return <div class="py-2 px-4 text-xs leading-3 text-[#f38063] rounded-full bg-[#FFF4DE]">In Review</div>
                break
            case 'accepted':
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

            <div class="flex items-center justify-start w-full py-10 ">
                <button className='bg-white shadow rounded-md text-zinc-900 font-normal px-2 py-3' onClick={openSubmissionModal}>Add Submission</button>
            </div>

            {allFiles && allFiles.length > 0 ? allFiles.map((file, index) => {
                return <div aria-label="group of cards" tabindex="0" class="focus:outline-none w-full">
                    <div class="lg:flex lg:flex-col items-center justify-center w-full">
                        <div tabIndex={index} aria-label="card 1" class=" w-full mb-7 bg-white p-6 shadow rounded">

                            <div class="flex items-center">
                                <div class="flex items-start justify-between w-full">
                                    <div class="pl-3">
                                        <p tabIndex={index} class="focus:outline-none text-xl font-medium leading-5 text-gray-800 w-fit">{file.files.file_name}</p>
                                        <p tabIndex={index} class="focus:outline-none text-sm leading-normal pt-2 text-[#BF83FF] hover:cursor-pointer w-fit" onClick={(e) => { handleGetFile(e, file.files.file_id) }}>View file</p>
                                    </div>

                                    {file.files.status === "pending" && <div className='flex flex-row gap-5 '>
                                        <div className=' hover:cursor-pointer' onClick={() => { openModal(file.files.file_id, file.files.file_name, file.files.file_description) }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </div>
                                        <div className='flex flex-row gap-2 items-center hover:cursor-pointer' onClick={(e) => { setLoadingDelete(index); handleDeleteFile(e, file.files.file_id) }}>

                                            {loadingDelete === index && <><div
                                                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-secondary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                                role="status">
                                            </div>
                                            <div>Deleting file</div></>}

                                            {loadingDelete === -1 && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>}
                                        </div>
                                    </div>}

                                </div>
                            </div>
                            <div class="px-2">
                                <p tabIndex={index} class="focus:outline-none text-sm leading-5 py-4 text-gray-600">{file.files.file_description}</p>

                                <div tabIndex={index} class="focus:outline-none flex">
                                    {getStatus(file.files.status)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }) : <div className='w-full flex justify-center items-center h-full'><div className='p-[20%]'>No submissions to show at the moment</div></div>}

            <Transition appear show={isOpen} as={Fragment} >
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
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Edit file details
                                    </Dialog.Title>
                                    <div className="mt-2 flex gap-4 flex-col">

                                        <div className='flex flex-row gap-10 items-center'>
                                            <label className='w-[20%]'>File name</label>
                                            <input
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder='Enter updated file name'
                                                value={editFileName}
                                                onChange={(e) => { handleEditFileName(e) }}
                                            />
                                        </div>
                                        <div className='flex flex-row gap-10 items-center'>
                                            <label className='w-[20%]'>Description</label>
                                            <input
                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                placeholder='Enter updated description'
                                                value={editFileDescription}
                                                onChange={(e) => { handleEditFileDescription(e) }}

                                            />
                                        </div>

                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={(e) => { handleFileUpdate(e) }}
                                        >
                                            {loading && <svg aria-hidden="true" role="status" class="inline w-4 h-4 mt-[0.15rem] mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                            </svg>}
                                            Save
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={isSubmissionOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeSubmissionModal}>
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
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >

                                    </Dialog.Title>

                                    <form >

                                        <div className="mt-2 flex gap-4 flex-col">
                                            <label for="file-input" class="sr-only">Choose file</label>
                                            <input type="file" name="file-input" id="file-input" class="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600
    file:bg-gray-100 file:border-0
    file:me-4
    file:py-3 file:px-4
    dark:file:bg-gray-700 dark:file:text-gray-400" onChange={(e) => { handleFileSelect(e) }} />

                                            <input id="dropzone-file" type="file" class="hidden" />
                                            <div className='flex flex-row gap-10 items-center'>
                                                <label className='w-[20%]'>Description</label>
                                                <input
                                                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                    placeholder='Enter some description'
                                                    onChange={(e) => { handleDescription(e) }}
                                                />
                                            </div>

                                        </div>
                                    </form>

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={handleSubmit}
                                        >
                                            {loading && <svg aria-hidden="true" role="status" class="inline w-4 h-4 mt-[0.15rem] mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                            </svg>}
                                            Submit
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

export default AuthorSubmission