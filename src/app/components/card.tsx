"use client"
import '../styles/app.css'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Dollar from '../../../public/images/dollar.svg'
import HourGlass from '../../../public/images/hour-glass.svg'
import AvatarOne from '../../../public/images/avatar-one.svg'
import AvatarTwo from '../../../public/images/avatar-two.svg'
import AvatarThree from '../../../public/images/avatar-three.svg'
import AvatarFour from '../../../public/images/avatar-four.svg'
import BlackMercedes from '../../../public/images/black-mercedes.svg'
import CarTournamnetsListOne from '../../../public/images/tournaments-list/tournaments-list-car-1.svg'

export const cardData = {
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



const Card = () => {
    const router = useRouter();
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
            <button className='btn-yellow-thin tw-w-full sm:tw-w-auto' onClick={() => router.push(`/auctions/car_view_page/67232853`)}>Play Game</button>
        </div>
    )
}

export default Card





export const GamesCard = (props: any) => {
    const router = useRouter()

    const currencyString = new Intl.NumberFormat().format(props.price)

    const activity = [
        {
            id: "ad1",
            username: "damientine",
            avatar: AvatarOne,
            wager: "$292,000",
            time: "12m ago"
        },
        {
            id: "ad2",
            username: "addisonmx",
            avatar: AvatarTwo,
            wager: "$29,500",
            time: "16m ago"
        }
    ];
    const players = [
        {
            id: "play1",
            username: "user1",
            avatar: AvatarOne
        },
        {
            id: "play2",
            username: "user2",
            avatar: AvatarTwo
        },
        {
            id: "play3",
            username: "user2",
            avatar: AvatarThree
        },
        {
            id: "play4",
            username: "user2",
            avatar: AvatarFour
        },
        {
            id: "player5",
            username: "user2",
            avatar: AvatarOne
        },
        {
            id: "play6",
            username: "user2",
            avatar: AvatarTwo
        },
        {
            id: "play7",
            username: "user2",
            avatar: AvatarThree
        }
    ]
    return (
        <div className='tw-h-full tw-flex tw-flex-col tw-justify-between'>
            <div>

                <Image src={props.image} width={416} height={219} alt={props.make} className='tw-w-full 2xl:tw-w-[416px] tw-h-auto 2xl:tw-h-[219px]  tw-object-cover tw-aspect-auto' />
                <div className='tw-font-bold tw-text-[24px] tw-py-[12px]'>{props.year} {props.make} {props.model}</div>
                <p className='tw-h-[60px] sm:tw-h-[72px] tw-w-full tw-text-ellipsis tw-overflow-hidden tw-text-[14px] sm:tw-text-[16px]'>{props.description[0]}</p>
                <div className='tw-flex tw-mt-2'>
                    <Image src={Dollar} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                    <div className='tw-px-2 tw-hidden sm:tw-block'>Current Bid:</div>
                    <div className='tw-text-[#49C742] tw-font-bold'>${currencyString}</div>
                </div>
                <div className='tw-flex'>
                    <Image src={HourGlass} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                    <div className='tw-px-2 tw-hidden sm:tw-block'>Time Left:</div>
                    <div className='tw-text-[#C2451E] tw-font-bold'>2:16:00</div>
                </div>
                <div className=' tw-bg-[#172431] tw-p-2 sm:tw-p-4 tw-my-4 tw-text-[14px] sm:tw-text-[16px]'>
                    {activity.map((item) => {

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
                        <div className=' tw-w-auto tw-hidden xl:tw-flex'>
                            <Image src={players[0].avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                            <div className='tw-flex'>
                                {players.slice(1, 5).map((item) => {

                                    return <div key={item.id} style={{ transform: `translate(${-10 + -10 * players.slice(1, 5).indexOf(item)}px ,0)` }}>
                                        <Image src={item.avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                                    </div>
                                }
                                )}
                            </div>
                        </div>
                        <div className='tw-ml-1 tw--translate-x-8 xl:tw-block tw-hidden'>{`and ${players.length - 5} more players to join`}</div>
                        {/* avatar images - hidden for screens bigger than sm */}
                        <div className='tw-flex tw-w-auto xl:tw-hidden tw-block'>
                            <div className='tw-flex'>
                                {players.slice(0, 2).map((item) => {

                                    return <div key={item.id} style={{ transform: `translate(${-10 + -10 * players.slice(1, 5).indexOf(item)}px ,0)` }}>
                                        <Image src={item.avatar} width={32} height={32} alt='avatar' className='tw-w-8 tw-h-8 tw-rounded-full' style={{ border: '1px solid black' }} />
                                    </div>
                                }
                                )}
                            </div>
                        </div>
                        <div className='tw-ml-1 tw--translate-x-1 tw-block xl:tw-hidden'>{`${players.length} players`}</div>
                    </div>
                </div>
            </div>
            <div>
                <button className='btn-yellow-thin tw-w-full md:tw-w-auto' onClick={() => router.push(`/auctions/car_view_page/${props.auction_id}`)}>Play Game</button>
            </div>
        </div>
    )
}


export const TournamentsCard = () => {

    const router = useRouter()

    const userList = [{
        number: "1",
        img: AvatarOne,
        username: "Username",
        points: "936"
    },
    {
        number: "2",
        img: AvatarTwo,
        username: "Username",
        points: "984"
    }, {
        number: "3",
        img: AvatarThree,
        username: "Username",
        points: "1,000"
    }]
    return (
        <div className=''>
            <div className='tw-relative tw-grid tw-grid-cols-3 tw-gap-4 tw-px-2 sm:tw-px-4'>
                <div className='tw-flex tw-justify-end '>
                    <Image src={BlackMercedes} width={90} height={90} alt='image' className='tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]' />
                </div>
                <div className='tw-flex tw-justify-center'>
                    <Image src={BlackMercedes} width={100} height={100} alt='image' className='tw-w-[100px] tw-h-[100px] tw-absolute tw-object-cover tw-rounded-full ' />
                </div>
                <div className='tw-flex tw-justify-start'>
                    <Image src={BlackMercedes} width={90} height={90} alt='image' className='tw-w-[90px] tw-h-[90px] tw-absolute tw-object-cover tw-rounded-full tw-top-[10px] tw-opacity-[50%]' />
                </div>
            </div>
            <div className='tw-bg-[#1A2C3D] tw-w-auto sm:tw-w-[416px] tw-text-center tw-p-4 tw-rounded-lg tw-mt-12 tw-pt-20' >
                <div className='tw-text-[18px] tw-font-bold'>2000s Tournament</div>
                <div className='tw-text-[#53944F]'>Just Ended</div>
                <div>

                    {
                        userList.map((user) => (
                            <div key={user.username} className='tw-flex tw-items-center tw-justify-between tw-my-3'>
                                <div className='tw-flex tw-items-center'>
                                    <div>{user.number}</div>
                                    <Image src={user.img} width={40} height={40} alt="avatar" className='tw-w-[40px] tw-h-[40px] tw-mx-3' />
                                    <div>{user.username}</div>
                                </div>
                                <div className='tw-text-[#F2CA16] tw-font-bold'>{`${user.points} pts.`}</div>
                            </div>
                        ))
                    }

                    {/* other users*/}
                </div>
                <div>
                    <button className='btn-yellow tw-w-full' onClick={() => router.push('/tournament_page')}>View Results</button>
                </div>

            </div>
        </div>
    )
}

export const TournamentsListCard = () => {
    const tournamentsListCardData = {
        name: "1974 Maserati Bora 4.9",
        description: "Nisi anim cupidatat elit proident ipsum reprehenderit adipisicing ullamco do pariatur quis sunt exercitation officia. Tempor magna duis mollit culpa. Laborum esse eu occaecat dolor laborum exercitation. Sunt labore et sunt consequat culpa velit non do culpa ex tempor irure. Deserunt est exercitation consectetur nisi id.",
        time: "05:16:00"

    }
    return (
        <div className='tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-8 tw-mt-8'>
            <Image src={CarTournamnetsListOne} width={416} height={240} alt='car' className='tw-w-full tw-h-auto tw-object-cover tw-aspect-auto' />
            <div>
                <div className='tw-opacity-30 tw-text-2xl tw-font-bold'>1</div>
                <div className='tw-text-2xl tw-font-bold tw-mt-4'>{tournamentsListCardData.name}</div>
                <div className='tw-h-[72px] tw-ellipsis tw-overflow-hidden'>{tournamentsListCardData.description}</div>
                <div className='tw-flex tw-mt-4'>
                    <Image src={HourGlass} width={20} height={20} alt='car' className='tw-w-5 tw-h-5' />
                    <span className='tw-text-[#F2CA16] tw-font-bold tw-ml-2'>{tournamentsListCardData.time}</span>
                </div>
            </div>
        </div>
    )
}