"use client"
import React, { useState } from "react"
import Image from "next/image"
import GoogleSocial from '../../../public/images/social-google-logo.svg'
import FacebookSocial from '../../../public/images/social-facebook-logo.svg'
import TwitterSocial from '../../../public/images/social-twitter-logo.svg'
import AppleSocial from '../../../public/images/social-apple-logo.svg'
import CancelIcon from '../../../public/images/x-icon.svg'
import Onfido from '../../../public/images/onfido.svg'
import SingleNeutral from '../../../public/images/single-neutral-id-card-3.svg'
import UserImage from '../../../public/images/user-single-neutral-male--close-geometric-human-person-single-up-user-male.svg'
import Passport from '../../../public/images/passport.svg'
import IDCard from '../../../public/images/single-neutral-id-card-1.svg'
import Link from "next/link"

const CreateAccount = () => {
    type createAccountPageProps = "page one" | "page two" | "page three"
    const [createAccountPage, setCreateAccountPage] = useState<createAccountPageProps>("page one")
    return (
        <div className="tw-w-screen md:tw-h-screen tw-absolute tw-top-0 tw-z-[-1] tw-flex tw-justify-center tw-items-center tw-mt-16 md:tw-mt-0">
            {createAccountPage === "page one" &&
                <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-h-[505px] tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
                    <div>
                        <div className='tw-flex tw-justify-between md:tw-justify-start'>
                            <div className='tw-font-bold tw-text-2xl md:tw-text-4xl'>Create Account</div>
                            <Image src={CancelIcon} width={20} height={20} alt='' className='tw-w-[20px] tw-h-[20px] sm:tw-hidden' />
                        </div>
                        <div className='tw-mt-1'>Already a member?
                            <Link href={"/login_page"} className='tw-text-[#F2CA16] tw-ml-2'>Login Here</Link>
                        </div>
                    </div>
                    <div className='tw-flex tw-flex-col tw-gap-6 tw-text-sm'>
                        <div className='tw-flex tw-flex-col tw-gap-2'>
                            <label>Email</label>
                            <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder='you@email.com' />
                        </div>
                        <div className='tw-flex tw-flex-col tw-gap-2'>
                            <label>Password</label>
                            <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' />
                        </div>
                        <button className='btn-yellow' onClick={() => { setCreateAccountPage("page two") }}>CREATE ACCOUNT</button>
                    </div>
                    <div className='tw-w-full tw-grid tw-grid-cols-4 tw-gap-2'>
                        <div className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                            <Image src={GoogleSocial} width={24} height={24} alt='google logo' className='tw-w-6 tw-h-6' />
                        </div>
                        <div className='tw-bg-[#1877F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                            <Image src={FacebookSocial} width={24} height={24} alt='facebook logo' className='tw-w-6 tw-h-6' />
                        </div>
                        <div className='tw-bg-white tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                            <Image src={AppleSocial} width={24} height={24} alt='apple logo' className='tw-w-6 tw-h-6' />
                        </div>
                        <div className='tw-bg-[#1DA1F2] tw-flex tw-justify-center tw-items-center tw-rounded tw-h-[48px]'>
                            <Image src={TwitterSocial} width={24} height={24} alt='twitter logo' className='tw-w-6 tw-h-6' />
                        </div>
                    </div>
                    <div className='tw-text-center tw-opacity-50'>
                        {"By creating an account, you agree to HammerShift’s Privacy Policy and Terms of Use."}
                    </div>
                </div>
            }
            {createAccountPage === "page two" &&
                // Setup your profile
                <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
                    <div className="tw-font-bold tw-text-4xl sm:tw-text-[44px]">Setup your profile</div>
                    <div className="tw-flex tw-flex-col tw-gap-5">
                        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-6">
                            <div className="tw-bg-[#F2CA16] tw-rounded-full tw-w-[120px] tw-h-[120px] tw-flex tw-justify-center tw-items-center">
                                <Image src={UserImage} width={52} height={52} alt="user profile" className="tw-w-[52px] tw-h-[52px]" />
                            </div>
                            <div className="tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow">
                                <label>Full Name *</label>
                                <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder='full name' />
                            </div>
                        </div>
                        <div className="tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow">
                            <label>Username *</label>
                            <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' />
                            <div className="tw-text-sm tw-opacity-40">At least x characters with no special symbols</div>
                        </div>
                        <div className="tw-grid tw-grid-cols-2 tw-gap-5">
                            <div className="tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow">
                                <label>Country *</label>
                                <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' />
                            </div>
                            <div className="tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow">
                                <label>State *</label>
                                <input className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' />
                            </div>
                        </div>
                        <div className="tw-flex tw-flex-col tw-justify-center tw-gap-2 tw-grow">
                            <label>About Me</label>
                            <textarea className='tw-py-2.5 tw-px-3 tw-bg-[#172431]' placeholder="Tell the community about yourself" rows={8} />
                        </div>
                        <div className="tw-flex tw-flex-col tw-gap-2">
                            <button className="btn-yellow" onClick={() => setCreateAccountPage("page three")}>Proceed to Account Verification</button>
                            <button className="btn-transparent-yellow">Verify Later</button>
                        </div>
                    </div>
                </div>
            }
            {createAccountPage === "page three" &&
                //Account Verification
                <div className='tw-w-screen md:tw-w-[640px] tw-px-6 tw-flex tw-flex-col tw-gap-8 tw-pt-6'>
                    <div>
                        <div className="tw-font-bold tw-text-4xl sm:tw-text-[44px] tw-py-1">Select document to upload</div>
                        <div>We need your identification to lorem ipsum dolor sit amet. Data is processed securely.</div>
                    </div>
                    <div className="tw-flex tw-gap-2 tw-items-center">
                        <span>Powered by</span>
                        <Image src={Onfido} width={107} height={24} alt="user profile" className="tw-w-[107px] tw-h-[24px]" />
                    </div>
                    <div className="tw-grid tw-gap-4">
                        <div className="tw-flex tw-justify-between tw-bg-[#172431] tw-p-4 tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-4  tw-rounded">
                                <div className="tw-w-14 tw-h-14 tw-bg-[#184C80] tw-rounded tw-flex tw-justify-center tw-items-center">
                                    <Image src={SingleNeutral} width={36} height={36} alt="user profile" className="tw-w-[36px] tw-h-[36px]" />
                                </div>
                                <div>{"Driver's License"}</div>
                            </div>
                            <input type='radio' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-full tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />
                        </div>
                        <div className="tw-flex tw-justify-between tw-bg-[#172431] tw-p-4 tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-4  tw-rounded">
                                <div className="tw-w-14 tw-h-14 tw-bg-[#184C80] tw-rounded tw-flex tw-justify-center tw-items-center">
                                    <Image src={Passport} width={36} height={36} alt="user profile" className="tw-w-[36px] tw-h-[36px]" />
                                </div>
                                <div>Passport</div>
                            </div>
                            <input type='radio' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-full tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />
                        </div>
                        <div className="tw-flex tw-justify-between tw-bg-[#172431] tw-p-4 tw-items-center">
                            <div className="tw-flex tw-items-center tw-gap-4  tw-rounded">
                                <div className="tw-w-14 tw-h-14 tw-bg-[#184C80] tw-rounded tw-flex tw-justify-center tw-items-center">
                                    <Image src={IDCard} width={36} height={36} alt="user profile" className="tw-w-[36px] tw-h-[36px]" />
                                </div>
                                <div>Identity Card</div>
                            </div>
                            <input type='radio' className="tw-relative tw-peer tw-h-5 tw-w-5 tw-cursor-pointer tw-appearance-none tw-rounded-full tw-border tw-border-white/10 tw-bg-white/5 tw-transition-opacity checked:tw-border-[#F2CA16] checked:tw-bg-[#F2CA16]" value="All" />
                        </div>
                    </div>
                    <button className="btn-yellow">Continue</button>
                </div>
            }


        </div>
    )
}

export default CreateAccount