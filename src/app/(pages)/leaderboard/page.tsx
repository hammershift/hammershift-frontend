"use client"
import Footer from '@/app/components/footer'
import { LatestNews } from '@/app/components/how_hammeshift_works'
import { SubscribeSmall } from '@/app/components/subscribe'
import { getWinnersRank } from '@/lib/getWinners'
import React, { useEffect, useState } from 'react'
import { BounceLoader } from 'react-spinners'

interface DataItem {
    rank: number;
    user: string;
    numberOfWinnings: number;
}

const LeaderBoardPage = () => {
    const [data, setData] = useState<DataItem[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getWinners = async () => {
            setLoading(true)
            const res = await getWinnersRank()
            if (!res) return
            setData(res.winners)
            setLoading(false)
        }
        getWinners()
    }, [])

    return (
        <div className='page-container'>
            <div className='section-container tw-grid tw-gap-8 tw-pb-16'>
                <div>
                    <span className='tw-bg-[#156CC3] tw-rounded-full tw-px-2.5 tw-py-2 tw-font-bold'>
                        LEADERBOARD
                    </span>
                </div>
                <div className='tw-font-bold tw-text-3xl md:tw-text-5xl'>Top Winners</div>
                {
                    loading ? (
                        <LoadingSpinner />
                    ) : (
                        <table className='tw-w-full md:tw-table-fixed'>
                            <thead className='tw-text-xl md:tw-text-2xl tw-text-black tw-bg-[#F2CA16]'>
                                <tr className='tw-leading-10'>
                                    <th className='sm:tw-w-1/3'>RANK</th>
                                    <th className='sm:tw-w-1/3'>USER</th>
                                    <th className='sm:tw-w-1/3'>WINS</th>
                                </tr>
                            </thead>
                            <tbody className='tw-text-center tw-space-y-1'>
                                {
                                    data.length > 0
                                    && (data as DataItem[]).map((item, index) => (
                                        <tr key={index + "LDB"} className={`tw-leading-10 ${index % 2 === 1 ? 'tw-bg-white/5' : ''}`}>
                                            <td className='sm:tw-w-1/3'>{item.rank}</td>
                                            <td className='sm:tw-w-1/3'>{item.user}</td>
                                            <td className='sm:tw-w-1/3'>{item.numberOfWinnings}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )
                }
            </div>
            <LatestNews />
            <SubscribeSmall />
            <Footer />
        </div>
    )
}

export default LeaderBoardPage


const LoadingSpinner = () => {
    return (
        <div className='tw-flex tw-justify-center tw-items-center tw-h-[50vh]'>
            <BounceLoader color='#F2CA16' />
        </div>
    )
}