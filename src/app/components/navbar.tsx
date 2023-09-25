import React from 'react'
import Logo from '../../../public/images/hammershift-logo.svg'
import Image from 'next/image'
import Button from '@mui/material/Button';

const Navbar = () => {
  return (
    <div>
        <div>
            <div>
                <Image src={Logo} width={177} height={32} alt='logo'/>
            </div>
            <div>DISCOVER</div>
            <div>AUCTIONS</div>
        </div>
        <div>
            <input/>
            <Button variant="contained" color="primary" size='medium'>Create Account</Button>
        </div>
    </div>
  )
}

export default Navbar