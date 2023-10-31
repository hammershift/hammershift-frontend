"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Plus from "../../../public/images/plus-icon.svg"
import Minus from "../../../public/images/minus-icon.svg"

const Support_Page = () => {
    type questionProps = "how it works" | "anyone can participate" | "multiple users" | "limit to wagers" | "how winners are determined" | "cancel wager" | "different payment methods" | null
    const [question, setQuestion] = useState<questionProps>(null);
    return (
        <div className='tw-w-screen tw-flex tw-flex-col tw-items-center'>
            <div className='tw-py-16 tw-w-[640px]'>
                <div className='tw-text-center tw-flex tw-flex-col tw-gap-4'>
                    <div className='tw-text-5xl tw-font-bold'>Get Support</div>
                    <div className='tw-opacity-80'>Qui ipsorum lingua Celtae, nostra Galli appellantur. Vivamus sagittis lacus vel augue laoreet rutrum faucibus. A communi observantia non est recedendum.</div>
                </div>
                <div className='tw-flex tw-gap-4 tw-mt-8 tw-flex tw-justify-center'>
                    <button className='btn-yellow'>FREQUENTLY ASKED QUESTONS</button>
                    <button className='btn-transparent-white'>CONTACT US</button>
                </div>
            </div>
            <div className='tw-bg-[#1A2C3D] tw-w-screen tw-py-[120px] tw-px-16'>
                <div>
                    <div className='tw-text-4xl tw-font-bold'>Frequently asked questions</div>
                    <div className='tw-text-lg tw-opacity-80'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                </div>
                <div>
                    <div className=''>
                        <div className='tw-flex tw-justify-between'>
                            <span className='tw-text-xl'>How does the car auction guessing and wagering system work?</span>
                            <button onClick={() => setQuestion(prev => prev === null ? "how it works" : null)}>
                                {question === "how it works"
                                    ? <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    : <Image src={Plus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                }
                            </button>
                        </div>
                        {question === "how it works" &&
                            <div className='tw-opacity-80'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                        }
                    </div>
                    <hr className='tw-opacity-10' />
                    <div className=''>
                        <div>Frequently asked questions</div>
                        <div>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Support_Page