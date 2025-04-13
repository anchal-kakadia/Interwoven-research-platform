import React, { useEffect, useState, Fragment } from 'react'
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Listbox, Transition, Dialog } from '@headlessui/react'

const AdminAuthorList = () => {

    const [reviewers, setReviewers] = useState(null);
    const [isOpen, setIsOpen] = useState(false)
    const [name,setName] = useState('');
    const [id,setId] = useState('');
    const [loading,setLoading] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {

        const fetchData = async () => {
            const response = await axios.get(
                `${process.env.API_URL}/api/user/getAllAuthor`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            setReviewers(response.data)
        }

        fetchData()

    }, [loading]);

    function closeModal() {
        setName('');
        setId('');
        setIsOpen(false)
    }

    function openModal(name,id) {
        setName(name);
        setId(id)
        setIsOpen(true)
    }


    const handleRevertRole = async () => {
        setLoading(true);
        const response = await axios.post(
            `${process.env.API_URL}/api/user/changeRole`,
            { userId: id},
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

    return (
        <div>
            <div class="bg-white p-8 rounded-md w-full m-5 shadow-md">
                <div class=" flex items-center justify-end pb-6">
                    <div class="flex items-center justify-between shadow">
                        <div class="flex bg-gray-50 items-center p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clip-rule="evenodd" />
                            </svg>
                            <input class="bg-gray-50 outline-none ml-1 block " type="text" name="" id="" placeholder="search authors" />
                        </div>
                    </div>
                </div>
                <div>
                    <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div class="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            <table class="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th
                                            class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th
                                            class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Username
                                        </th>
                                    
                                        <th
                                            class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Send mail
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviewers && reviewers?.map((reviewer) => {
                                        return <tr>
                                            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <div class="flex items-center">
                                                    <div class="">
                                                        <p class="text-gray-900 whitespace-no-wrap">
                                                            {reviewer.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p class="text-gray-900 whitespace-no-wrap">{reviewer.username}</p>
                                            </td>
                                            
                                            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <button className='m-2 p-2 rounded bg-white text-[#5D5FEF] hover:bg-[#5D5FEF] hover:text-white'>Send mail</button>

                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {`Are you sure you want to revert ${name}'s role to author?`}
                                    </Dialog.Title>
                                    

                                    <div className="mt-4 flex justify-center">
                                        {loading === false && <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={(e) => { handleRevertRole(); }}
                                        >

                                            Yes
                                        </button>}

                                        {loading === true && <div className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                            <div
                                                className="inline-block h-4 w-4 mt-[0.1rem] animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                                role="status">

                                            </div>
                                            <div>Reverting role</div>
                                        </div>}

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

export default AdminAuthorList