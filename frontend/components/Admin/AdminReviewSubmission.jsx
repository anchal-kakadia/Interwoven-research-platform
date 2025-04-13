import React, { useState, useEffect, Fragment } from 'react'
import { Listbox, Transition, Dialog } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { useSession } from 'next-auth/react';
import axios from "axios";

const AdminReviewSubmission = () => {

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
                `${process.env.API_URL}/api/user/getFilesAdmin`,
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

    const handleFileStatus = async (e,file_id,author_id, status) => {
        e.preventDefault();
        setLoading(true);
        const response = await axios.post(
            `${process.env.API_URL}/api/user/setFileStatus`,
            { file_id: file_id, author_id: author_id, status: status},
            {
                headers: {
                    'Content-Type': "application/json",
                    authorization: `Bearer ${session?.user?.accessToken}`,
                }
            }
        );
        setLoading(false);
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
            {allFiles && allFiles.length > 0 ? allFiles?.map((file,index)=>{ return <div aria-label="group of cards" tabindex="0" class="focus:outline-none py-8 w-full">
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

                            <div tabindex="0" class="focus:outline-none flex my-4">
                                <div class="py-2 px-4 text-xs leading-3 text-[#ffffff] rounded-md bg-[#3A974C] hover:cursor-pointer" onClick={(e) => {handleFileStatus(e,file.files.file_id,file.files.authorId,'accepted');}}>Accept</div>
                                <div class="py-2 px-4 ml-3 text-xs leading-3 text-[#ffffff] rounded-md bg-[#b6472c] hover:cursor-pointer" onClick={()=>{openModal(); setRejectFileId(file.files.file_id); setRejectedAuthorId(file.files.authorId)}}
                                >Reject</div>
                            </div>
                        </div>}
                        
                    </div>
                </div>
            </div>}) : <div className='w-full flex justify-center items-center h-full'><div className='p-[20%]'>No files to review at the moment</div></div>}
        </>
    )
}

export default AdminReviewSubmission