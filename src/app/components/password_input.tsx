import React, { useState, FC } from 'react';
import Image from 'next/image';

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
    <div className='relative flex flex-col gap-2'>
      <input
        type={showPassword ? 'text' : 'password'}
        className='py-2.5 px-3 bg-[#172431] w-full'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Password'
      />
      <button onClick={togglePasswordVisibility} className='absolute inset-y-0 right-0 pr-3 flex items-center'>
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
