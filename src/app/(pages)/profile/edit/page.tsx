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
        <div className="sm:flex sm:justify-center">
            <form
                onSubmit={saveEdits}
                className="px-6 lg:px-0 text-sm sm:w-[862px]"
            >
                <div className="py-8 sm:pt-[80px] border-b-[1px] border-b-[#1b252e]">
                    <div className="flex justify-between">
                        <div className="text-4xl font-bold">
                            My Details
                        </div>
                        {saved ? (
                            <button className="text-black bg-white text-base font-bold px-3.5 py-2.5 rounded">
                                SAVED
                            </button>
                        ) : (
                            <button className="text-[#0f1923] bg-[#f2ca16] text-base font-bold px-3.5 py-2.5 rounded">
                                SAVE
                            </button>
                        )}
                    </div>
                    <div>
                        <div className="sm:flex sm:gap-6 sm:mt-8 sm:mb-6 sm:items-center">
                            <Image
                                src={AvatarOne}
                                alt=""
                                className="rounded-full w-[100px] sm:w-[120px] mb-6 mt-8 sm:m-0"
                            />
                            <div className="sm:w-[82%]">
                                <label htmlFor="fullName">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    defaultValue={data?.user.fullName}
                                    className="block w-full mt-2 mb-6 sm:mb-0 outline-none py-2.5 px-3 bg-[#172431] rounded"
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
                            className="block w-full mt-2 mb-6 outline-none py-2.5 px-3 bg-[#172431] rounded"
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
                            className="block w-full mt-2 mb-5 outline-none py-2.5 px-3 bg-[#172431] rounded resize-none"
                            rows={10}
                            onChange={(e) =>
                                setEdits({
                                    ...edits,
                                    aboutMe: e.target.value,
                                })
                            }
                        ></textarea>
                        <div className="flex gap-5 justify-between">
                            <div className="w-1/2">
                                <label htmlFor="country">Country *</label>
                                <select
                                    className="block mt-2 py-2.5 px-3 bg-[#172431] rounded w-full outline-none"
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
                            <div className="w-1/2">
                                <label htmlFor="state">State *</label>
                                <select
                                    className="block mt-2 py-2.5 px-3 bg-[#172431] rounded w-full outline-none"
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
                <div className="py-8 border-b-[1px] border-b-[#1b252e]">
                    <div className="text-2xl font-bold mb-6">
                        Links
                    </div>
                    <div>
                        <div className="sm:flex gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:w-[23%]"
                            >
                                <div className="py-2.5 px-3 bg-[#172431] rounded">
                                    Twitter
                                </div>
                            </label>
                            <div className="flex gap-4 mb-4 sm:w-[95%]">
                                <input
                                    type="url"
                                    name="twitterLink"
                                    placeholder="https://"
                                    className="block w-full mt-2 sm:mt-0 py-2.5 px-3 bg-[#172431] rounded outline-none"
                                ></input>
                                <button>
                                    <Image
                                        src={DeleteIcon}
                                        alt=""
                                        className="w-[25px]"
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="sm:flex gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:w-[23%]"
                            >
                                <div className="py-2.5 px-3 bg-[#172431] rounded">
                                    Website
                                </div>
                            </label>
                            <div className="flex gap-4 mb-4 sm:w-[95%]">
                                <input
                                    type="url"
                                    name="websiteLink"
                                    placeholder="https://"
                                    className="block w-full mt-2 sm:mt-0 py-2.5 px-3 bg-[#172431] rounded outline-none"
                                ></input>
                                <button>
                                    <Image
                                        src={DeleteIcon}
                                        alt=""
                                        className="w-[25px]"
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="sm:flex gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:w-[23%]"
                            >
                                <div className="py-2.5 px-3 bg-[#172431] rounded">
                                    LinkedIn
                                </div>
                            </label>
                            <div className="flex gap-4 mb-4 sm:w-[95%]">
                                <input
                                    type="url"
                                    name="linkedinLink"
                                    placeholder="https://"
                                    className="block w-full mt-2 sm:mt-0 py-2.5 px-3 bg-[#172431] rounded outline-none"
                                ></input>
                                <button>
                                    <Image
                                        src={DeleteIcon}
                                        alt=""
                                        className="w-[25px]"
                                    />
                                </button>
                            </div>
                        </div>
                        <div className="sm:flex gap-4">
                            <label
                                htmlFor="twitterLink"
                                className="sm:w-[23%]"
                            >
                                <div className="py-2.5 px-3 bg-[#172431] rounded">
                                    BringaTrailer
                                </div>
                            </label>
                            <div className="flex gap-4 mb-4 sm:w-[95%]">
                                <input
                                    type="url"
                                    name="bringATrailerLink"
                                    placeholder="https://"
                                    className="block w-full mt-2 sm:mt-0 py-2.5 px-3 bg-[#172431] rounded outline-none"
                                ></input>
                                <button>
                                    <Image
                                        src={DeleteIcon}
                                        alt=""
                                        className="w-[25px]"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="py-8 border-b-[1px] border-b-[#1b252e]">
                    <div className="text-2xl font-bold mb-6">
                        Account
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="py-2.5 px-3 bg-[#172431] rounded sm:w-[252px]">
                            {userInfo.user?.email}
                        </div>
                        <button
                            className="bg-white text-[#0f1923] font-bold py-2.5 rounded text-base sm:py-2.5 sm:px-3"
                            type="button"
                        >
                            Save Email
                        </button>
                    </div>
                    <button
                        className="w-full py-2.5 mt-4 border-[1px] rounded text-base sm:px-3 sm:w-auto"
                        type="button"
                    >
                        Reset Password
                    </button>
                </div>
                <div className="py-8 sm:pb-[80px]">
                    <div className="text-2xl font-bold mb-6">
                        Notification
                    </div>
                    <input type="checkbox" name="account" />
                    <label htmlFor="account" className="font-bold ml-2">
                        Account
                    </label>
                    <div className="pl-[21px] text-[#b7babd] mb-4">
                        Excepteur sint obcaecat cupiditat non proident culpa
                    </div>
                    <input type="checkbox" name="wagers" />
                    <label htmlFor="wagers" className="font-bold ml-2">
                        Wagers
                    </label>
                    <div className="pl-[21px] text-[#b7babd] mb-4">
                        Inmensae subtilitatis, obscuris et malesuada fames.
                    </div>
                    <input type="checkbox" name="watchlist" />
                    <label htmlFor="watchlist" className="font-bold ml-2">
                        Watchlist
                    </label>
                    <div className="pl-[21px] text-[#b7babd] mb-4">
                        Cras mattis iudicium purus sit amet fermentum.
                    </div>
                    <input type="checkbox" name="marketing" />
                    <label htmlFor="marketing" className="font-bold ml-2">
                        Marketing
                    </label>
                    <div className="pl-[21px] text-[#b7babd] mb-6">
                        Gallia est omnis divisa in partes tres, quarum.
                    </div>
                    <button
                        className="w-full sm:w-auto text-[#c2451e] border-[1px] border-[#c2451e] rounded px-3.5 py-2.5 text-base"
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
