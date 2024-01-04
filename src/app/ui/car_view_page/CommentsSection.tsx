"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import BellIcon from "../../../../public/images/bell-02.svg";
import ArrowDown from "../../../../public/images/arrow-down.svg";
import OpenWebLogo from "../../../../public/images/open-web-logo.svg";
import AvatarOne from "../../../../public/images/avatar-one.svg";
import ThreeDots from "../../../../public/images/dots-vertical.svg";
import ThumbsUp from "../../../../public/images/thumbs-up.svg";
import ThumbsDown from "../../../../public/images/thumbs-down.svg";
import CornerDownRight from "../../../../public/images/corner-down-right.svg";
import { createComment } from "@/lib/data";
import { set } from "mongoose";
import { BeatLoader } from "react-spinners";
import Link from "next/link";

export const CommentsSection = ({ comments, id, loading }: { comments: any, id: string, loading: boolean }) => {
    const [commentsList, setCommentsList] = useState([]);
    const [commentsDisplayed, setCommentsDisplayed] = useState(3);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const session = useSession();

    useEffect(() => {
        if (comments) {
            setCommentsList(comments.comments);
        }
    }, [comments]);

    useEffect(() => {
        setIsLoading(loading);
    }, [loading]);


    const handleLoadComments = () => {
        if (commentsDisplayed < commentsList.length) {
            setCommentsDisplayed(prevCount => Math.min(prevCount + 3, commentsList.length));
        }
    }

    const handlePostComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const response = await createComment(id, comment)

            if (response) {
                console.log("comment has been posted");
                setComment("");
                window.location.reload();
            }
        } catch (error) {
            console.error("error posting comment:", error);
        }

    }

    useEffect(() => {
        console.log("comment", comment);
    }, [comment]);

    return (
        <div className="tw-mt-16 tw-max-w-[832px] tw-mb-8 md:tw-mb-16 sm:tw-mb-0">
            <div className="tw-flex tw-justify-between">
                <div className="tw-text-xl md:tw-text-3xl">
                    <span className="tw-font-bold">Comments</span>
                    {`(${Array.isArray(commentsList) && commentsList.length > 0 ? commentsList.length : 0})`}
                </div>
                {
                    session.status == "unauthenticated" &&
                    <div className="tw-flex tw-items-center tw-text-sm sm:tw-text-base">
                        {/* <Image
                            src={BellIcon}
                            width={16}
                            height={16}
                            alt="Bell"
                            className="tw-w-4 tw-h-4"
                        /> */}
                        <Link href="/login_page">
                            <div className="tw-text-[14px] tw-opacity-50 tw-ml-4">
                                Log in
                            </div>
                        </Link>
                        <Link href="/create_account">
                            <div className="tw-text-[14px] tw-opacity-50 tw-ml-4">
                                Sign Up
                            </div>
                        </Link>
                    </div>
                }
            </div>
            <div className="tw-flex tw-my-3">
                <div className="tw-flex tw-w-full tw-items-center tw-bg-[#172431] tw-py-2.5 tw-px-3 tw-rounded">
                    <input
                        placeholder="Add a comment"
                        className="tw-bg-[#172431] tw-w-full"
                        name="comment"
                        onChange={(e) => setComment(e.target.value)}
                    />
                    {/* <Image
                        src={CameraPlus}
                        width={20}
                        height={20}
                        alt="camera plus"
                        className="tw-w-5 tw-h-5"
                    />
                    <Image
                        src={GifIcon}
                        width={20}
                        height={20}
                        alt="gif"
                        className="tw-w-5 tw-h-5 tw-ml-2"
                    /> */}
                </div>
                <button
                    className={`tw-ml-2 tw-rounded tw-bg-white/20 tw-px-4 ${session.status == "unauthenticated" ? "tw-opacity-50 tw-disabled" : "btn-white"}`}
                    onClick={handlePostComment}>Comment</button>
            </div>
            <div className="tw-mt-2 tw-flex tw-items-center tw-text-sm sm:tw-text-base">
                Sort by
                <span className="tw-font-bold tw-ml-2">Newest</span>
                <Image
                    src={ArrowDown}
                    width={14}
                    height={14}
                    alt="arrow down"
                    className="tw-w-[14px] tw-h-[14px] tw-ml-2"
                />
            </div>
            <section>
                {isLoading
                    ? <div className="tw-flex tw-w-full tw-justify-center tw-h-12 tw-items-center">
                        <BeatLoader color='#f2ca16' />
                    </div>
                    : (Array.isArray(commentsList) && commentsList.length > 0
                        ? commentsList.slice(0, commentsDisplayed).map((item: any, index: any) => (
                            <div key={item._id}>
                                <CommentsCard comment={item.comment} username={item.user.username} createdAt={item.createdAt} />
                            </div>
                        ))
                        :
                        <div className="tw-w-full tw-h-12 tw-flex tw-justify-center tw-items-center">
                            No Comments Yet
                        </div>
                    )}
                {commentsDisplayed < commentsList.length &&
                    <button
                        className="btn-transparent-white tw-w-full tw-mt-8 tw-text-sm"
                        onClick={handleLoadComments}>
                        {`Load ${Math.min(commentsList.length - commentsDisplayed, 3)} more comments`}
                    </button>
                }
                <div className="tw-flex tw-items-center tw-mt-8">
                    <span>Powered by</span>
                    <Image
                        src={OpenWebLogo}
                        width={97}
                        height={28}
                        alt="camera plus"
                        className="tw-w-[97px] tw-h-[28px] tw-ml-2"
                    />
                </div>
            </section>
        </div>
    );
};

