import fetchData from "@/hooks/fetchData";
import { useState } from "react";
import { BiQrScan } from "react-icons/bi";
import Scan from "./Scan";

export default function Select({ 
    validateExists,
    validateBalance,
    validate,
    label,
    name,
    type,
    placeholder,
    allowScan,
    onChange,
    setTransTag,
    error,
    success,
    options,
    ...props 
}) {

    let controller;
    const [ loadScanner, setLoadScanner ] = useState(false);
    const [error2, setError] = useState("");
    const [success2, setSuccess] = useState("");

    const searchTag = async( value ) => {
    
        controller?.abort();
        if(value === "@" || !value) {
            setError(`${name} is not available`);
            setSuccess(false);
            return;
        }; 
        
        controller = new AbortController();
        let signal = controller.signal;
    
        const options = {
          method: 'POST',
          body: { [name]: value },
          signal
        }
    
        const { status, data } = await fetchData('/api/validate', options);
    
        if(status === 2){
          if(data){
            setError(`${name} is not available`);
            setSuccess(false);
            return;
          }
    
          setError(false);
          setSuccess(`${name} available`);
          return;
        }
    
        
    }
    
    const handleChange = (e) => {
        if(validateExists) searchTag(e.target.value);
        onChange(e);
    }
    
    return (
        <div className='space-y-1'>
            {label && <label className='font-bold text-xs'>{label}</label>}

            <div className={`${error2 && 'border-red-600'} ${success2 && '!border-green-400'} ${ props.disabled && 'bg-neutral-200' } bg-white border-2 border-neutral-200 flex gap-2 p-1 rounded-md`}>
              <select 
                className='block w-full p-3 text-sm !outline-none bg-transparent'
                name={name}
                type={type || "text"}
                {...props}
                onChange={handleChange}
              >
                <option value="">{placeholder}</option>
                {options.map(({ name, code }) => 
                  <option key={code} value={code}>{name}</option>
                )}
              </select>
            </div>

            {(error2 || error) && <p className="text-red-600 text-[.625rem] font-bold lowercase">{error2 || error}</p>}
            {(success2 || success) && <p className="text-green-400 text-[.625rem] font-bold lowercase">{success2 || success}</p>}
        </div>
    );
}