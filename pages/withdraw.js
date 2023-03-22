import Button from '@/components/Button';
import Input from '@/components/Input';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import Script from 'next/script';
import { GiMoneyStack } from 'react-icons/gi';
import { useRouter } from 'next/router';
import fetchData from '@/hooks/fetchData';
import Navbar from '@/components/Navbar';
import Select from '@/components/Select';



export default function Withdraw({ banks }) {

  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState();

  const [amount, setAmount] = useState();
  const [user, setUser] = useState({});
  const [reference, setReference] = useState({});

  async function payWithPaystack(e) {
    e.preventDefault();

    let details = {
      email: user?.email,
      amount: Number(amount) * 100,
      ref: 'T'+new Date().getTime(),
    }

    let body = {
      type: "funding",
      amount: Number(amount),
      reference: details.ref,
    }

    const options = {
      method: 'POST',
      body
    }

    localStorage.setItem('ongoing_transc', JSON.stringify({...details, ...body}));

    const {status, data} = await fetchData('/api/fund-wallet', options);
    if(status === 0) return router.push('/login');
  
    let handler = PaystackPop.setup({
      key: 'pk_test_1036b2692892ebe21cf87429183177c154984321', // Replace with your public key
      ...details,
      onClose: function(){
        console.log('Window closed.');
      },
      callback: function({reference}){

        router.push('/success');

      }
    });
  
    handler.openIframe();
  }

  const handleBank = (e) => {
    setForm({ ...form, 
      [e.target.name]: e.target.value,
      bank_name: banks.find(bank => bank.code === e.target.value)?.name
    })
  }

  const validateBank = async(e) => {
    const details = { 
      account_number: form?.account_number,
      code: form?.bank_code
    };

    const { data } = await fetch('/api/validate-bank', { method: 'post', body: details });
    setForm({ ...form, ...data });
  }

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
          text="Withdraw"
        />

        
        <div className='space-y-3 bg-white'>

          <Select
            name="bank_code"
            placeholder="Choose Bank"
            onChange={handleBank}
            value={form?.bank_code}
            options={banks}
            required
          />

          <Input
            name="account_number"
            placeholder="Account Number"
            onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
            value={form?.account_number}
            required
          />

          <Input
            name="amount"
            placeholder="Amount to be paid"
            onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
            value={`₦ ${parseInt(form?.amount||0).toLocaleString()}`}
            required
          />

          <Button
            text="Withdraw"
            onClick={validateBank}
          />

        </div>


        {showConfirm && <div className='fixed top-0 left-0 w-full h-full bg-black opacity-20' onClick={() => setShowConfirm(false)}></div>}
        <div className={`${!showConfirm ? '-bottom-full' : 'bottom-0'} fixed left-0 w-full h-auto p-6 rounded-t-2xl bg-white space-y-4 py-12 duration-200`}>
          <p className='font-bold text-center'>Withdraw</p>

          <p className="text-2xl font-bold text-center">&#8358; {form?.amount?.toLocaleString()}</p>
          <p className="text-sm text-center">To: {form?.account_name}</p>
          <p className="text-sm text-center">{form?.account_number}</p>

          <div className='flex items-center justify-between'>
            <p className='text-xs font-bold'>Payment To</p>
            <p className='text-xs font-bold text-green-400'>{form?.company}</p>
          </div>


          <Button 
            text="Confirm"
            // onClick={handlePay}
            // loading={loading}
          />

        </div>
        
      </main>

      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
    </>
  )
}


export async function getServerSideProps(context) {

  const { banks } = await fetchData('/api/banks');
  console.log(banks?.[0])

  return {
    props: {
      banks: banks || null
    }
  }
}