export const CommentsCard = ({ comment, username, createdAt }: { comment: string, username: string, createdAt: string }) => {
    const timeSince = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const diffInMilliseconds = Math.abs(now.getTime() - date.getTime());
        const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

        if (diffInDays > 0) {
            return `${diffInDays} day(s) ago`;
        }

        return `${diffInHours} hour(s) ago`;
    };

    return (
        <div className="tw-flex tw-mt-8 tw-text-[14px]">
            <Image
                src={AvatarOne}
                width={40}
                height={40}
                alt="camera plus"
                className="tw-w-10 tw-h-10 tw-ml-2"
            />
            <div className="tw-ml-4">
                <div className="tw-flex tw-justify-between">
                    <div>
                        <span className="tw-font-bold">{username}</span>
                        <span className="tw-text-[#F2CA16] tw-ml-2">
                            User
                        </span>
                        <span className="tw-opacity-50 tw-ml-2">
                            {timeSince(createdAt)}
                        </span>
                    </div>
                    <Image
                        src={ThreeDots}
                        width={16}
                        height={16}
                        alt="thumbs up"
                        className="tw-w-4 tw-h-4 tw-ml-4"
                    />
                </div>
                <div className=" tw-my-3 tw-h-max-[100px] md:tw-h-auto tw-ellipsis tw-overflow-hidden">
                    {comment}
                </div>
                <div className="tw-flex tw-opacity-50">
                    Reply
                    <span className="tw-ml-4">·</span>
                    <Image
                        src={ThumbsUp}
                        width={16}
                        height={16}
                        alt="thumbs up"
                        className="tw-w-4 tw-h-4 tw-ml-4"
                    />
                    <Image
                        src={ThumbsDown}
                        width={16}
                        height={16}
                        alt="thumbs down"
                        className="tw-w-4 tw-h-4 tw-ml-4"
                    />
                </div>

                {/* <div className="tw-text-[#42A0FF] tw-mt-3 tw-flex">
                    <Image
                        src={CornerDownRight}
                        width={16}
                        height={16}
                        alt="camera plus"
                        className="tw-w-4 tw-h-4 tw-mr-2 "
                    />
                    1 Replay
                </div> */}
            </div>
        </div>
    );
};