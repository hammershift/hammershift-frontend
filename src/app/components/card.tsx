import React from 'react'
import Image from 'next/image'
import Dollar from '../../../public/images/dollar.svg'
import HourGlass from '../../../public/images/hour-glass.svg'

const cardData = {
    id: "1",
    year: "1981",
    brand: "Ferrari",
    descritpion: "512 BB",
    info: "This 1981 Ferrari 512 BB is one of 929 carbureted examples produced between 1976 and 1981, and it was imported to the US in July 1981. The car was registered in Oregon through the late 2000s and was acquired by the selling dealer in 2022, reportedly from its second owner. It has been refinished in silver over black leather",
    url: "https://assets.flatpyramid.com/wp-content/uploads/2017/07/10214526/f36-4-series-gran-coupe-2015-3d-model-212948-1170x877.jpg",
    current_bid: "$280,000",
    time_left: "02:16:00",
    activity: [
        {
            username: "damientine",
            wager: "$292,000",
            time: "12m ago"
        }
    ],
    players: [
        { username: "user1" },
        { username: "user2" }
    ]
}



const card = () => {
    return (
        <div>
            <img src={cardData.url} width={416} height={219} alt='ferrari' className='tw-w-[616px] tw-h-[319px] tw-object-cover' />
            <div className='tw-font-bold tw-text-[24px] tw-py-[12px]'>{cardData.year} {cardData.brand} {cardData.descritpion}</div>
            <p>This 1981 Ferrari 512 BB is one of 929 carbureted examples produced between 1976 and 1981, and it was imported to the US in July 1981. The car was registered in Oregon through the late 2000s and was acquired by the selling dealer in 2022, reportedly from its second owner. It has been refinished in silver over black leather</p>
            <div className='tw-flex tw-mt-2'>
                <Image src={Dollar} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                <div className='tw-px-2'>Current Bid:</div>
                <div className='tw-text-[#49C742] tw-font-bold'>{cardData.current_bid}</div>
            </div>
            <div className='tw-flex'>
                <Image src={HourGlass} width={20} height={20} alt='dollar' className='tw-w-5 tw-h-5' />
                <div className='tw-px-2'>Current Bid:</div>
                <div className='tw-text-[#C2451E] tw-font-bold'>{cardData.current_bid}</div>
            </div>
            <div></div>
            <button className='btn-yellow-thin tw-py-1'>Play Game</button>
        </div>
    )
}

export default card