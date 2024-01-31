import { redirect } from 'next/navigation'
import React from 'react'

const page = () => {
    redirect('/tournaments');
    return (
        <div>redirect</div>
    )
}

export default page