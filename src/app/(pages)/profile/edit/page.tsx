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

    useEffect(() => {
        setCountries(Country.getAllCountries());
    }, []);

    useEffect(() => {
        if (data) {
            const fetchUserInfo = async () => {
                const userInfo = await getUserInfo(data.user.id);
                setUserInfo(userInfo);
                console.log(userInfo);
            };

            fetchUserInfo();
        }
    }, [data]);

    const users = [
        {
            emailVerified: null,
            _id: "65713906486ffc13da5e69e2",
            email: "absalipande@gmail.com",
            password:
                "$2b$12$iXSydLtMjTB3CJ4ObT9tMuMr22NCv7XWQb6KcbEPVtvtWkIYYS/XW",
            aboutMe: "Hi",
            country: "Philippines",
            fullName: "Amiel Brencis Salipande",
            state: "Metro Manila",
            username: "absalipande",
            balance: 640,
            isActive: true,
            createdAt: "2024-01-03T01:35:58.168Z",
        },
        {
            emailVerified: null,
            _id: "6571434721dafaf1855e236b",
            email: "test1@email.com",
            password:
                "$2b$12$0e7HFeBnnGkqMB.D3xSsbOqR0Rc/nG2ZZVfEdUxSftUpYqpDdiSeK",
            createdAt: "2024-01-09T03:22:04.617Z",
            balance: 60,
            isActive: true,
        },
        {
            emailVerified: null,
            _id: "657912e3d68d02a8fdcdecf6",
            email: "matthew.seaver.choy@gmail.com",
            password:
                "$2b$12$7yTTBu.qiP5GDs1GKnxAyevi0WWmoICu8YqOSUtn8PvKLgo0pEgVO",
            aboutMe: "I'm cool",
            country: "Philippines",
            fullName: "Matthew Seaver Choy",
            state: "Metro Manila",
            username: "decollation",
            isActive: true,
            updatedAt: "2023-12-20T01:42:35.912Z",
        },
        {
            _id: "657bbe644f5e26c5b783616f",
            email: "cindy@mail.com",
            password:
                "$2b$10$wxQCS76n4wYpbVmFtTINju.0QRVSOROgB/H9j4GqSgdEhcDw94bju",
            image: "cindyimg.jpg",
            emailVerified: false,
            aboutMe: "I'm Cindy Blonde",
            country: "United States of America",
            fullName: "Blonde",
            state: "Florida",
            username: "Cindy",
            isActive: true,
            createdAt: "2023-12-15T02:48:04.071Z",
            updatedAt: "2023-12-15T02:48:04.071Z",
            __v: 0,
        },
        {
            _id: "657bbf7c4f5e26c5b7836173",
            email: "wednesday@mail.com",
            password:
                "$2b$10$I7TuoksPiuqGeRZ12T790e2PllpSU1lTjPjnKpz.mcJ/hYHI/yVM2",
            image: "wednesdayimg.jpg",
            emailVerified: false,
            aboutMe: "I'm Wednesday Addams",
            country: "United States of America",
            fullName: "Wednesday Addams",
            state: "New Jersey",
            username: "wednesday",
            isActive: true,
            createdAt: "2023-12-15T02:52:44.016Z",
            updatedAt: "2023-12-15T02:52:44.016Z",
            __v: 0,
        },
        {
            emailVerified: null,
            _id: "657c08123b77c383695552a7",
            email: "ajtest@email.com",
            password:
                "$2b$12$AE0BD9a0bKJmhkpoh6aNHebSWg9MAaPhcC.L9XiJdmUb41UWndt5y",
            aboutMe: "No",
            country: "Philippines",
            fullName: "AJ Ramirez",
            state: "Leyte",
            username: "jay",
            balance: 2100,
            isActive: true,
            createdAt: "2024-01-03T03:42:26.113Z",
        },
        {
            _id: "657fecaef796fdf6ee746221",
            name: "AJ Ramirez",
            email: "ajlimramirez@gmail.com",
            image: "https://lh3.googleusercontent.com/a/ACg8ocJRPsWTOg5JodPs9Q-3rUY4cmdHbgKrwoOSTN9WBahCPw=s96-c",
            emailVerified: null,
            aboutMe:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse",
            country: "Algeria",
            fullName: "AeJay",
            state: "Aïn Defla",
            username: "jayA",
            balance: 100069,
            isActive: true,
            createdAt: "2024-01-03T03:44:53.574Z",
            isBanned: false,
        },
        {
            emailVerified: null,
            _id: "6581213b4f3e51c9b5882951",
            email: "amielbrencis@gmail.com",
            password:
                "$2b$12$b7EAUqUxUgbFgk8Ewwkj.OEXisxq284hiw/oxOBlyLzmg.t8bI2pu",
            aboutMe: "Hi",
            country: "Philippines",
            fullName: "Amiel Brencis",
            state: "Metro Manila",
            username: "miel",
            createdAt: "2024-01-09T11:26:45.574Z",
            balance: 100,
            isActive: true,
        },
        {
            emailVerified: null,
            _id: "65824ed1db2ea85500c815d9",
            email: "bev@mail.com",
            password:
                "$2b$12$RQSCA4UOmCA5N6obOLmA3ucKCZoSfwXpHUImK6.qJtnQt/5kUFqMe",
            aboutMe: "Hello World",
            country: "Philippines",
            fullName: "bevs Stone",
            state: "Ifugao",
            username: "bevs22",
            balance: 20,
            isActive: true,
            updatedAt: "2024-01-03T13:47:18.780Z",
            createdAt: "2024-01-05T08:49:56.091Z",
        },
        {
            emailVerified: null,
            _id: "6582506deecb0e062d457beb",
            email: "bevs2@mail.com",
            password:
                "$2b$12$/1jXXt4dHLdCk0ZVXHlpvu.AHnzbMwZRNETJmU/wmL.k0E8Z6uN/y",
            aboutMe: "Hello",
            country: "Albania",
            fullName: "bevsi",
            state: "Berat District",
            username: "bevsi2",
            isActive: true,
            createdAt: "2024-01-17T13:38:32.343Z",
            balance: null,
        },
        {
            emailVerified: null,
            _id: "658253aa0389e2739141ae4d",
            email: "bebs@mail.com",
            password:
                "$2b$12$4QgFnRLSsxLbiVluCBMvn.QfTv7hoLsJBqHwZkrneauM6SZm7V65m",
            aboutMe: "French Fries",
            country: "Angola",
            fullName: "bevb",
            state: "Cunene Province",
            username: "bevb",
            balance: 100,
            isActive: true,
            updatedAt: "2024-01-03T12:33:21.599Z",
            createdAt: "2024-01-17T13:39:18.616Z",
        },
        {
            emailVerified: null,
            _id: "6583d3ba570afd089774f1f4",
            email: "johndoe@gmail.com",
            password:
                "$2b$12$K0K.RUdbI4SxGlkvpueIJuMeh/rXCsDlcGI60YXoHHP6q6GDtWYM6",
            isActive: true,
            balance: 90,
            aboutMe: "Hi",
            country: "Philippines",
            fullName: "John Doe",
            state: "Metro Manila",
            username: "doughnut",
        },
        {
            _id: "65841aee606c0bdf80a6bf8e",
            name: "Sage Blackfyre",
            email: "sageblackfyre@gmail.com",
            image: "https://lh3.googleusercontent.com/a/ACg8ocIGX25qhTwhELToJbXG9lOg0uQC0BdGsqTvukVERAAd=s96-c",
            emailVerified: null,
            balance: 260,
            isActive: true,
            aboutMe: "hi",
            country: "Philippines",
            fullName: "Sage Blackfyre",
            state: "Metro Manila",
            username: "sage",
        },
        {
            emailVerified: null,
            _id: "658d592b0afac4c01efff1e6",
            email: "flyingraijin@domain.com",
            password:
                "$2b$12$Xw9zfRDMz/P9L0llh5I2ve1hKsOONOHuFmKLgQGiK4Bm/0DFkytWK",
            isActive: true,
            balance: 130,
            aboutMe: "Rasengan!",
            country: "Japan",
            fullName: "Minato Namikaze",
            state: "Hokkaidō Prefecture",
            username: "YellowFlash",
        },
        {
            _id: "6594d9ec8ca9a47b92b7a289",
            name: "Albert Anastasia",
            email: "cheerfulnutella@gmail.com",
            image: "https://lh3.googleusercontent.com/a/ACg8ocIp8PlMCz8JsLACMcQtTr-cu2SKeTGbnoeQuhhrWjO1=s96-c",
            emailVerified: null,
            createdAt: "2024-01-03T03:52:13.318Z",
            balance: 950,
            isActive: true,
            aboutMe: "Gabagool",
            country: "Italy",
            fullName: "Albert Anastasia",
            state: "Metropolitan City of Florence",
            username: "albertanastasia",
        },
        {
            emailVerified: null,
            _id: "6596717a653eb95e60ebf2a0",
            email: "testingaccount@gmail.com",
            password:
                "$2b$12$uUegQkQ5lqAj52l0eKZxY.vEctCHdqAlBVVYWxYmOdtTmxQTbp5nm",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-04T08:51:07.501Z",
            aboutMe: "",
            country: "Australia",
            fullName: "Testing Account",
            state: "Western Australia",
            username: "testing",
        },
        {
            emailVerified: null,
            _id: "65967b96653eb95e60ebf2cd",
            email: "testing@gmail.com",
            password:
                "$2b$12$CioMJCxXwKoJNcx1N6UIU.LMMmYX.ttnfLURo4YsA8YCdQ0w/L.4.",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-04T09:34:16.172Z",
            aboutMe: "",
            country: "Australia",
            fullName: "Testing Account",
            state: "Western Australia",
            username: "hysteria",
        },
        {
            emailVerified: null,
            _id: "659793dc530cd540e5f601a3",
            email: "meow@domain.com",
            password:
                "$2b$12$G11Gmadlwub7UXdjA1IzGufIXO9kP.RbtOLbO/0CF3FAd1iatCIJm",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-05T05:30:05.200Z",
            aboutMe: "asd",
            country: "Afghanistan",
            fullName: "asd",
            state: "Badakhshan",
            username: "asd",
        },
        {
            emailVerified: null,
            _id: "659794d9584318eb546c38f3",
            email: "asd@domain.com",
            password:
                "$2b$12$cznv.QB8.f4.r3vCaLfFLeKEUUTmaYsz0QRa2OYLSahf4kowNOpSW",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-05T05:34:18.466Z",
            aboutMe: "asd",
            country: "Afghanistan",
            fullName: "asd",
            state: "Badakhshan",
            username: "asd",
        },
        {
            emailVerified: null,
            _id: "6597ccd71f83f97e7e6e859d",
            email: "testingemail@gmail.com",
            password:
                "$2b$12$mwe2UfxlwXQ2dxVncC.Qbu9SiOk70jMa1TiNagH7igeTsCMXCr5X6",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-05T09:33:12.484Z",
            aboutMe: "",
            country: "Austria",
            fullName: "Testing Profile Account",
            state: "Vienna",
            username: "testingaccount",
        },
        {
            _id: "659b4bbb6ef72bda857f498d",
            name: "Al John Ramirez",
            email: "aljohn1997@gmail.com",
            image: "https://lh3.googleusercontent.com/a/ACg8ocJUrJFXnbkox_Isnu4o3rCTzhxyLwb77sLyiAYfZ7sT=s96-c",
            emailVerified: null,
            createdAt: "2024-01-08T01:11:23.854Z",
            balance: 80,
            isActive: true,
        },
        {
            emailVerified: null,
            _id: "659b6878668f908297c4a83f",
            email: "testing1@email.com",
            password:
                "$2b$12$D8pbYqI5aLbVlzEa//BTZO/yan4cypD67njM6B0.2NhyjBgDWnZ/i",
            isActive: true,
            balance: 90,
            createdAt: "2024-01-08T03:14:01.606Z",
            aboutMe: "",
            country: "Armenia",
            fullName: "test one",
            state: "Kotayk Region",
            username: "test1",
        },
        {
            emailVerified: null,
            _id: "659be3fa56cdbf3dadac8f1e",
            email: "testaccounte2@gmail.com",
            password:
                "$2b$12$cHkWtoaTnAlVsiINUvuk6ekjhXPuU6iC6s9raPw/dEPpDr8BVroWy",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-08T12:00:59.365Z",
        },
        {
            emailVerified: null,
            _id: "659c9dda85d6a4aa9236b895",
            email: "sampleman@domain.com",
            password:
                "$2b$12$8wDkcpPz9VrVE1FkQk.16etbitXmc50.N6Sj8u46BHYIQ/2SdNKVi",
            isActive: true,
            balance: 70,
            createdAt: "2024-01-09T01:14:03.652Z",
            aboutMe: "asdasd",
            country: "Afghanistan",
            fullName: "asdasd",
            state: "Badakhshan",
            username: "asdasdasd",
        },
        {
            emailVerified: null,
            _id: "65a050f83a3abfd00d66f140",
            email: "rickdeaconx@gmail.com",
            password:
                "$2b$12$POb9DRsColhfNfkffoWXlOKmRUjdOdWdKtrg23H24QGC0N9fHDtBu",
            isActive: true,
            balance: 0,
            createdAt: "2024-01-11T20:35:05.672Z",
            aboutMe: "",
            country: "United States",
            fullName: "Rick Deacon",
            state: "Ohio",
            username: "thesecondboss",
        },
        {
            emailVerified: null,
            _id: "65a58cd5285e745313bc6024",
            email: "twoseatsorless@gmail.com",
            password:
                "$2b$12$LHRSHxaTDL69XQNFlwZfTegwFKmD.BioXlSXOEjnTAh5EUyYSDBAK",
            isActive: true,
            balance: 0,
            createdAt: "2024-01-15T19:51:50.513Z",
            aboutMe: "Loves cars",
            country: "United States",
            fullName: "Ryan T",
            state: "California",
            username: "RyanT",
        },
        {
            emailVerified: null,
            _id: "65a6d34b084b20e67ac0337d",
            email: "rafael.saito@hotmail.com.br",
            password:
                "$2b$12$6V91MrujRRImkhSbCGgqYe8NkacmKPjO9bJeGyp60Dz9z4VenB74y",
            isActive: true,
            balance: 0,
            createdAt: "2024-01-16T19:04:50.959Z",
            aboutMe: "",
            country: "United States",
            fullName: "Rafael",
            state: "Ohio",
            username: "RAFASAITO",
        },
        {
            emailVerified: null,
            _id: "65a777924e34be0a0e515514",
            email: "non-admin@user.com",
            password:
                "$2b$12$lDpWyWLwVF1RQarpl5UZuOIlxOi7CsPh6cjp9ZLQcu6r0ZKorrHp6",
            isActive: true,
            balance: 100,
            createdAt: "2024-01-17T06:45:39.946Z",
        },
    ];

    const userIDs = [
        "65713906486ffc13da5e69e2",
        "6571434721dafaf1855e236b",
        "657912e3d68d02a8fdcdecf6",
        "657bbe644f5e26c5b783616f",
        "657bbf7c4f5e26c5b7836173",
        "657c08123b77c383695552a7",
        "657fecaef796fdf6ee746221",
        "6581213b4f3e51c9b5882951",
        "65824ed1db2ea85500c815d9",
        "6582506deecb0e062d457beb",
        "658253aa0389e2739141ae4d",
        "6583d3ba570afd089774f1f4",
        "65841aee606c0bdf80a6bf8e",
        "658d592b0afac4c01efff1e6",
        "6594d9ec8ca9a47b92b7a289",
        "6596717a653eb95e60ebf2a0",
        "65967b96653eb95e60ebf2cd",
        "659793dc530cd540e5f601a3",
        "659794d9584318eb546c38f3",
        "6597ccd71f83f97e7e6e859d",
        "659b4bbb6ef72bda857f498d",
        "659b6878668f908297c4a83f",
        "659be3fa56cdbf3dadac8f1e",
        "659c9dda85d6a4aa9236b895",
        "65a050f83a3abfd00d66f140",
        "65a58cd5285e745313bc6024",
        "65a6d34b084b20e67ac0337d",
        "65a777924e34be0a0e515514",
    ];

    const saveEdits = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // try {
        //     const updatedUserInfo = await editUserInfo(
        //         userInfo.user._id,
        //         edits
        //     );
        // } catch (error: any) {
        //     console.error("Error updating user:", error.message);
        // }
        const userids = users.map((user) => user._id);
        console.log(userids);
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
                        <button className="tw-text-[#0f1923] tw-bg-[#f2ca16] tw-text-base tw-font-bold tw-px-3.5 tw-py-2.5 tw-rounded">
                            SAVE
                        </button>
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
                                    defaultValue="Country"
                                >
                                    <option defaultValue="">
                                        Select Country
                                    </option>
                                    {countries.map((country) => (
                                        <option
                                            key={country.isoCode}
                                            value={country.isoCode}
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
                                    defaultValue="Country"
                                >
                                    <option defaultValue="">
                                        Select State
                                    </option>
                                    <option defaultValue="Philippines">
                                        NCR
                                    </option>
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
                            ralph@company.com
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
