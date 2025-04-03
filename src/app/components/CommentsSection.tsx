"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import Link from "next/link";
import {
  RegExpMatcher,
  TextCensor,
  asteriskCensorStrategy,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
// images
import ArrowDown from "../../../public/images/arrow-down.svg";
import AvatarOne from "../../../public/images/avatar-one.svg";
import ThreeDots from "../../../public/images/dots-vertical.svg";
import ThumbsUp from "../../../public/images/thumbs-up.svg";
import ThumbsDown from "../../../public/images/thumbs-down.svg";
import CornerDownRight from "../../../public/images/corner-down-right.svg";
import BlueThumbUp from "../../../public/images/thumbs-up-blue.svg";
import BlueThumbsDown from "../../../public/images/thumbs-down-blue.svg";
//components
import {
  createComment,
  deleteComment,
  dislikeComment,
  getComments,
  likeComment,
  createReply,
  deleteReply,
  likeReply,
  dislikeReply,
  getReplies,
} from "@/lib/data";

export const CommentsSection = ({
  pageID,
  pageType,
}: {
  pageID: string; // auction or tournament ID
  pageType: "auction" | "tournament"; // "auction" or "tournament"
}) => {
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
        const response = await getComments(pageID, pageType, sort);
        if (response) {
          setCommentsList(response.comments);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setIsLoading(false);
    };
    if (pageID) {
      fetchComments();
    }
  }, [sort, reload]);

  // sets displayed comments to 3 when sort is changed
  useEffect(() => {
    setCommentsDisplayed(3);
  }, [sort]);

  const handleLoadComments = () => {
    if (commentsDisplayed < commentsList.length) {
      setCommentsDisplayed((prevCount) =>
        Math.min(prevCount + 3, commentsList.length)
      );
    }
  };

  // handle submit comment
  const handlePostComment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (comment == "") {
      setInputAlert(true);
      handleAlertTimer();
      console.log("comment is empty");
      return;
    } else {
      if (session.data?.user.id) {
        try {
          const response = await createComment(pageID, pageType, comment);

          if (response) {
            console.log("comment has been posted");
            setComment("");
            setReload((prev: number) => prev + 1);
          }
        } catch (error) {
          console.error("error posting comment:", error);
        }
      } else {
        console.log("You cannot post a comment. Please log in first");
        setCommentAlert(true);
        handleAlertTimer();
      }
    }
  };

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
    <div className="mt-16 max-w-[832px] mb-8 md:mb-16 sm:mb-0">
      <div className="flex justify-between">
        <div className="text-xl md:text-3xl">
          <span className="font-bold">Comments</span>
          {`(${Array.isArray(commentsList) && commentsList.length > 0
              ? commentsList.length
              : 0
            })`}
        </div>
        {session.status == "unauthenticated" && (
          <div className="flex items-center text-sm sm:text-base">
            {/* <Image
                            src={BellIcon}
                            width={16}
                            height={16}
                            alt="Bell"
                            className="w-4 h-4"
                        /> */}
            <Link href="/login_page">
              <div className="text-[14px] opacity-50 ml-4">Log in</div>
            </Link>
            <Link href="/create_account">
              <div className="text-[14px] opacity-50 ml-4">
                Sign Up
              </div>
            </Link>
          </div>
        )}
      </div>
      <div className="flex my-3">
        <div className="relative flex w-full items-center bg-[#172431] py-2.5 px-3 rounded">
          <input
            type="text"
            value={comment}
            placeholder="Add a comment"
            className="bg-[#172431] w-full outline-none"
            name="comment"
            onChange={(e) => setComment(e.target.value)}
          />

          {/* <Image
                        src={CameraPlus}
                        width={20}
                        height={20}
                        alt="camera plus"
                        className="w-5 h-5"
                    />
                    <Image
                        src={GifIcon}
                        width={20}
                        height={20}
                        alt="gif"
                        className="w-5 h-5 ml-2"
                    /> */}
        </div>
        <button
          className={`ml-2 rounded bg-white/20 px-4 ${session.status == "unauthenticated"
              ? "opacity-50 disabled"
              : "btn-white"
            }`}
          onClick={handlePostComment}
        >
          Comment
        </button>
      </div>
      {commentAlert && (
        <AlertMessage message="Please login before commenting" />
      )}
      {inputAlert && <AlertMessage message="Input is empty" />}
      <div className=" mt-2 flex items-center text-sm sm:text-base">
        <div>Sort by</div>
        <div
          className="font-bold ml-2 cursor-pointer"
          onClick={(e) => setSortDropdown((prev) => !prev)}
        >
          {sort}
        </div>
        <div className="relative">
          <button onClick={(e) => setSortDropdown((prev) => !prev)}>
            <Image
              src={ArrowDown}
              width={14}
              height={14}
              alt="arrow down"
              className="w-[14px] h-[14px] ml-2"
            />
          </button>
          {sortDropdown && (
            <div
              ref={dropdownRef}
              className="absolute grid rounded top-8 right-0 py-2 px-2 bg-[#172431] z-10"
            >
              <div
                onClick={(e) => setSort("Newest")}
                className={`cursor-pointer py-2 px-3 text-center ${sort == "Newest" ? "bg-white/10" : ""
                  }`}
              >
                Newest
              </div>
              <div
                onClick={(e) => setSort("Oldest")}
                className={`cursor-pointer py-2 px-3 text-center ${sort == "Oldest" ? "bg-white/10" : ""
                  }`}
              >
                Oldest
              </div>
              <div
                onClick={(e) => setSort("Best")}
                className={`cursor-pointer py-2 px-3 text-center ${sort == "Best" ? "bg-white/10" : ""
                  }`}
              >
                Best
              </div>
            </div>
          )}
        </div>
      </div>
      <section>
        {isLoading ? (
          <div className="flex w-full justify-center h-12 items-center">
            <BeatLoader color="#f2ca16" />
          </div>
        ) : Array.isArray(commentsList) && commentsList.length > 0 ? (
          commentsList
            .slice(0, commentsDisplayed)
            .map((item: any, index: any) => (
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
                  commenterUserID={item.user.userId}
                  pageID={pageID}
                  session={session}
                  pageType={pageType}
                />
              </div>
            ))
        ) : (
          <div className="w-full h-12 flex justify-center items-center">
            No Comments Yet
          </div>
        )}
        {commentsDisplayed < commentsList.length && (
          <button
            className="btn-transparent-white w-full mt-8 text-sm"
            onClick={handleLoadComments}
          >
            {`Load ${Math.min(
              commentsList.length - commentsDisplayed,
              3
            )} more comment(s)`}
          </button>
        )}
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
  commenterUserID,
  pageID,
  session,
  pageType,
}: {
  comment: string;
  username: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  commentID: string;
  userID: string;
  setReload: any;
  commenterUserID: string;
  pageID: string;
  session: any;
  pageType: "auction" | "tournament";
}) => {
  const dropdownRef = useRef<any | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [likeDislikeAlert, setLikeDislikeAlert] = useState(false);
  const [replyInput, setReplyInput] = useState(false);
  const [replyDropdown, setReplyDropdown] = useState(false);
  const [replies, setReplies] = useState([]);
  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const censor = new TextCensor().setStrategy(asteriskCensorStrategy());
  const matches = matcher.getAllMatches(comment);

  useEffect(() => {
    async function fetchReplies() {
      const replies = await getReplies(commentID);
      setReplies(replies);
    }
    fetchReplies();
  }, []);

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
        console.error("error in liking comment:", error);
      }
    } else {
      setLikeDislikeAlert(true);
      handleAlertTimer();
      console.log("Cannot like comment. Please log in first");
      return;
    }
  };

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
        console.error("error in disliking comment:", error);
      }
    } else {
      setLikeDislikeAlert(true);
      handleAlertTimer();
      console.log("Cannot dislike comment. Please log in first");
    }
  };
  const handleDeleteComment = async () => {
    if (userID) {
      try {
        const response = await deleteComment(
          commentID,
          userID,
          commenterUserID
        );

        if (response) {
          console.log("comment has been deleted");
          setReload((prev: number) => prev + 1);
        } else {
          console.log("comment has not been deleted. Incorrect user");
        }
      } catch (error) {
        console.error("error in deleting comment:", error);
      }
    } else {
      setDropdown(false);
      setDeleteAlert(true);
      handleAlertTimer();
      console.log("Cannot delete comment. Please login first");
    }
  };

  const handleAlertTimer = () => {
    setTimeout(() => {
      setDeleteAlert(false);
      setLikeDislikeAlert(false);
    }, 2000);
  };

  return (
    <div className="flex mt-8 text-[14px]">
      <Image
        src={AvatarOne}
        width={40}
        height={40}
        alt="camera plus"
        className="w-10 h-10 ml-2"
      />
      <div className="ml-4">
        <div className="relative flex justify-between">
          <div>
            <span className="font-bold">{username}</span>
            <span className="text-[#F2CA16] ml-2">User</span>
            <span className="opacity-50 ml-2">
              {dayjs(createdAt).fromNow()}
            </span>
          </div>
          <div onClick={(e) => setDropdown((prev) => !prev)}>
            <Image
              src={ThreeDots}
              width={16}
              height={16}
              alt="dots"
              className="w-4 h-4 ml-4"
            />
          </div>
          {dropdown && (
            <div
              ref={dropdownRef}
              className="absolute grid rounded top-8 right-0 bg-[#172431] z-10"
            >
              <div
                onClick={handleDeleteComment}
                className={`cursor-pointer py-2 px-3 text-center`}
              >
                Delete
              </div>
            </div>
          )}
          {deleteAlert && (
            <AlertMessage message="Please login before deleting" />
          )}
        </div>
        <div className=" my-3 h-max-[100px] md:h-auto ellipsis overflow-hidden">
          {censor.applyTo(comment, matches)}
        </div>
        <div className="flex opacity-50 items-center">
          <div
            onClick={(e) => setReplyInput((prev) => !prev)}
            className="cursor-pointer"
          >
            Reply
          </div>
          <span className="ml-4">·</span>

          <div className="flex items-center" onClick={handleLiking}>
            {likes.includes(userID) ? (
              <div className="ml-4">
                <Image
                  src={BlueThumbUp}
                  alt="thumbs up"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsUp}
                  width={16}
                  height={16}
                  alt="thumbs commentID: string, reply: string, auctionID: string, reply: stringtring-h-4 ml-4"
                />
              </div>
            )}
            {likes.length > 0 && <div className="ml-1">{likes.length}</div>}
            <div></div>
          </div>
          <div className="flex items-center" onClick={handleDisliking}>
            {dislikes.includes(userID) ? (
              <div className="ml-4">
                <Image
                  src={BlueThumbsDown}
                  alt="thumbs down"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsDown}
                  width={16}
                  height={16}
                  alt="thumbs down"
                  className="w-4 h-4 ml-4"
                />
              </div>
            )}
            {dislikes.length > 0 && (
              <div className="ml-1">{dislikes.length}</div>
            )}
            <div></div>
          </div>
        </div>

        {replyInput && (
          <ReplyInputDropdown
            session={session}
            setReload={setReload}
            commentID={commentID}
            pageID={pageID}
            pageType={pageType}
          />
        )}

        {likeDislikeAlert && (
          <AlertMessage message="Please login before liking or disliking" />
        )}

        {replies.length > 0 && (
          <div>
            <div
              className="text-[#42A0FF] mt-3 flex cursor-pointer"
              onClick={(e) => setReplyDropdown((prev) => !prev)}
            >
              <Image
                src={CornerDownRight}
                width={16}
                height={16}
                alt="camera plus"
                className="w-4 h-4 mr-2 "
              />
              {`${replies.length} ${replies.length > 1 ? "Replies" : "Reply"}`}
            </div>
            {replyDropdown && (
              <div>
                <div className="h-[1px] w-full mt-3 bg-white/10"></div>
                {replies.map((item: any, index: any) => (
                  <ReplyCard
                    key={item._id}
                    replyID={item._id}
                    reply={item.comment}
                    replyUserID={item.user?.userId}
                    username={item.user?.username}
                    createdAt={item.createdAt}
                    commentID={commentID}
                    likes={item.likes || []}
                    dislikes={item.dislikes || []}
                    userID={session.data?.user.id}
                    setReload={setReload}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReplyInputDropdown = ({
  session,
  setReload,
  commentID,
  pageID,
  pageType,
}: {
  session: any;
  setReload: any;
  commentID: string;
  pageID: string;
  pageType: "auction" | "tournament";
}) => {
  const [reply, setReply] = useState("");
  const [replyAlert, setReplyAlert] = useState(false);
  const [replyInputAlert, setReplyInputAlert] = useState(false);

  const handlePostReply = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (reply == "") {
      console.log("reply input is empty");
      setReplyInputAlert(true);
      handleAlertTimer();
      return;
    } else {
      if (session.data?.user.id) {
        try {
          const response = await createReply(pageID, pageType, reply);

          if (response) {
            console.log("reply has been posted");
            setReply("");
            setReload((prev: number) => prev + 1);
          }
        } catch (error) {
          console.error("error posting reply:", error);
        }
      } else {
        console.log("You cannot post a reply. Please log in first");
      }
    }
  };

  const handleAlertTimer = () => {
    setTimeout(() => {
      setReplyInputAlert(false);
      setReplyAlert(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <div className="relative flex my-3">
        <div className="relative flex w-full items-center bg-[#172431] py-2.5 px-3 rounded">
          <input
            type="text"
            value={reply}
            placeholder="Add a reply"
            className="bg-[#172431] w-full"
            name="comment"
            onChange={(e) => setReply(e.target.value)}
          />
        </div>
        <button
          className={`ml-2 rounded bg-white/20 px-4 ${session.status == "unauthenticated"
              ? "opacity-50 disabled"
              : "btn-white"
            }`}
          onClick={handlePostReply}
        >
          Reply
        </button>
      </div>
      {replyAlert && <AlertMessage message="Please login before deleting" />}
      {replyInputAlert && <AlertMessage message="Input is empty" />}
    </div>
  );
};

const ReplyCard = ({
  userID,
  username,
  replyID,
  reply,
  replyUserID,
  commentID,
  likes,
  dislikes,
  createdAt,
  setReload,
}: {
  userID: string;
  username: string;
  replyID: string;
  reply: string;
  replyUserID: string;
  commentID: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  setReload: any;
}) => {
  const [dropdown, setDropdown] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [likeDislikeAlert, setLikeDislikeAlert] = useState(false);
  const dropdownRef = useRef<any | null>(null);
  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const censor = new TextCensor().setStrategy(asteriskCensorStrategy());
  const matches = matcher.getAllMatches(reply);

  const handleDeleteReply = async () => {
    setDropdown(false);
    //check if user is logged in
    if (userID) {
      //check if user is the the one who posted the reply
      if (userID == replyUserID) {
        try {
          const response = await deleteReply(
            replyID,
            userID,
            replyUserID,
            commentID
          );

          if (response) {
            console.log("reply has been deleted");
            setReload((prev: number) => prev + 1);
          } else {
            console.log("reply has not been deleted. Incorrect user");
          }
        } catch (error) {
          console.error("error in deleting comment:", error);
        }
      } else {
        console.log("Cannot delete reply. Incorrect user");
        return;
      }
    } else {
      console.log("Cannot delete reply. Please login first");
      setDeleteAlert(true);
      handleAlertTimer();
    }
  };

  const handleLiking = async () => {
    if (userID) {
      try {
        const response = await likeComment(replyID, userID, likes);
        if (response) {
          console.log("reply has been liked");
          setReload((prev: number) => prev + 1);
        }
      } catch (error) {
        console.error("error in liking reply:", error);
      }
    } else {
      setLikeDislikeAlert(true);
      handleAlertTimer();
      console.log("Cannot like reply. Please login first");
      return;
    }
  };

  const handleDisliking = async () => {
    if (userID) {
      try {
        const response = await dislikeComment(replyID, userID, dislikes);
        if (response) {
          console.log("reply has been disliked");
          setReload((prev: number) => prev + 1);
        }
      } catch (error) {
        console.error("error in disliking reply:", error);
      }
    } else {
      setLikeDislikeAlert(true);
      handleAlertTimer();
      console.log("Cannot dislike reply. Please login first");
    }
  };

  const handleAlertTimer = () => {
    setTimeout(() => {
      setLikeDislikeAlert(false);
      setDeleteAlert(false);
    }, 2000);
  };

  return (
    <div className="flex mt-4 text-xs text-[14px]">
      <Image
        src={AvatarOne}
        width={24}
        height={24}
        alt="camera plus"
        className="w-6 h-6 ml-2"
      />
      <div className="ml-4">
        <div className="relative flex justify-between">
          <div>
            <span className="font-bold">{username}</span>
            <span className="text-[#F2CA16] ml-1">User</span>
            <span className="opacity-50 ml-1">
              {dayjs(createdAt).fromNow()}
            </span>
          </div>
          <div onClick={(e) => setDropdown((prev) => !prev)}>
            <Image
              src={ThreeDots}
              width={16}
              height={16}
              alt="dots"
              className="w-4 h-4 ml-4"
            />
          </div>
          {dropdown && (
            <div
              ref={dropdownRef}
              className="absolute grid rounded top-6 right-0 bg-[#172431] z-10 hover:bg-white/10"
            >
              <div
                onClick={handleDeleteReply}
                className={`cursor-pointer py-2 px-3 text-center `}
              >
                Delete
              </div>
            </div>
          )}
          {deleteAlert && (
            <AlertMessage message="Please login before deleting" />
          )}
        </div>
        <div className=" my-3 h-max-[100px] md:h-auto ellipsis overflow-hidden">
          {censor.applyTo(reply, matches)}
        </div>
        <div className="flex opacity-50 items-center">
          <div className="flex items-center" onClick={handleLiking}>
            {likes.includes(userID) ? (
              <div>
                <Image
                  src={BlueThumbUp}
                  alt="thumbs up"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsUp}
                  width={16}
                  height={16}
                  alt="thumbs up"
                  className="w-4 h-4"
                />
              </div>
            )}
            {likes.length > 0 && <div className="ml-1">{likes.length}</div>}
            <div></div>
          </div>
          <div className="flex items-center" onClick={handleDisliking}>
            {dislikes.includes(userID) ? (
              <div className="ml-4">
                <Image
                  src={BlueThumbsDown}
                  alt="thumbs down"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsDown}
                  width={16}
                  height={16}
                  alt="thumbs down"
                  className="w-4 h-4 ml-4"
                />
              </div>
            )}
            {dislikes.length > 0 && (
              <div className="ml-1">{dislikes.length}</div>
            )}
            <div></div>
          </div>
        </div>
        {likeDislikeAlert && (
          <AlertMessage message="Please login before liking or disliking" />
        )}
      </div>
    </div>
  );
};

const AlertMessage = ({ message }: { message: string }) => {
  return (
    <div className="flex justify-center items-center text-sm text-black bg-[#F2CA16] py-2 px-4 rounded">
      {message}
    </div>
  );
};
