"use client"
import React, { useEffect, useRef, useState } from "react";
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
import { createComment, deleteComment, dislikeComment, getComments, likeComment } from "@/lib/data";
import { BeatLoader } from "react-spinners";
import Link from "next/link";
import BlueThumbUp from "../../../../public/images/blue-thumbs-up.png";
import BlueThumbsDown from "../../../../public/images/blue-thumbs-down.png";


export const CommentsSection = ({ auctionID }: { auctionID: any }) => {
    const [sort, setSort] = useState("Best"); // "Newest", "Oldest", "Best"
    const [commentsList, setCommentsList] = useState([]);
    const [commentsDisplayed, setCommentsDisplayed] = useState(3);
    const [comment, setComment] = useState("");
    const [sortDropdown, setSortDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const session = useSession();
    const dropdownRef = useRef<any | null>(null);
    const [reload, setReload] = useState(0);
    const [commentAlert, setCommentAlert] = useState(false);
    const [inputAlert, setInputAlert] = useState(false);

    //fetch comments 
    useEffect(() => {
        const fetchComments = async () => {
            setSortDropdown(false);
            setIsLoading(true);
            try {
                const response = await getComments(auctionID, sort);
                if (response) {
                    setCommentsList(response.comments);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error:', error);
            }
            setIsLoading(false);
        };
        if (auctionID) {
            fetchComments();
        }
    }, [sort, reload])

    // sets displayed comments to 3 when sort is changed
    useEffect(() => {
        setCommentsDisplayed(3);
    }, [sort])


    const handleLoadComments = () => {
        if (commentsDisplayed < commentsList.length) {
            setCommentsDisplayed(prevCount => Math.min(prevCount + 3, commentsList.length));
        }
    }

    // handle submit comment
    const handlePostComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (comment == "") {
            setInputAlert(true);
            handleAlertTimer();
            console.log("comment is empty")
            return;
        } else {
            if (session.data?.user.id) {
                try {
                    const response = await createComment(auctionID, comment)

                    if (response) {
                        console.log("comment has been posted");
                        setComment("");
                        setReload((prev: number) => prev + 1);
                    }
                } catch (error) {
                    console.error("error posting comment:", error);
                }
            } else {
                console.log("You cannot post a comment. Please log in first")
                setCommentAlert(true);
                handleAlertTimer();
            }
        }
    }

    const handleAlertTimer = () => {
        setTimeout(() => {
            setCommentAlert(false);
            setInputAlert(false);
        }, 2000);
    };

    // check for comment changes
    // useEffect(() => {
    //     console.log("comment", comment);
    // }, [comment]);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSortDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


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
                <div className="tw-relative tw-flex tw-w-full tw-items-center tw-bg-[#172431] tw-py-2.5 tw-px-3 tw-rounded">
                    <input
                        type="text" value={comment}
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
            {commentAlert && <AlertMessage message="Please login before commenting" />}
            {inputAlert && <AlertMessage message="Input is empty" />}
            <div className=" tw-mt-2 tw-flex tw-items-center tw-text-sm sm:tw-text-base">
                <div >Sort by</div>
                <div className="tw-font-bold tw-ml-2 tw-cursor-pointer" onClick={e => setSortDropdown((prev) => !prev)}>{sort}</div>
                <div className="tw-relative">
                    <button onClick={e => setSortDropdown((prev) => !prev)}>
                        <Image
                            src={ArrowDown}
                            width={14}
                            height={14}
                            alt="arrow down"
                            className="tw-w-[14px] tw-h-[14px] tw-ml-2"
                        />
                    </button>
                    {sortDropdown &&
                        <div
                            ref={dropdownRef}
                            className="tw-absolute tw-grid tw-rounded tw-top-8 tw-right-0 tw-py-2 tw-px-2 tw-bg-[#172431] tw-z-10">
                            <div
                                onClick={e => setSort("Newest")}
                                className={`tw-cursor-pointer tw-py-2 tw-px-3 tw-text-center ${sort == "Newest" ? "tw-bg-white/10" : ""}`}
                            >Newest</div>
                            <div
                                onClick={e => setSort("Oldest")}
                                className={`tw-cursor-pointer tw-py-2 tw-px-3 tw-text-center ${sort == "Oldest" ? "tw-bg-white/10" : ""}`}
                            >Oldest</div>
                            <div
                                onClick={e => setSort("Best")}
                                className={`tw-cursor-pointer tw-py-2 tw-px-3 tw-text-center ${sort == "Best" ? "tw-bg-white/10" : ""}`}
                            >Best</div>
                        </div>
                    }
                </div>
            </div>
            <section>
                {isLoading
                    ? <div className="tw-flex tw-w-full tw-justify-center tw-h-12 tw-items-center">
                        <BeatLoader color='#f2ca16' />
                    </div>
                    : (Array.isArray(commentsList) && commentsList.length > 0
                        ? commentsList.slice(0, commentsDisplayed).map((item: any, index: any) => (
                            <div key={item._id}>
                                <CommentsCard
                                    comment={item.comment}
                                    username={item.user.username}
                                    createdAt={item.createdAt}
                                    likes={item.likes || []}
                                    dislikes={item.dislikes || []}
                                    commentID={item._id}
                                    userID={session.data?.user.id}
                                    setReload={setReload}
                                    commenterUserID={item.user.userId} />
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
                        {`Load ${Math.min(commentsList.length - commentsDisplayed, 3)} more comment(s)`}
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



export const CommentsCard = ({
    comment,
    username,
    createdAt,
    likes,
    dislikes,
    commentID,
    userID,
    setReload,
    commenterUserID
}: {
    comment: string,
    username: string,
    createdAt: string,
    likes: string[],
    dislikes: string[],
    commentID: string,
    userID: string,
    setReload: any,
    commenterUserID: string
}) => {
    const dropdownRef = useRef<any | null>(null);
    const [dropdown, setDropdown] = useState(false);
    const [deleteAlert, setDeleteAlert] = useState(false);
    const [likeDislikeAlert, setLikeDislikeAlert] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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


    const handleLiking = async (e: any) => {
        e.preventDefault();
        if (userID) {
            try {
                const response = await likeComment(commentID, userID, likes);

                if (response) {
                    console.log("comment has been liked");
                    setReload((prev: number) => prev + 1);
                }
            } catch (error) {
                console.error("error in liking comment:", error)
            }

        } else {
            setLikeDislikeAlert(true);
            handleAlertTimer();
            console.log("Cannot like comment. Please log in first")
            return;
        }

    }


    const handleDisliking = async (e: any) => {
        e.preventDefault();
        if (userID) {
            try {
                const response = await dislikeComment(commentID, userID, dislikes);

                if (response) {
                    console.log("comment has been liked");
                    setReload((prev: number) => prev + 1);
                }
            } catch (error) {
                console.error("error in disliking comment:", error)
            }
        } else {
            setLikeDislikeAlert(true);
            handleAlertTimer();
            console.log("Cannot dislike comment. Please log in first")
        }

    }
    const handleDeleteComment = async () => {
        if (userID) {
            try {
                const response = await deleteComment(commentID, userID, commenterUserID);

                if (response) {
                    console.log("comment has been deleted");
                    setReload((prev: number) => prev + 1);
                } else {
                    console.log("comment has not been deleted. Incorrect user");
                }
            } catch (error) {
                console.error("error in deleting comment:", error)
            }
        } else {
            setDropdown(false);
            setDeleteAlert(true);
            handleAlertTimer();
            console.log("Cannot delete comment. Please login first")
        }
    }

    const handleAlertTimer = () => {
        setTimeout(() => {
            setDeleteAlert(false);
            setLikeDislikeAlert(false);
        }, 2000);
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
                <div className="tw-relative tw-flex tw-justify-between">
                    <div>
                        <span className="tw-font-bold">{username}</span>
                        <span className="tw-text-[#F2CA16] tw-ml-2">
                            User
                        </span>
                        <span className="tw-opacity-50 tw-ml-2">
                            {timeSince(createdAt)}
                        </span>
                    </div>
                    <div onClick={e => setDropdown((prev) => !prev)}>
                        <Image
                            src={ThreeDots}
                            width={16}
                            height={16}
                            alt="dots"
                            className="tw-w-4 tw-h-4 tw-ml-4"
                        />
                    </div>
                    {dropdown && <div
                        ref={dropdownRef}
                        className="tw-absolute tw-grid tw-rounded tw-top-8 tw-right-0 tw-bg-[#172431] tw-z-10">
                        <div
                            onClick={handleDeleteComment}
                            className={`tw-cursor-pointer tw-py-2 tw-px-3 tw-text-center`}
                        >Delete</div>
                    </div>}
                    {deleteAlert && <AlertMessage message="Please login before deleting" />}
                </div>
                <div className=" tw-my-3 tw-h-max-[100px] md:tw-h-auto tw-ellipsis tw-overflow-hidden">
                    {comment}
                </div>
                <div className="tw-flex tw-opacity-50 tw-items-center">
                    Reply
                    <span className="tw-ml-4">·</span>

                    <div className="tw-flex tw-items-center" onClick={handleLiking}>
                        {likes.includes(userID)
                            ? <div className="tw-ml-4">
                                <Image src={BlueThumbUp} alt="thumbs up" width={16} height={16} className="tw-w-4 tw-h-4" />
                            </div>
                            : <div >
                                <Image
                                    src={ThumbsUp}
                                    width={16}
                                    height={16}
                                    alt="thumbs up"
                                    className="tw-w-4 tw-h-4 tw-ml-4"
                                />
                            </div>}
                        {likes.length > 0 && <div className="tw-ml-1">{likes.length}</div>}
                        <div></div>
                    </div>
                    <div className="tw-flex tw-items-center" onClick={handleDisliking}>
                        {dislikes.includes(userID)
                            ? <div className="tw-ml-4">
                                <Image src={BlueThumbsDown} alt="thumbs down" width={16} height={16} className="tw-w-4 tw-h-4" />
                            </div>
                            : <div >
                                <Image
                                    src={ThumbsDown}
                                    width={16}
                                    height={16}
                                    alt="thumbs down"
                                    className="tw-w-4 tw-h-4 tw-ml-4"
                                />
                            </div>}
                        {dislikes.length > 0 && <div className="tw-ml-1">{dislikes.length}</div>}
                        <div></div>
                    </div>

                </div>
                {likeDislikeAlert && <AlertMessage message="Please login before liking or disliking" />}

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


const AlertMessage = ({ message }: { message: string }) => {

    return (
        <div className="tw-flex tw-justify-center tw-items-center tw-text-sm tw-text-black tw-bg-[#F2CA16] tw-py-2 tw-px-4 tw-rounded">
            {message}
        </div>
    );
}