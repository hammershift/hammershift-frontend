import AvatarOne from "../../../../../public/images/avatar-one.svg";
import DeleteIcon from "../../../../../public/images/trash-bin.svg";
import Image from "next/image";

function EditProfile() {
    return (
        <form className="tw-px-6 tw-text-sm">
            <div className="tw-py-8 tw-border-b-[1px] tw-border-b-[#1b252e]">
                <div className="tw-flex tw-justify-between">
                    <div className="tw-text-4xl tw-font-bold">My Details</div>
                    <button className="tw-text-[#0f1923] tw-bg-[#f2ca16] tw-text-base tw-font-bold tw-px-3.5 tw-py-2.5 tw-rounded">
                        SAVE
                    </button>
                </div>
                <div>
                    <Image
                        src={AvatarOne}
                        alt=""
                        className="tw-rounded-full tw-w-[100px] sm:tw-w-[200px] tw-mb-6 tw-mt-8"
                    />
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        defaultValue="Ralph Edwards"
                        className="tw-block tw-w-full tw-mt-2 tw-mb-6 tw-outline-none tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded"
                    ></input>
                    <label htmlFor="username">Username *</label>
                    <input
                        type="text"
                        name="username"
                        defaultValue="ralphedwards"
                        className="tw-block tw-w-full tw-mt-2 tw-mb-6 tw-outline-none tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded"
                    ></input>
                    <label htmlFor="aboutMe">About Me</label>
                    <textarea
                        name="aboutMe"
                        placeholder="Tell the community about yourself"
                        className="tw-block tw-w-full tw-mt-2 tw-mb-5 tw-outline-none tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-resize-none"
                        rows={10}
                    ></textarea>
                    <div className="tw-flex tw-gap-5 tw-justify-between">
                        <div className="tw-w-1/2">
                            <label htmlFor="country">Country *</label>
                            <select
                                className="tw-block tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-w-full tw-outline-none"
                                value="Country"
                            >
                                <option value="">Select Country</option>
                                <option value="Philippines">Philippines</option>
                            </select>
                        </div>
                        <div className="tw-w-1/2">
                            <label htmlFor="state">State *</label>
                            <select
                                className="tw-block tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-w-full tw-outline-none"
                                value="Country"
                            >
                                <option value="">Select State</option>
                                <option value="Philippines">NCR</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className="tw-py-8 tw-border-b-[1px] tw-border-b-[#1b252e]">
                <div className="tw-text-2xl tw-font-bold tw-mb-6">Links</div>
                <div>
                    <label htmlFor="twitterLink">
                        <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                            Twitter
                        </div>
                    </label>
                    <div className="tw-flex tw-gap-4 tw-mb-4">
                        <input
                            type="url"
                            name="twitterLink"
                            placeholder="https://"
                            className="tw-block tw-w-full tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
                        ></input>
                        <button>
                            <Image
                                src={DeleteIcon}
                                alt=""
                                className="tw-w-[25px]"
                            />
                        </button>
                    </div>
                    <label htmlFor="twitterLink">
                        <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                            Website
                        </div>
                    </label>
                    <div className="tw-flex tw-gap-4 tw-mb-4">
                        <input
                            type="url"
                            name="websiteLink"
                            placeholder="https://"
                            className="tw-block tw-w-full tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
                        ></input>
                        <button>
                            <Image
                                src={DeleteIcon}
                                alt=""
                                className="tw-w-[25px]"
                            />
                        </button>
                    </div>
                    <label htmlFor="twitterLink">
                        <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                            LinkedIn
                        </div>
                    </label>
                    <div className="tw-flex tw-gap-4 tw-mb-4">
                        <input
                            type="url"
                            name="linkedinLink"
                            placeholder="https://"
                            className="tw-block tw-w-full tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
                        ></input>
                        <button>
                            <Image
                                src={DeleteIcon}
                                alt=""
                                className="tw-w-[25px]"
                            />
                        </button>
                    </div>
                    <label htmlFor="twitterLink">
                        <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                            BringaTrailer
                        </div>
                    </label>
                    <div className="tw-flex tw-gap-4 tw-mb-4">
                        <input
                            type="url"
                            name="bringATrailerLink"
                            placeholder="https://"
                            className="tw-block tw-w-full tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
                        ></input>
                        <button>
                            <Image
                                src={DeleteIcon}
                                alt=""
                                className="tw-w-[25px]"
                            />
                        </button>
                    </div>
                </div>
            </div>
            <div className="tw-py-8 tw-border-b-[1px] tw-border-b-[#1b252e]">
                <div className="tw-text-2xl tw-font-bold tw-mb-6">Account</div>
                <div className="tw-flex tw-flex-col tw-gap-2">
                    <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                        ralph@company.com
                    </div>
                    <button
                        className="tw-bg-white tw-text-[#0f1923] tw-font-bold tw-py-2.5 tw-rounded tw-text-base"
                        type="button"
                    >
                        Save Email
                    </button>
                </div>
                <button
                    className="tw-w-full tw-py-2.5 tw-mt-4 tw-border-[1px] tw-rounded tw-text-base"
                    type="button"
                >
                    Reset Password
                </button>
            </div>
            <div className="tw-py-8">
                <div className="tw-text-2xl tw-font-bold tw-mb-6">
                    Notification
                </div>
                <input type="checkbox" name="account" />
                <label htmlFor="account">Account</label>
                <div>Excepteur sint obcaecat cupiditat non proident culpa</div>
                <input type="checkbox" name="wagers" />
                <label htmlFor="wagers">Wagers</label>
                <div>Inmensae subtilitatis, obscuris et malesuada fames.</div>
                <input type="checkbox" name="watchlist" />
                <label htmlFor="watchlist">Watchlist</label>
                <div>Cras mattis iudicium purus sit amet fermentum.</div>
                <input type="checkbox" name="marketing" />
                <label htmlFor="marketing">Marketing</label>
                <div>Gallia est omnis divisa in partes tres, quarum.</div>
                <button type="button">Delete My Account</button>
            </div>
        </form>
    );
}

export default EditProfile;
