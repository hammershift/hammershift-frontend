import Footer from '@/app/components/footer'
import { LatestNews } from '@/app/components/how_hammeshift_works'
import { SubscribeSmall } from '@/app/components/subscribe'
import React from 'react'

const LeaderBoardPage = () => {

    const sampleData = [
        {
            place: 1,
            user: 'John Doe',
            points: 100,
        },
        {
            place: 2,
            user: 'Jessy Stone',
            points: 98,
        },
        {
            place: 3,
            user: 'Cindy White',
            points: 89,
        },
        {
            place: 4,
            user: 'Ronald McDounald',
            points: 76,
        },
        {
            place: 5,
            user: 'Jolly Roger',
            points: 75,
        },
        {
            place: 6,
            user: 'mandy moore',
            points: 71,
        },
        {
            place: 7,
            user: 'JC Denton',
            points: 68,
        },
        {
            place: 8,
            user: 'Brandon Stark',
            points: 59,
        },
        {
            place: 9,
            user: 'Lara Croft',
            points: 46,
        },
        {
            place: 10,
            user: 'Rebecca Chambers',
            points: 45,
        }
    ]


    return (
        <div className='page-container'>
            <div className='section-container tw-grid tw-gap-8 tw-pb-16'>
                <div>
                    <span className='tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold'>
                        LEADERBOARD
                    </span>
                </div>
                <div className='tw-font-bold tw-text-3xl md:tw-text-5xl'>Top 10 Winners</div>
                <table className='tw-w-full tw-border-separate tw-border-spacing-y-6'>
                    <thead>
                        <tr className='tw-text-xl md:tw-text-3xl tw-text-[#F2CA16]'>
                            <th>Rank</th>
                            <th>User</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody className='tw-text-center tw-space-y-1'>
                        {
                            sampleData.map((item, index) => (
                                <tr key={index + "LDB"} className='tw-border-b tw-border-gray-600'>
                                    <td>{item.place}</td>
                                    <td>{item.user}</td>
                                    <td>{item.points}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                <div></div>
            </div>
            <LatestNews />
            <SubscribeSmall />
            <Footer />
        </div>
    )
}

export default LeaderBoardPage