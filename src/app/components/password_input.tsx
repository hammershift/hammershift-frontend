import React, { useState, FC } from 'react';
import Image from 'next/image';
import eyeOn from '../../images/eye-on.svg';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PasswordInput: FC<PasswordInputProps> = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='tw-relative tw-flex tw-flex-col tw-gap-2'>
      <input
        type={showPassword ? 'text' : 'password'}
        className='tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-w-full'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Password'
      />
      <button onClick={togglePasswordVisibility} className='tw-absolute tw-inset-y-0 tw-right-0 tw-pr-3 tw-flex tw-items-center'>
        {showPassword ? (
          <Image src='/images/eye-on.svg' alt='Hide password' width={20} height={20} />
        ) : (
          <Image src='/images/eye-off.svg' alt='Show password' width={20} height={20} />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
