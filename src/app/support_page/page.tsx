"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import Plus from "../../../public/images/plus-icon.svg"
import Minus from "../../../public/images/minus-icon.svg"
import Mail from "../../../public/images/mail-01.svg"
import Marker from "../../../public/images/marker-pin-02.svg"
import Phone from "../../../public/images/phone.svg"
import HowHammerShiftWorks from '../components/how_hammeshift_works'
import { SubscribeSmall } from '../components/subscribe'
import Footer from '../components/footer'
import { articleData } from '@/sample_data';

const Support_Page = () => {
    // type questionProps = "how it works" | "anyone can participate" | "multiple users" | "limit to wagers" | "how winners are determined" | "cancel wager" | "different payment methods" | null
    const [howDoesItWork, setHowDoesItWork] = useState(false);
    const [eligibilityRequirement, setEligibilityRequirement] = useState(false);
    const [multipleUsers, setMultipleUsers] = useState(false);
    const [limitedNumbers, setLimitedNumbers] = useState(false);
    const [howWinnersAreDetermined, setHowWinnersAreDetermined] = useState(false);
    const [cancelWager, setCancelWager] = useState(false);
    const [auctionTransactions, setAuctionTransactions] = useState(false);
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
            <div className='tw-bg-[#1A2C3D] tw-w-screen tw-flex tw-justify-center'>
                <div className='section-container tw-py-[120px] tw-px-16'>
                    <div>
                        <div className='tw-text-4xl tw-font-bold'>Frequently asked questions</div>
                        <div className='tw-text-lg tw-opacity-80'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                    </div>
                    <div className='tw-mt-16'>
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>How does the car auction guessing and wagering system work?</span>
                                <button onClick={() => setHowDoesItWork(prev => !prev)}>
                                    {howDoesItWork
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {howDoesItWork &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <hr className='tw-opacity-10' />
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>Can anyone participate in the car auctions, or are there any eligibility requirements?</span>
                                <button onClick={() => setEligibilityRequirement(prev => !prev)}>
                                    {eligibilityRequirement
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {eligibilityRequirement &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <hr className='tw-opacity-10' />
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>What happens if multiple users guess the same amount for a particular car auction?</span>
                                <button onClick={() => setMultipleUsers(prev => !prev)}>
                                    {multipleUsers
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {multipleUsers &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <hr className='tw-opacity-10' />
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>Is there a limit to the number of wagers I can place on different car auctions?</span>
                                <button onClick={() => setLimitedNumbers(prev => !prev)}>
                                    {limitedNumbers
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {limitedNumbers &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <hr className='tw-opacity-10' />
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>How are the winners determined in the car auctions?</span>
                                <button onClick={() => setHowWinnersAreDetermined(prev => !prev)}>
                                    {howWinnersAreDetermined
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {howWinnersAreDetermined &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <hr className='tw-opacity-10' />
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>{"Can I change or cancel my wager once it's been placed?"}</span>
                                <button onClick={() => setCancelWager(prev => !prev)}>
                                    {cancelWager
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {cancelWager &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <hr className='tw-opacity-10' />
                        <div className='tw-py-8'>
                            <div className='tw-flex tw-justify-between'>
                                <span className='tw-text-xl'>What are the different payment methods accepted for wagers and auction transactions?</span>
                                <button onClick={() => setAuctionTransactions(prev => !prev)}>
                                    {auctionTransactions
                                        ? <Image src={Plus} width={20} height={20} alt='plus sign' className='tw-w-[20px] tw-h-[20px]' />
                                        : <Image src={Minus} width={20} height={20} alt='minus sign' className='tw-w-[20px] tw-h-[20px]' />
                                    }
                                </button>
                            </div>
                            {auctionTransactions &&
                                <div className='tw-opacity-80 tw-mt-4'>Excepteur sint obcaecat cupiditat non proident culpa. At nos hinc posthac, sitientis piros afros.</div>
                            }
                        </div>
                        <button className='btn-transparent-white tw-w-full'>LOAD MORE</button>
                    </div>
                </div>
            </div>
            {/* ContactUs */}
            <div className='tw-py-[120px] tw-flex tw-justify-center'>
                <div className='tw-w-[640px]'>
                    <div className='tw-grid tw-gap-2'>
                        <span className='tw-text-4xl tw-font-bold'>Contact Us</span>
                        <span>{"We’d love to hear from you. Our friendly team is always here to chat."}</span>
                    </div>
                    <div className='tw-grid tw-gap-6 tw-text-sm tw-mt-12'>
                        <div className='tw-flex tw-flex-col'>
                            <label>Name</label>
                            <input placeholder='Full name' className='tw-bg-[#172431] tw-mt-2 tw-py-2.5 tw-px-3' />
                        </div>
                        <div className='tw-flex tw-flex-col'>
                            <label>Email</label>
                            <input placeholder='you@email.com' className='tw-bg-[#172431] tw-mt-2 tw-py-2.5 tw-px-3' />
                        </div>
                        <div className='tw-flex tw-flex-col'>
                            <label>Message</label>
                            <textarea className='tw-bg-[#172431] tw-mt-2 tw-py-2.5 tw-px-3' rows={5} />
                        </div>
                    </div>
                    <button className='btn-yellow tw-w-full tw-mt-8'>SEND MESSAGE</button>
                </div>
            </div>
            <div className='section-container tw-mb-[120px]'>
                <div className='tw-w-full tw-bg-[#1A2C3D] tw-py-16 tw-px-8 tw-rounded-lg tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-8'>
                    <div className='tw-flex tw-flex-col tw-items-center tw-gap-5'>
                        <div className='tw-bg-[#53944F] tw-w-16 tw-h-16 tw-rounded-full tw-flex tw-justify-center tw-items-center'>
                            <Image src={Mail} width={24} height={24} alt='' className='tw-w-[24px] tw-h-[24px]' />
                        </div>
                        <div className='tw-text-center'>
                            <div className='tw-font-bold tw-text-lg'>Email</div>
                            <div className='tw-opacity-50'>Our friendly team is here to help.</div>
                        </div>
                        <div className='tw-text-[#53944F] tw-font-bold'>support@hammershift.com</div>
                    </div>
                    <div className='tw-flex tw-flex-col tw-items-center tw-gap-5'>
                        <div className='tw-bg-[#53944F] tw-w-16 tw-h-16 tw-rounded-full tw-flex tw-justify-center tw-items-center'>
                            <Image src={Marker} width={24} height={24} alt='' className='tw-w-[24px] tw-h-[24px]' />
                        </div>
                        <div className='tw-text-center'>
                            <div className='tw-font-bold tw-text-lg'>Office</div>
                            <div className='tw-opacity-50'>Our HQ</div>
                        </div>
                        <div className='tw-text-[#53944F] tw-font-bold tw-text-center'>100 Smith Street<br />Collingwood VIC 3066 NJ</div>
                    </div>
                    <div className='tw-flex tw-flex-col tw-items-center tw-gap-5'>
                        <div className='tw-bg-[#53944F] tw-w-16 tw-h-16 tw-rounded-full tw-flex tw-justify-center tw-items-center'>
                            <Image src={Phone} width={24} height={24} alt='' className='tw-w-[24px] tw-h-[24px]' />
                        </div>
                        <div className='tw-text-center'>
                            <div className='tw-font-bold tw-text-lg'>Phone</div>
                            <div className='tw-opacity-50'>Mon-Fri from 8am to 5pm.</div>
                        </div>
                        <div className='tw-text-[#53944F] tw-font-bold'>+1 (555) 000-0000</div>
                    </div>
                </div>
            </div>
            <HowHammerShiftWorks articleData={articleData} />
            <SubscribeSmall />
            <Footer />
        </div>
    )
}

export default Support_Page