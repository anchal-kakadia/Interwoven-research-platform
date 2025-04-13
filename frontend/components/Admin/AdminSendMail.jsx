import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';

const AdminSendMail = () => {

    const [email, setEmail] = useState();
    const { data: session } = useSession();


    const handleSendEmail = async (e) => {

        const response = await axios.post(`${process.env.API_URL}/api/user/sendInviteEmail`, 
        { email_id: email},
        {
            headers: {
                'Content-Type': "application/json",
                authorization: `Bearer ${session?.user?.accessToken}`,
            }
        })
    }

    return (
        <div className='w-full flex justify-center py-10 '>
            <div class="rounded-lg shadow-lg flex-col w-5/6 sm:max-w-2xl px-6 m-4 bg-white">
                <div class="px-5 py-3 mb-3 text-3xl font-medium text-gray-800 mt-6">
                    <div class="">Invite reviewers to the platform</div>
                </div>
                <div class="grid grid-cols-1 gap-5 md:gap-8 mt-5">
                    <div class="w-full">
                        <label class="md:text-sm text-xs text-gray-600 text-light font-semibold">Email Address</label>
                        <input class="py-2 px-3 rounded-lg border-2 mt-1 focus:outline-none w-full" type="email"
                            placeholder="eg. name@gmail.com" onChange={(e)=>{setEmail(e.target.value)}}/>
                    </div>
                </div>
                <div class="w-full flex flex-col sm:flex-row justify-end sm:justify-end space-y-4 sm:space-x-0 items-center my-6" onClick={handleSendEmail}>
                    <div class="py-2 px-8 bg-[#5D5FEF] rounded-full text-gray-300 hover:text-white cursor-pointer">Invite</div>
                </div>
            </div>
        </div>
    )
}

export default AdminSendMail