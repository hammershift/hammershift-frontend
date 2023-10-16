import Image from 'next/image'
import React, { useState } from 'react'
import CancelIcon from '../../../public/images/x-icon.svg'
import AmexLogo from '../../../public/images/payments-logo/Amex.svg'
import ApplePayLogo from '../../../public/images/payments-logo/apple-pay.svg'
import DiscoverLogo from '../../../public/images/payments-logo/Discover.svg'
import GooglePayLogo from '../../../public/images/payments-logo/google-pay.svg'
import MasterCardLogo from '../../../public/images/payments-logo/Mastercard.svg'
import PaypalLogo from '../../../public/images/payments-logo/paypal.svg'
import VisaLogo from '../../../public/images/payments-logo/visa.svg'
import CardIcon from '../../../public/images/payments-logo/card.svg'
import HelpIcon from '../../../public/images/payments-logo/help-icon.svg'

import CountryOptions from '../components/country_option'


const Payment = () => {
    const cardSaved = true
    const paymentChoice = "Credit Card"
    return (
        <div className='tw-bg-black/50 tw-w-screen tw-h-screen tw-flex tw-justify-center tw-items-center'>
            <div className='tw-bg-[#0F1923] tw-w-[640px] tw-h-[720px] tw-p-6'>
                {/* title */}
                <div className='tw-flex tw-justify-between tw-mb-16'>
                    <div className='tw-text-3xl tw-font-bold'>Pay with</div>
                    <div className='tw-w-[35px] tw-h-[35px] tw-flex tw-justify-center tw-items-center'>
                        <Image src={CancelIcon} width={15} height={15} alt='x' className='tw-w-[15px] tw-h-[15px]' />
                    </div>
                </div>
                {/* Content */}
                {paymentChoice === null
                    &&
                    <div className='tw-grid tw-gap-6 '>
                        <button className='tw-bg-[#172431] tw-h-[60px] tw-px-4 tw-w-full tw-flex tw-items-center tw-justify-between  tw-rounded'>
                            <div className=''>Credit or Debit Card</div>
                            <div className='tw-flex tw-grid tw-grid-cols-4 tw-gap-2'>
                                <Image src={VisaLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                <Image src={MasterCardLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                <Image src={AmexLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                <Image src={DiscoverLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                            </div>
                        </button>
                        <button className='tw-bg-[#172431] tw-h-[60px] tw-px-4 tw-w-full tw-flex tw-items-center tw-justify-between tw-rounded'>
                            <div className=''>Pay with PayPal</div>
                            <Image src={PaypalLogo} width={112} height={30} alt='x' className='tw-w-[112px] tw-h-[30px]' />
                        </button>
                        <button className='tw-bg-[#172431] tw-h-[60px] tw-px-4 tw-w-full tw-flex tw-items-center tw-justify-between tw-rounded'>
                            <div className=''>Pay with PayPal</div>
                            <Image src={ApplePayLogo} width={73} height={30} alt='x' className='tw-w-[73px] tw-h-[30px]' />
                        </button>
                        <button className='tw-bg-[#172431] tw-h-[60px] tw-px-4 tw-w-full tw-flex tw-items-center tw-justify-between tw-rounded'>
                            <div className=''>Pay with PayPal</div>
                            <Image src={GooglePayLogo} width={81} height={30} alt='x' className='tw-w-[81px] tw-h-[30px]' />
                        </button>
                        {cardSaved &&
                            <div className='tw-mt-11'>
                                <div>Add payment method</div>
                                <button className='tw-bg-[#172431] tw-h-[60px] tw-px-4 tw-w-full tw-flex tw-items-center tw-justify-between tw-mt-3 tw-rounded'>
                                    <div className=''>Credit or Debit Card</div>
                                    <div className='tw-flex tw-grid tw-grid-cols-4 tw-gap-2'>
                                        <Image src={VisaLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                        <Image src={MasterCardLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                        <Image src={AmexLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                        <Image src={DiscoverLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                    </div>
                                </button>
                            </div>
                        }
                    </div>

                }
                {
                    paymentChoice === "Credit Card"
                    &&
                    <div className='tw-bg-[#172431] tw-p-4 tw-rounded'>
                        <div className=' tw-h-[60px] tw-px-4 tw-w-full tw-flex tw-items-center tw-justify-between  tw-rounded tw-mb-3'>
                            <div className=''>Credit or Debit Card</div>
                            <div className='tw-flex tw-grid tw-grid-cols-4 tw-gap-2'>
                                <Image src={VisaLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                <Image src={MasterCardLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                <Image src={AmexLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                                <Image src={DiscoverLogo} width={52} height={36} alt='x' className='tw-w-[52px] tw-h-[36px]' />
                            </div>
                        </div>
                        <hr className='tw-border-white ' />
                        {/* inputs */}
                        <div className='tw-grid tw-gap-3 tw-py-6'>
                            <div>
                                <label>Card Number</label>
                                <div className='tw-bg-white/5 tw-flex tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2'>
                                    <Image src={CardIcon} width={35} height={24} alt='x' className='tw-w-[35px] tw-h-[24px]' />
                                    <input className='tw-bg-transparent tw-ml-2' placeholder='0000 0000 0000 0000' />
                                </div>
                            </div>
                            <div className='tw-grid tw-grid-cols-2 tw-gap-4'>
                                <div>
                                    <label>Expiration</label>
                                    <div className='tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2'>
                                        <input className='tw-bg-transparent tw-ml-2' placeholder='MM/YY' />
                                        <Image src={HelpIcon} width={20} height={20} alt='x' className='tw-w-[20px] tw-h-[20px]' />
                                    </div>
                                </div>
                                <div>
                                    <label>CVV</label>
                                    <div className='tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2'>
                                        <input className='tw-bg-transparent tw-ml-2' placeholder='123' />
                                        <Image src={HelpIcon} width={20} height={20} alt='x' className='tw-w-[20px] tw-h-[20px]' />
                                    </div>
                                </div>
                            </div>
                            <div className='tw-grid tw-grid-cols-2 tw-gap-4 tw-bg-[#1018280D]'>
                                <div>
                                    <label>Country</label>
                                    <div className='tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2'>
                                        <CountryOptions />

                                    </div>
                                </div>
                                <div>
                                    <label>Zip Code</label>
                                    <div className='tw-bg-white/5 tw-flex tw-items-center tw-h-11 tw-py-2.5 tw-px-3 tw-mt-2'>
                                        <input className='tw-bg-transparent tw-ml-2 tw-w-full' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className='tw-border-white' />
                        <div className='tw-py-4 tw-flex tw-justify-end'>
                            <button className='btn-transparent-white'>CANCEL</button>
                            <button className='btn-yellow tw-ml-4'>CONTINUE</button>
                        </div>
                    </div>

                }
            </div>

        </div >
    )
}

export default Payment   