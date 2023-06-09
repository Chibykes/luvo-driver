import Button from '@/components/Button';
import Input from '@/components/Input';
import Navbar from '@/components/Navbar';
import fetchData from '@/hooks/fetchData';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { GiMoneyStack } from 'react-icons/gi';



export default function Dashboard() {

  let controller;
  const router = useRouter();
  
  const [form, setForm] = useState({ });
  const [user, setUser] = useState({ });

  const [showConfirm, setShowConfirm] = useState(false);
  const [transTag, setTransTag] = useState('');
  const [tagError, setTagError] = useState(false);
  const [tagSuccess, setTagSuccess] = useState(false);

  const [loading, setLoading] = useState(false);


  const searchTag = async( tag ) => {
    
    controller?.abort();
    
    setForm({...form, tag: tag.search(/^@/) === 0 ? tag : '@'+tag });
    if(tag === "@" || !tag) return; 
    
    controller = new AbortController();
    let signal = controller.signal;

    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { tag, role: "driver" },
      signal
    }

    const { status, data } = await fetchData('/api/validate', options);

    if(data){
      setForm({ ...form, tag: tag, company: data.company });
      setTagError(false);
      setTagSuccess(true);
      return;
    }

    setTagError(true);
    setTagSuccess(false);
    return;
    
  }


  const handlePay = async() => {
    setLoading(true);
    localStorage.setItem('ongoing_transc', JSON.stringify(form));
    
    const options = {
      method: 'POST',
      body: form
    }

    const { status, data } = await fetchData('/api/pay', options);
    if(status === 0){
       return router.push('/login');
    }

    setLoading(false);
    if(status === 2){
      router.push('/success');
    }

  }

  useEffect(() => {
    searchTag(transTag);
  }, [transTag]);

  useEffect(() => {
    (async() => {
      const { user } = await fetchData('/api/user');
      if(user) localStorage.setItem('luvo_driver', JSON.stringify(user));
      setUser(user);
    })();
  }, [])


  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-md mx-auto h-screen flex flex-col p-4 gap-4 bg-neutral-50">


        <Navbar 
          text="Pay"
        />

        
        <div className='space-y-3 bg-white '>

          <Input
            name="tag"
            placeholder="Transport tag"
            setTransTag={setTransTag}
            onChange={(e) => searchTag(e.target.value)}
            value={(form.tag || '').search(/^@/) === 0 ? form.tag || '' : '@'+ (form.tag || '')}
            error={tagError && 'Transport Name not found'}
            success={tagSuccess && ('Valid tag: '+ form.company)}
            allowScan
            required
          />

          <Input
            name="amount"
            placeholder="Amount to be paid"
            onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value.replace(/[^\d]/ig, '') })}
            value={`₦ ${parseInt(form.amount||0).toLocaleString()}`}
            error={form?.amount && Number(form?.amount) > (user?.balance || 0) && 'Not Enough Balance'}
            success={form?.amount && Number(form?.amount) <= (user?.balance || 0) && ('New Balance: ₦'+ ((user?.balance || 0) - Number(form.amount)).toLocaleString())}
            validateBalance
            required
          />

          <Input
            name="destination"
            placeholder="Destination (optional)"
            onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
          />

          <Button 
            icon={GiMoneyStack}
            text="Pay"
            onClick={() => setShowConfirm(true)}
          />

        </div>


        {showConfirm && <div className='fixed top-0 left-0 w-full h-full bg-black opacity-20' onClick={() => setShowConfirm(false)}></div>}
        <div className={`${!showConfirm ? '-bottom-full' : 'bottom-0'} fixed left-0 w-full h-auto p-6 rounded-t-2xl bg-white space-y-4 py-12 duration-200`}>
          <p className='font-bold text-center'>Confirmation</p>

          <div className='flex items-center justify-between'>
            <p className='text-xs font-bold'>Payment To</p>
            <p className='text-xs font-bold text-green-400'>{form?.company}</p>
          </div>

          <div className='flex items-center justify-between'>
            <p className='text-xs font-bold'>Amount</p>
            <p className='text-xs font-bold text-green-400'>&#8358; {(form?.amount)?.toLocaleString()}</p>
          </div>

          <div className='flex items-center justify-between'>
            <p className='text-xs font-bold'>Destination</p>
            <p className='text-xs font-bold text-green-400'>{form?.destination}</p>
          </div>


          <Button 
            text="Confirm"
            onClick={handlePay}
            loading={loading}
          />

        </div>
        
      </main>
    </>
  )
}
