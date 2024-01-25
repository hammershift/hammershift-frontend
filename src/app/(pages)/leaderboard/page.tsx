import Footer from '@/app/components/footer'
import { LatestNews } from '@/app/components/how_hammeshift_works'
import { SubscribeSmall } from '@/app/components/subscribe'
import React from 'react'

const LeaderBoardPage = () => {
    return (
        <div className='page-container'>
            <div className='section-container'>
                <div>
                    <div className='tw-w-auto tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold'>
                        LEADERBOARD
                    </div>
                </div>
                <div className='tw-font-bold tw-text-5xl'>Top Winners</div>
                <div></div>
            </div>
            <LatestNews />
            <SubscribeSmall />
            <Footer />
        </div>
    )
}

export default LeaderBoardPage