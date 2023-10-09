import '../styles/app.css'
import React from 'react'
import Image from 'next/image'
import Dollar from '../../../public/images/dollar.svg'
import HourGlass from '../../../public/images/hour-glass.svg'
import AvatarOne from '../../../public/images/avatar-one.svg'
import AvatarTwo from '../../../public/images/avatar-two.svg'
import AvatarThree from '../../../public/images/avatar-three.svg'
import AvatarFour from '../../../public/images/avatar-four.svg'
import BlackMercedes from '../../../public/images/black-mercedes.svg'

const cardData = {
    id: "1",
    year: "1981",
    brand: "Ferrari",
    descritpion: "512 BB",
    info: "This 1981 Ferrari 512 BB is one of 929 carbureted examples produced between 1976 and 1981, and it was imported to the US in July 1981. The car was registered in Oregon through the late 2000s and was acquired by the selling dealer in 2022, reportedly from its second owner. It has been refinished in silver over black leather",
    url: BlackMercedes,
    current_bid: "$280,000",
    time_left: "02:16:00",
    activity: [
        {
            id: "a1",
            username: "damientine",
            avatar: AvatarOne,
            wager: "$292,000",
            time: "12m ago"
        },
        {
            id: "a2",
            username: "addisonmx",
            avatar: AvatarTwo,
            wager: "$29,500",
            time: "16m ago"
        }
    ],
    players: [
        {
            id: "player1",
            username: "user1",
            avatar: AvatarOne
        },
        {
            id: "player2",
            username: "user2",
            avatar: AvatarTwo
        },
        {
            id: "player3",
            username: "user2",
            avatar: AvatarThree
        },
        {
            id: "player4",
            username: "user2",
            avatar: AvatarFour
        },
        {
            id: "player5",
            username: "user2",
            avatar: AvatarOne
        },
        {
            id: "player6",
            username: "user2",
            avatar: AvatarTwo
        },
        {
            id: "player7",
            username: "user2",
            avatar: AvatarThree
        }
    ]
}



const card = () => {
    return (
        <div>
            <Image src={cardData.url} width={416} height={219} alt='ferrari' className='tw-w-[200px] sm:tw-w-[416px] tw-h-[147px] sm:tw-h-[219px]  tw-object-cover' />
            <div className='tw-font-bold tw-text-[24px] tw-py-[12px]'>{cardData.year} {cardData.brand} {cardData.descritpion}</div>
            <p className='tw-h-[60px] sm:tw-h-[72px] tw-w-full tw-text-ellipsis tw-overflow-hidden tw-text-[14px] sm:tw-text-[16px]'>This 1981 Ferrari 512 BB is one of 929 carbureted examples produced between 1976 and 1981, and it was imported to the US in July 1981. The car was registered in Oregon through the late 2000s and was acquired by the selling dealer in 2022, reportedly from its second owner. It has been refinished in silver over black leather</p>
            <div className='tw-flex tw-mt-2'>
                <Image src={Dollar} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                <div className='tw-px-2 tw-hidden sm:tw-block'>Current Bid:</div>
                <div className='tw-text-[#49C742] tw-font-bold'>{cardData.current_bid}</div>
            </div>
            <div className='tw-flex'>
                <Image src={HourGlass} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                <div className='tw-px-2 tw-hidden sm:tw-block'>Current Bid:</div>
                <div className='tw-text-[#C2451E] tw-font-bold'>{cardData.current_bid}</div>
            </div>
            <div className=' tw-bg-[#172431] tw-p-2 sm:tw-p-4 tw-my-4 tw-text-[14px] sm:tw-text-[16px]'>
                {cardData.activity.map((item) => {

                    return <div key={item.id} className='tw-flex tw-mb-2'>
                        <Image src={item.avatar} width={24} height={24} alt='dollar' className='tw-w-[24px] tw-h-[24px]' />
                        <div className='tw-ml-1 tw-flex tw-flex-wrap'>
                            <div className='tw-text-[#42A0FF] tw-mr-2'>{`@${item.username}`}</div>
                            <div>{`wagered ${item.wager}`}</div>
                            <div className='tw-text-[#DCE0D9] tw-ml-2'>{item.time}</div>
                        </div>
                    </div>
                }
                )}

                <div className='tw-relative tw-flex tw-items-center'>
                    {/* avatar images - hidden for screens smaller than sm */}
                    <div className=' tw-w-auto tw-hidden sm:tw-flex'>
                        <Image src={cardData.players[0].avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                        <div className='tw-flex'>
                            {cardData.players.slice(1, 5).map((item) => {

                                return <div key={item.id} style={{ transform: `translate(${-10 + -10 * cardData.players.slice(1, 5).indexOf(item)}px ,0)` }}>
                                    <Image src={item.avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                                </div>
                            }
                            )}
                        </div>
                    </div>
                    <div className='tw-ml-1 tw--translate-x-8 sm:tw-block tw-hidden'>{`and ${cardData.players.length - 5} more players to join`}</div>
                    {/* avatar images - hidden for screens bigger than sm */}
                    <div className='tw-flex tw-w-auto sm:tw-hidden tw-block'>
                        <div className='tw-flex'>
                            {cardData.players.slice(0, 2).map((item) => {

                                return <div key={item.id} style={{ transform: `translate(${-10 + -10 * cardData.players.slice(1, 5).indexOf(item)}px ,0)` }}>
                                    <Image src={item.avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                                </div>
                            }
                            )}
                        </div>
                    </div>
                    <div className='tw-ml-1 tw--translate-x-1 tw-block sm:tw-hidden'>{`${cardData.players.length} players`}</div>
                </div>
            </div>
            <button className='btn-yellow-thin tw-w-full sm:tw-w-auto'>Play Game</button>
        </div>
    )
}

export default card