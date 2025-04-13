import React, { useState, useEffect, Fragment } from 'react'
import { Listbox, Transition, Dialog } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react';
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const AdminAcceptedSubmission = () => {

    const [acceptModal, setAcceptModal] = useState(-1);
    const [people, setPeople] = useState([
        { name: 'Wade Cooper' },
        { name: 'Arlene Mccoy' },
        { name: 'Devon Webb' },
        { name: 'Tom Cook' },
        { name: 'Tanya Fox' },
        { name: 'Hellen Schmidt' },
    ])

    const [reviewers, setReviewers] = useState(null);
    const [loading, setLoading] = useState(-1);
    const [regenerateLoading, setRegenerateLoading] = useState(false);
    const [regenerateLoading2, setRegenerateLoading2] = useState(false);

    const [selectedFirst, setSelectedFirst] = useState({ name: 'None' })
    const [selectedSecond, setSelectedSecond] = useState({ name: 'None' })
    const [selectedThird, setSelectedThird] = useState({ name: 'None' })
    const [selectedNames, setSelectedNames] = useState([]);
    const [summary, setSummary] = useState('')
    const [plagiarism, setPlagiarism] = useState('')
    const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);
    const [isPlagiarism, setIsPlagiarism] = useState(false);

    function closeSummarizeModal() {
        setIsSummarizeOpen(false)
    }

    async function openSummarizeModal(file_id) {
        setIsSummarizeOpen(true)
        const response = await axios.post(
            `${process.env.API_URL}/api/user/summarize`,
            { file_id: file_id },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );

        setSummary(response.data)
        setRegenerateLoading(false);
    }

    function closePlagiarismModal() {
        setIsPlagiarism(false)
    }

    async function openPlagiarismModal(file_id) {
        setIsPlagiarism(true)
        const response = await axios.post(
            `${process.env.API_URL}/api/user/findPlagiarism`,
            { file_id: file_id },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );

        setPlagiarism(response.data)
        setRegenerateLoading2(false);
        
    }


    const [rejectFileId, setRejectFileId] = useState('');
    const [rejectAuthorId, setRejectedAuthorId] = useState('');
    const [reason, setReason] = useState('');

    const [isOpen, setIsOpen] = useState(false)
    const [allFiles, setAllFiles] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {

            const response = await axios.get(
                `${process.env.API_URL}/api/user/getFilesAcceptedAdmin`,
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
    }, [loading])

    useEffect(() => {

        const fetchData = async () => {
            const response = await axios.get(
                `${process.env.API_URL}/api/user/getAllReviewer`,
                {
                    headers: {
                        'Content-Type': "application/json",
                        authorization: `Bearer ${session?.user?.accessToken}`,
                    }
                }
            );

            const tempObj = [];
            response.data.map((user) => { tempObj.push({ name: user.name, id: user.id, count: user.files.length }) })

            tempObj.sort((a, b) => a.count - b.count);

            const nameObj = [];
            tempObj.map((user) => { nameObj.push({ name: user.name, id: user.id }) })

            setReviewers(nameObj)
        }

        fetchData()

    }, []);

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
            `${process.env.API_URL}/api/user/setRejectFileStatus`,
            { file_id: rejectFileId, author_id: rejectAuthorId, status: status, reason: reason },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        setLoading(-1);
    }

    const handleSelected1 = (value) => {
        setSelectedFirst({ name: value.name, id: value.id });
        setSelectedNames(prev => [...prev, value.name])
    }

    const handleSelected2 = (value) => {
        setSelectedSecond({ name: value.name, id: value.id })
        setSelectedNames(prev => [...prev, value.name])

    }

    const handleSelected3 = (value) => {
        setSelectedThird({ name: value.name, id: value.id })
        setSelectedNames(prev => [...prev, value.name])

    }

    const handleAssign = async (file_id, index) => {
        setLoading(index)
        const ids = [];

        selectedFirst.id && ids.push(selectedFirst.id)
        selectedSecond.id && ids.push(selectedSecond.id)
        selectedThird.id && ids.push(selectedThird.id)

        const response = await axios.post(
            `${process.env.API_URL}/api/user/assignFiles`,
            { file_id: file_id, userIds: ids },
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        setLoading(-1);
    }


    return (
        <>
            {allFiles && allFiles.length > 0 ? allFiles?.map((file, index) => {
                return <div aria-label="group of cards" tabindex="0" class="focus:outline-none py-8 w-full">
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

                                <div tabindex="0" class="focus:outline-none flex flex-row gap-4 my-4">
                                    <div class="py-2 px-4 text-xs leading-3 text-[#ffffff] rounded-md bg-[#3A974C] hover:cursor-pointer" onClick={(e) => { setAcceptModal(index); }}>Assign Reviewers</div>
                                    <div class="py-2 px-4 ml-3 text-xs leading-3 text-[#ffffff] rounded-md bg-[#b6472c] hover:cursor-pointer" onClick={() => { openModal(); setRejectFileId(file.files.file_id); setRejectedAuthorId(file.files.authorId) }}
                                    >Reject</div>
                                    <div className='py-2 px-4 text-xs leading-3 text-[#ffffff] rounded-md bg-[#3978ca] hover:cursor-pointer' onClick={() => { openSummarizeModal(file.files.file_id) }}><button>Summarize</button></div>
                                    <div className='py-2 px-4 text-xs leading-3 text-[#ffffff] rounded-md bg-[#3978ca] hover:cursor-pointer'><button onClick={()=>{openPlagiarismModal(file.files.file_id)}}>Get Plagiarism Result</button></div>
                                </div>
                            </div>}
                            {acceptModal === index && <div className=''>
                                <p className='py-4 px-2 text-sm leading-normal font-normal'>Select from a list of Reviewers</p>
                                <Listbox value={selectedFirst} onChange={handleSelected1}>
                                    <div className="relative mt-1">
                                        <p className=' px-2 text-sm leading-normal'>Reviewer 1</p>
                                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                                            <span className="block truncate">{selectedFirst.name}</span>
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
                                                {reviewers?.filter((item) => { return !selectedNames.includes(item.name) }).map((person, personIdx) => (
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
                                                {reviewers?.filter((item) => { return !selectedNames.includes(item.name) }).map((person, personIdx) => (
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
                                                {reviewers?.filter((item) => { return !selectedNames.includes(item.name) }).map((person, personIdx) => (
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

                                {loading !== index && <button className=' border-[0.5px] text-sm leading-normal font-normal rounded-md border-[#605BFF] p-2 text-[#605BFF] hover:bg-[#605BFF] hover:text-white' onClick={() => { handleAssign(file.files.file_id, index) }}><span className=''>Assign to reviewers</span></button>}
                                {loading === index && <div className='flex justify-center items-center gap-2 border-[0.5px] text-sm leading-normal font-normal rounded-md border-[#605BFF] p-2 text-[#605BFF] hover:bg-[#605BFF] hover:text-white'>
                                    <div className=''>Assigning to reviewers</div>
                                    <div
                                        className="inline-block h-4 w-4 mt-[0.1rem] animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                        role="status">

                                    </div>
                                </div>}

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
                                                                    onChange={(e) => { setReason(e.target.value) }}
                                                                />
                                                            </div>
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 flex justify-center">
                                                        {loading !== index && <button
                                                            type="button"
                                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                            onClick={(e) => { handleReject(e, 'rejected'); setLoading(index) }}
                                                        >

                                                            Reject and Send the reason for rejection
                                                        </button>}

                                                        {loading === index && <div className="inline-flex items-center gap-2 justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                                                            <div
                                                                className="inline-block h-4 w-4 mt-[0.1rem] animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                                                role="status">

                                                            </div>
                                                            <div>Sending your Review</div>
                                                        </div>}

                                                    </div>
                                                </Dialog.Panel>
                                            </Transition.Child>
                                        </div>
                                    </div>
                                </Dialog>
                            </Transition>

                            <Transition appear show={isSummarizeOpen} as={Fragment}>
                                <Dialog as="div" className="relative z-10" onClose={closeSummarizeModal}>
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
                                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                    <Dialog.Title
                                                        as="h3"
                                                        className="text-lg font-medium leading-6 text-gray-900"
                                                    >

                                                    </Dialog.Title>

                                                    <form >
                                                        {summary === '' ? <div>Hang in while AI generate the document summary for you</div> :
                                                            <div>
                                                                <ReactMarkdown
                                                                    rehypePlugins={[rehypeRaw]}
                                                                >
                                                                    {summary}
                                                                </ReactMarkdown>
                                                            </div>
                                                        }




                                                    </form>

                                                    <div className="mt-4 flex justify-center">
                                                        <button
                                                            type="submit"
                                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                            onClick={() => { setRegenerateLoading(true); openSummarizeModal(file.files.file_id) }}
                                                        >
                                                            {regenerateLoading && <svg aria-hidden="true" role="status" class="inline w-4 h-4 mt-[0.15rem] mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                                            </svg>}
                                                            Re-generate
                                                        </button>
                                                    </div>
                                                </Dialog.Panel>
                                            </Transition.Child>
                                        </div>
                                    </div>
                                </Dialog>
                            </Transition>

                            <Transition appear show={isPlagiarism} as={Fragment}>
                                <Dialog as="div" className="relative z-10" onClose={closePlagiarismModal}>
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
                                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                                    <Dialog.Title
                                                        as="h3"
                                                        className="text-lg font-medium leading-6 text-gray-900"
                                                    >

                                                    </Dialog.Title>

                                                    <form >
                                                        {plagiarism === '' ? <div>Hang in while AI finds the plagiarism score with reason for you</div> :
                                                            <div>
                                                                <ReactMarkdown
                                                                    rehypePlugins={[rehypeRaw]}
                                                                >
                                                                    {plagiarism}
                                                                </ReactMarkdown>
                                                            </div>
                                                        }




                                                    </form>

                                                    <div className="mt-4 flex justify-center">
                                                        <button
                                                            type="submit"
                                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                            onClick={() => { setRegenerateLoading2(true); openPlagiarismModal(file.files.file_id) }}
                                                        >
                                                            {regenerateLoading2 && <svg aria-hidden="true" role="status" class="inline w-4 h-4 mt-[0.15rem] mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                                            </svg>}
                                                            Re-generate
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
                </div>
            }) : <div className='w-full flex justify-center items-center h-full'><div className='p-[20%]'>No files present at the moment to assign it to reviewers</div></div>}
        </>
    )
}

export default AdminAcceptedSubmission