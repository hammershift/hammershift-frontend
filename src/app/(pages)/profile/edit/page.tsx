"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
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
      const updatedUserInfo = await editUserInfo(userInfo.user._id, edits);
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
      <form onSubmit={saveEdits} className="px-6 text-sm sm:w-[862px] lg:px-0">
        <div className="border-b-[1px] border-b-[#1b252e] py-8 sm:pt-[80px]">
          <div className="flex justify-between">
            <div className="text-4xl font-bold">My Details</div>
            {saved ? (
              <button className="rounded bg-white px-3.5 py-2.5 text-base font-bold text-black">
                SAVED
              </button>
            ) : (
              <button className="rounded bg-[#f2ca16] px-3.5 py-2.5 text-base font-bold text-[#0f1923]">
                SAVE
              </button>
            )}
          </div>
          <div>
            <div className="sm:mb-6 sm:mt-8 sm:flex sm:items-center sm:gap-6">
              <Image
                src={AvatarOne}
                alt=""
                className="mb-6 mt-8 w-[100px] rounded-full sm:m-0 sm:w-[120px]"
              />
              <div className="sm:w-[82%]">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={data?.user.name}
                  className="mb-6 mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none sm:mb-0"
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
              defaultValue={data?.user.username!}
              className="mb-6 mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none"
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
              className="mb-5 mt-2 block w-full resize-none rounded bg-[#172431] px-3 py-2.5 outline-none"
              rows={10}
              onChange={(e) =>
                setEdits({
                  ...edits,
                  aboutMe: e.target.value,
                })
              }
            ></textarea>
            <div className="flex justify-between gap-5">
              <div className="w-1/2">
                <label htmlFor="country">Country *</label>
                <select
                  className="mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none"
                  onChange={(e) => handleCountrySelect(e.target.value)}
                >
                  <option>Select Country</option>
                  {countries.map((country) => (
                    <option
                      key={country.isoCode}
                      value={country.isoCode}
                      selected={country.name === userInfo.user?.country}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/2">
                <label htmlFor="state">State *</label>
                <select
                  className="mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none"
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
                      selected={state.name === userInfo.user?.state}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b-[1px] border-b-[#1b252e] py-8">
          <div className="mb-6 text-2xl font-bold">Links</div>
          <div>
            <div className="gap-4 sm:flex">
              <label htmlFor="twitterLink" className="sm:w-[23%]">
                <div className="rounded bg-[#172431] px-3 py-2.5">Twitter</div>
              </label>
              <div className="mb-4 flex gap-4 sm:w-[95%]">
                <input
                  type="url"
                  name="twitterLink"
                  placeholder="https://"
                  className="mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none sm:mt-0"
                ></input>
                <button>
                  <Image src={DeleteIcon} alt="" className="w-[25px]" />
                </button>
              </div>
            </div>
            <div className="gap-4 sm:flex">
              <label htmlFor="twitterLink" className="sm:w-[23%]">
                <div className="rounded bg-[#172431] px-3 py-2.5">Website</div>
              </label>
              <div className="mb-4 flex gap-4 sm:w-[95%]">
                <input
                  type="url"
                  name="websiteLink"
                  placeholder="https://"
                  className="mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none sm:mt-0"
                ></input>
                <button>
                  <Image src={DeleteIcon} alt="" className="w-[25px]" />
                </button>
              </div>
            </div>
            <div className="gap-4 sm:flex">
              <label htmlFor="twitterLink" className="sm:w-[23%]">
                <div className="rounded bg-[#172431] px-3 py-2.5">LinkedIn</div>
              </label>
              <div className="mb-4 flex gap-4 sm:w-[95%]">
                <input
                  type="url"
                  name="linkedinLink"
                  placeholder="https://"
                  className="mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none sm:mt-0"
                ></input>
                <button>
                  <Image src={DeleteIcon} alt="" className="w-[25px]" />
                </button>
              </div>
            </div>
            <div className="gap-4 sm:flex">
              <label htmlFor="twitterLink" className="sm:w-[23%]">
                <div className="rounded bg-[#172431] px-3 py-2.5">
                  BringaTrailer
                </div>
              </label>
              <div className="mb-4 flex gap-4 sm:w-[95%]">
                <input
                  type="url"
                  name="bringATrailerLink"
                  placeholder="https://"
                  className="mt-2 block w-full rounded bg-[#172431] px-3 py-2.5 outline-none sm:mt-0"
                ></input>
                <button>
                  <Image src={DeleteIcon} alt="" className="w-[25px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b-[1px] border-b-[#1b252e] py-8">
          <div className="mb-6 text-2xl font-bold">Account</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="rounded bg-[#172431] px-3 py-2.5 sm:w-[252px]">
              {userInfo.user?.email}
            </div>
            <button
              className="rounded bg-white py-2.5 text-base font-bold text-[#0f1923] sm:px-3 sm:py-2.5"
              type="button"
            >
              Save Email
            </button>
          </div>
          <button
            className="mt-4 w-full rounded border-[1px] py-2.5 text-base sm:w-auto sm:px-3"
            type="button"
          >
            Reset Password
          </button>
        </div>
        <div className="py-8 sm:pb-[80px]">
          <div className="mb-6 text-2xl font-bold">Notification</div>
          <input type="checkbox" name="account" />
          <label htmlFor="account" className="ml-2 font-bold">
            Account
          </label>
          <div className="mb-4 pl-[21px] text-[#b7babd]">
            Excepteur sint obcaecat cupiditat non proident culpa
          </div>
          <input type="checkbox" name="wagers" />
          <label htmlFor="wagers" className="ml-2 font-bold">
            Wagers
          </label>
          <div className="mb-4 pl-[21px] text-[#b7babd]">
            Inmensae subtilitatis, obscuris et malesuada fames.
          </div>
          <input type="checkbox" name="watchlist" />
          <label htmlFor="watchlist" className="ml-2 font-bold">
            Watchlist
          </label>
          <div className="mb-4 pl-[21px] text-[#b7babd]">
            Cras mattis iudicium purus sit amet fermentum.
          </div>
          <input type="checkbox" name="marketing" />
          <label htmlFor="marketing" className="ml-2 font-bold">
            Marketing
          </label>
          <div className="mb-6 pl-[21px] text-[#b7babd]">
            Gallia est omnis divisa in partes tres, quarum.
          </div>
          <button
            className="w-full rounded border-[1px] border-[#c2451e] px-3.5 py-2.5 text-base text-[#c2451e] sm:w-auto"
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
