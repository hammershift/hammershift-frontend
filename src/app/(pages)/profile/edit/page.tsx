"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ICountry, IState, Country, State } from "country-state-city";

import AvatarOne from "../../../../../public/images/avatar-one.svg";
import DeleteIcon from "../../../../../public/images/trash-bin.svg";
import Image from "next/image";

import { editUserInfo, getUserInfo } from "@/lib/data";

function EditProfile() {
    const { data } = useSession();
    const [userInfo, setUserInfo] = useState<any>({});
    const [edits, setEdits] = useState<any>({});
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [states, setStates] = useState<IState[]>([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setCountries(Country.getAllCountries());
    }, []);

    useEffect(() => {
        const savedCountry = Country.getAllCountries().find(
            (country) => country.name === userInfo.user?.country
        );

        setStates(State.getStatesOfCountry(savedCountry?.isoCode));
    }, [userInfo.user?.country]);

    useEffect(() => {
        if (data) {
            const fetchUserInfo = async () => {
                const userInfo = await getUserInfo(data.user.id);
                setUserInfo(userInfo);
            };

            fetchUserInfo();
        }
    }, [data]);

    const saveEdits = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const updatedUserInfo = await editUserInfo(
                userInfo.user._id,
                edits
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error: any) {
            console.error("Error updating user:", error.message);
        }
    };

    const handleCountrySelect = (countryCode: string) => {
        const selectedCountry = Country.getCountryByCode(countryCode);

        if (selectedCountry) {
            setStates(State.getStatesOfCountry(selectedCountry.isoCode));
            setEdits({ ...edits, country: selectedCountry.name });
        }
    };

    return (
        <div className="sm:tw-flex sm:tw-justify-center">
            <form
                onSubmit={saveEdits}
                className="tw-px-6 lg:tw-px-0 tw-text-sm sm:tw-w-[862px]"
            >
                <div className="tw-py-8 sm:tw-pt-[80px] tw-border-b-[1px] tw-border-b-[#1b252e]">
                    <div className="tw-flex tw-justify-between">
                        <div className="tw-text-4xl tw-font-bold">
                            My Details
                        </div>
                        {saved ? (
                            <button className="tw-text-black tw-bg-white tw-text-base tw-font-bold tw-px-3.5 tw-py-2.5 tw-rounded">
                                SAVED
                            </button>
                        ) : (
                            <button className="tw-text-[#0f1923] tw-bg-[#f2ca16] tw-text-base tw-font-bold tw-px-3.5 tw-py-2.5 tw-rounded">
                                SAVE
                            </button>
                        )}
                    </div>
                    <div>
                        <div className="sm:tw-flex sm:tw-gap-6 sm:tw-mt-8 sm:tw-mb-6 sm:tw-items-center">
                            <Image
                                src={AvatarOne}
                                alt=""
                                className="tw-rounded-full tw-w-[100px] sm:tw-w-[120px] tw-mb-6 tw-mt-8 sm:tw-m-0"
                            />
                            <div className="sm:tw-w-[82%]">
                                <label htmlFor="fullName">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    defaultValue={data?.user.fullName}
                                    className="tw-block tw-w-full tw-mt-2 tw-mb-6 sm:tw-mb-0 tw-outline-none tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded"
                                    onChange={(e) =>
                                        setEdits({
                                            ...edits,
                                            fullName: e.target.value,
                                        })
                                    }
                                ></input>
                            </div>
                        </div>
                        <label htmlFor="username">Username *</label>
                        <input
                            type="text"
                            name="username"
                            defaultValue={data?.user.username}
                            className="tw-block tw-w-full tw-mt-2 tw-mb-6 tw-outline-none tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded"
                            onChange={(e) =>
                                setEdits({
                                    ...edits,
                                    username: e.target.value,
                                })
                            }
                        ></input>
                        <label htmlFor="aboutMe">About Me</label>
                        <textarea
                            name="aboutMe"
                            placeholder="Tell the community about yourself"
                            defaultValue={userInfo.user?.aboutMe}
                            className="tw-block tw-w-full tw-mt-2 tw-mb-5 tw-outline-none tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-resize-none"
                            rows={10}
                            onChange={(e) =>
                                setEdits({
                                    ...edits,
                                    aboutMe: e.target.value,
                                })
                            }
                        ></textarea>
                        <div className="tw-flex tw-gap-5 tw-justify-between">
                            <div className="tw-w-1/2">
                                <label htmlFor="country">Country *</label>
                                <select
                                    className="tw-block tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-w-full tw-outline-none"
                                    onChange={(e) =>
                                        handleCountrySelect(e.target.value)
                                    }
                                >
                                    <option>Select Country</option>
                                    {countries.map((country) => (
                                        <option
                                            key={country.isoCode}
                                            value={country.isoCode}
                                            selected={
                                                country.name ===
                                                userInfo.user?.country
                                            }
                                        >
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="tw-w-1/2">
                                <label htmlFor="state">State *</label>
                                <select
                                    className="tw-block tw-mt-2 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-w-full tw-outline-none"
                                    onChange={(e) =>
                                        setEdits({
                                            ...edits,
                                            state: e.target.value,
                                        })
                                    }
                                >
                                    <option>Select State</option>
                                    {states.map((state) => (
                                        <option
                                            key={state.isoCode}
                                            selected={
                                                state.name ===
                                                userInfo.user?.state
                                            }
                                        >
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tw-py-8 tw-border-b-[1px] tw-border-b-[#1b252e]">
                    <div className="tw-text-2xl tw-font-bold tw-mb-6">
                        Links
                    </div>
                    <div>
                        <div className="sm:tw-flex tw-gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:tw-w-[23%]"
                            >
                                <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                                    Twitter
                                </div>
                            </label>
                            <div className="tw-flex tw-gap-4 tw-mb-4 sm:tw-w-[95%]">
                                <input
                                    type="url"
                                    name="twitterLink"
                                    placeholder="https://"
                                    className="tw-block tw-w-full tw-mt-2 sm:tw-mt-0 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
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
                        <div className="sm:tw-flex tw-gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:tw-w-[23%]"
                            >
                                <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                                    Website
                                </div>
                            </label>
                            <div className="tw-flex tw-gap-4 tw-mb-4 sm:tw-w-[95%]">
                                <input
                                    type="url"
                                    name="websiteLink"
                                    placeholder="https://"
                                    className="tw-block tw-w-full tw-mt-2 sm:tw-mt-0 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
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
                        <div className="sm:tw-flex tw-gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:tw-w-[23%]"
                            >
                                <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                                    LinkedIn
                                </div>
                            </label>
                            <div className="tw-flex tw-gap-4 tw-mb-4 sm:tw-w-[95%]">
                                <input
                                    type="url"
                                    name="linkedinLink"
                                    placeholder="https://"
                                    className="tw-block tw-w-full tw-mt-2 sm:tw-mt-0 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
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
                        <div className="sm:tw-flex tw-gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:tw-w-[23%]"
                            >
                                <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded">
                                    BringaTrailer
                                </div>
                            </label>
                            <div className="tw-flex tw-gap-4 tw-mb-4 sm:tw-w-[95%]">
                                <input
                                    type="url"
                                    name="bringATrailerLink"
                                    placeholder="https://"
                                    className="tw-block tw-w-full tw-mt-2 sm:tw-mt-0 tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded tw-outline-none"
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
                </div>
                <div className="tw-py-8 tw-border-b-[1px] tw-border-b-[#1b252e]">
                    <div className="tw-text-2xl tw-font-bold tw-mb-6">
                        Account
                    </div>
                    <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row">
                        <div className="tw-py-2.5 tw-px-3 tw-bg-[#172431] tw-rounded sm:tw-w-[252px]">
                            {userInfo.user?.email}
                        </div>
                        <button
                            className="tw-bg-white tw-text-[#0f1923] tw-font-bold tw-py-2.5 tw-rounded tw-text-base sm:tw-py-2.5 sm:tw-px-3"
                            type="button"
                        >
                            Save Email
                        </button>
                    </div>
                    <button
                        className="tw-w-full tw-py-2.5 tw-mt-4 tw-border-[1px] tw-rounded tw-text-base sm:tw-px-3 sm:tw-w-auto"
                        type="button"
                    >
                        Reset Password
                    </button>
                </div>
                <div className="tw-py-8 sm:tw-pb-[80px]">
                    <div className="tw-text-2xl tw-font-bold tw-mb-6">
                        Notification
                    </div>
                    <input type="checkbox" name="account" />
                    <label htmlFor="account" className="tw-font-bold tw-ml-2">
                        Account
                    </label>
                    <div className="tw-pl-[21px] tw-text-[#b7babd] tw-mb-4">
                        Excepteur sint obcaecat cupiditat non proident culpa
                    </div>
                    <input type="checkbox" name="wagers" />
                    <label htmlFor="wagers" className="tw-font-bold tw-ml-2">
                        Wagers
                    </label>
                    <div className="tw-pl-[21px] tw-text-[#b7babd] tw-mb-4">
                        Inmensae subtilitatis, obscuris et malesuada fames.
                    </div>
                    <input type="checkbox" name="watchlist" />
                    <label htmlFor="watchlist" className="tw-font-bold tw-ml-2">
                        Watchlist
                    </label>
                    <div className="tw-pl-[21px] tw-text-[#b7babd] tw-mb-4">
                        Cras mattis iudicium purus sit amet fermentum.
                    </div>
                    <input type="checkbox" name="marketing" />
                    <label htmlFor="marketing" className="tw-font-bold tw-ml-2">
                        Marketing
                    </label>
                    <div className="tw-pl-[21px] tw-text-[#b7babd] tw-mb-6">
                        Gallia est omnis divisa in partes tres, quarum.
                    </div>
                    <button
                        className="tw-w-full sm:tw-w-auto tw-text-[#c2451e] tw-border-[1px] tw-border-[#c2451e] tw-rounded tw-px-3.5 tw-py-2.5 tw-text-base"
                        type="button"
                    >
                        Delete My Account
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProfile;
