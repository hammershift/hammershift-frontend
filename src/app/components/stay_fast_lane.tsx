import React from 'react'

const StayInTheFastLane = () => {
    return (
        <div className='tw-px-4 md:tw-px-16 xl:tw-px-36 tw-w-screen tw-py-32 tw-text-[#0F1923] tw-bg-[#F2CA16]'>
            <div className='tw-grid tw-grid-cols-2'>
                <div>
                    <h1 className='tw-text-6xl tw-font-bold'>Stay in the Fast Lane</h1>
                    <p className='tw-my-10'>Are you ready to dive deeper into the captivating world of car auction wagering? Join the exclusive HammerShift newsletter to get access to a treasure trove of insider knowledge, expert tips, and captivating insights that will elevate your wagering game.</p>
                    <div className='tw-flex'>
                        <input placeholder='Email Address' className='tw-px-6 tw-grow' />
                        <button className='btn-dark tw-ml-3'>Subscribe</button>
                    </div>
                </div>
                <div></div>
            </div>
        </div>
    )
}

export default StayInTheFastLane