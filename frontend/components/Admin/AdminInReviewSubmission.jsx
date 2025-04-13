import React, { useState, useEffect, Fragment } from 'react'
import { Listbox, Transition, Dialog } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react';
import axios from "axios";

const AdminInReviewSubmission = () => {

    const [acceptModal, setAcceptModal] = useState(-1);
    const [people, setPeople] = useState([
        { name: 'Wade Cooper' },
        { name: 'Arlene Mccoy' },
        { name: 'Devon Webb' },
        { name: 'Tom Cook' },
        { name: 'Tanya Fox' },
        { name: 'Hellen Schmidt' },
    ])

    const [reviewers,setReviewers] = useState(null);
    const [loading,setLoading] = useState(-1);
    const [selectedFirst, setSelectedFirst] = useState({name:'None'})
    const [selectedSecond, setSelectedSecond] = useState({name:'None'})
    const [selectedThird, setSelectedThird] = useState({name:'None'})
    const [selectedNames,setSelectedNames] = useState([]);

    const [rejectFileId,setRejectFileId] = useState('');
    const [rejectAuthorId, setRejectedAuthorId] = useState('');
    const [reason,setReason] = useState('');

    const [isOpen, setIsOpen] = useState(false)
    const [allFiles, setAllFiles] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {

            const response = await axios.get(
                `${process.env.API_URL}/api/user/getFilesInReviewAdmin`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            console.log(response.data);
            setAllFiles(response.data);
        }

        fetchData()
    }, [])

    useEffect(()=>{

        const fetchData = async() => {
            const response = await axios.get(
                `${process.env.API_URL}/api/user/getAllReviewer`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            
            const nameObj = [];
            response.data.map((user)=>{ nameObj.push({name: user.name, id: user.id})})
            
            setReviewers(nameObj)
        }

        fetchData()
        
    },[]);

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
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

    const handleReject = async (e, status) => {
        e.preventDefault();
        const response = await axios.post(
            `${process.env.API_URL}/api/user/sendEmail`,
            { file_id: rejectFileId, author_id: rejectAuthorId, status: status, reason: reason},
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
    }

    const handleSelected1 = (value) => {
        setSelectedFirst({name: value.name, id:value.id});
        setSelectedNames(prev=>[...prev,value.name])
    }

    const handleSelected2 = (value) => {
        setSelectedSecond({name: value.name, id:value.id})
        setSelectedNames(prev=>[...prev,value.name])

    }

    const handleSelected3 = (value) => {
        setSelectedThird({name: value.name, id:value.id})
        setSelectedNames(prev=>[...prev,value.name])

    }

    const handleAssign = async (file_id,index) => {
        setLoading(index)
        const ids = [];

        selectedFirst.id && ids.push(selectedFirst.id)
        selectedSecond.id && ids.push(selectedSecond.id)
        selectedThird.id && ids.push(selectedThird.id)

        const response = await axios.post(
            `${process.env.API_URL}/api/user/assignFiles`,
            {file_id : file_id, userIds : ids},
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
    }


    return (
        <>
            {allFiles && allFiles?.map((file,index)=>{ return <div aria-label="group of cards" tabindex="0" class="focus:outline-none py-8 w-full">
                <div class="lg:flex lg:flex-col items-center justify-center w-full">
                    <div tabindex="0" aria-label="card 1" class=" w-full mb-7 bg-white px-6 pt-6 shadow rounded">

                        <div class="flex items-center">
                            <div class="flex items-start justify-between w-full">
                                <div class="pl-3">
                                    <p tabindex="0" class="focus:outline-none text-xl font-medium leading-5 text-gray-800 w-fit">{file.files.file_name}</p>
                                    <p tabindex="0" class="focus:outline-none text-sm leading-normal pt-2 text-[#BF83FF] hover:cursor-pointer w-fit" onClick={(e) => { handleGetFile(e, file.files.file_id) }}>View file</p>
                                </div>
                                <div>{`By ${file.files.author}`}</div>
                            </div>
                        </div>
                        {acceptModal === -1 && <div class="px-2">
                            <p tabindex="0" class="focus:outline-none text-sm leading-5 py-4 text-gray-600">{file.files.file_description}</p>

                            {/* <div tabindex="0" class="focus:outline-none flex my-4">
                                <div class="py-2 px-4 text-xs leading-3 text-[#ffffff] rounded-md bg-[#3A974C] hover:cursor-pointer" onClick={(e) => { setAcceptModal(index); }}>Assign Reviewers</div>
                                <div class="py-2 px-4 ml-3 text-xs leading-3 text-[#ffffff] rounded-md bg-[#b6472c] hover:cursor-pointer" onClick={()=>{openModal(); setRejectFileId(file.files.file_id); setRejectedAuthorId(file.files.authorId)}}
                                >Reject</div>
                            </div> */}
                        </div>}
                        {file.files.reviewers && file.files.reviewers[0] && <div className='py-2'>
                            <Listbox>
                                <div className="relative mt-1">
                                    <p className=' px-2 text-sm leading-normal'>Reviewer 1</p>
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span className="block truncate">{file.files.reviewers[0].name}</span>
                                        
                                    </Listbox.Button>
                                    
                                </div>
                            </Listbox>
                        </div>}

                        {file.files.reviewers && file.files.reviewers[1] && <div className='py-2'>
                            <Listbox>
                                <div className="relative mt-1">
                                    <p className=' px-2 text-sm leading-normal'>Reviewer 2</p>
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span className="block truncate">{file.files.reviewers[1].name}</span>
                                        
                                    </Listbox.Button>
                                    
                                </div>
                            </Listbox>
                        </div>}

                        {file.files.reviewers && file.files.reviewers[2] && <div className='py-2'>
                            <Listbox>
                                <div className="relative mt-1">
                                    <p className=' px-2 text-sm leading-normal'>Reviewer 3</p>
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span className="block truncate">{file.files.reviewers[2].name}</span>
                                        
                                    </Listbox.Button>
                                    
                                </div>
                            </Listbox>
                        </div>}

                        {acceptModal === index && <div className=''>
                            <Listbox value={selectedSecond} onChange={handleSelected2}>
                                <div className="relative mt-4">
                                    <p className=' px-2 text-sm leading-normal'>Reviewer 2</p>
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span className="block truncate">{selectedSecond.name}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                    >
                                        <Listbox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                            {reviewers.filter((item)=>{ return !selectedNames.includes(item.name)}).map((person, personIdx) => (
                                                <Listbox.Option
                                                    key={personIdx}
                                                    className={({ active }) =>
                                                        `  relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={person}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            
                                                            <span
                                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                    }`}
                                                            >
                                                                {person.name}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>}

                        {acceptModal === index && <div className=''>
                            <Listbox value={selectedThird} onChange={handleSelected3}>
                                <div className="relative mt-4">
                                    <p className=' px-2 text-sm leading-normal'>Reviewer 3</p>
                                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                        <span className="block truncate">{selectedThird.name}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronUpDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Listbox.Button>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                            {reviewers.filter((item)=>{ return !selectedNames.includes(item.name)}).map((person, personIdx) => (
                                                <Listbox.Option
                                                    key={personIdx}
                                                    className={({ active }) =>
                                                        `z-10 relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={person}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span
                                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                    }`}
                                                            >
                                                                {person.name}
                                                            </span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                        </div>}
                        {acceptModal === index && <div className='w-full my-6 flex flex-row gap-4'>

                            <button className=' border-[0.5px] text-sm leading-normal font-normal rounded-md border-[#605BFF] p-2 text-[#605BFF] hover:bg-[#605BFF] hover:text-white' onClick={()=>{handleAssign(file.files.file_id,index)}}><span className=''>Assign to reviewers</span></button>
                            <button className=' border-[0.5px] text-sm leading-normal font-normal rounded-md border-[#5b8fff] p-2 text-[#5b8fff] hover:bg-[#5b8fff] hover:text-white' onClick={() => { setAcceptModal(-1) }}>Go back</button>

                        </div>}
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
                                                    Please provide a reason for rejection
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        <div className='flex flex-row gap-10 items-center'>
                                                            <input
                                                                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                                                                placeholder='Please enter reason of rejection'
                                                                onChange={(e)=>{setReason(e.target.value)}}
                                                            />
                                                        </div>
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex justify-center">
                                                    <button
                                                        type="button"
                                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                        onClick={(e)=>{handleReject(e, 'rejected')}}
                                                    >
                                                        Reject and Send the reason for rejection
                                                    </button>
                                                </div>
                                            </Dialog.Panel>
                                        </Transition.Child>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </div>
                </div>
            </div>})}
        </>
    )
}

export default AdminInReviewSubmission