import moment from "moment";
import { useEffect, useState } from "react";

export default function Transaction({ type, status, from, to, createdAt, amount }) {

    const [user,  setUser] = useState();

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('luvo_driver') || null))
    }, [])

    return (
        <div className='flex justify-between items-center p-4 bg-white border border-neutral-200 rounded-md'>
            <div className='space-y-2'>
                <p className='font-bold text-xs capitalize'>{
                    type === "refund" 
                    ? "Refund" : type === "withdrawal"
                    ? "Withdrawal" :  user?.role === "customer"
                    ? to.fullname : from?.fullname
                }</p>

                {type === "pay" && <p className='text-xs text-neutral-800'>
                    {user?.role === "customer" ? to.tag : from.tag}
                </p>}

                <p className='text-xs text-gray-400'>{moment(createdAt).format('DD-MM-YYYY HH:mm')}</p>
            </div>
                

            {user?.role === "driver" &&
                <div className=''>
                    { 
                        type !== "funding" &&
                        (type !== "pay")
                        ? <p className='font-bold text-sm text-red-400 uppercase'>-&#8358;{(amount || 0).toLocaleString()}</p>
                        : <p className='font-bold text-sm text-green-400 uppercase'>+&#8358;{(amount || 0).toLocaleString()}</p>
                    }
                </div>
            }
        </div>
    );
}