"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/auth-client";
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
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { TextArea } from "./ui/textarea";
import { UserIdName } from "../types/interfaces";
import { Input } from "./ui/input";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          console.log(response);
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
  const handlePostComment = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInputAlert(false);
    setCommentAlert(false);
    if (comment == "") {
      setIsSubmitting(false);
      setInputAlert(true);
      handleAlertTimer();
      console.log("comment is empty");
      return;
    } else {
      if (session.data?.user.email) {
        try {
          const response = await createComment(pageID, pageType, comment);

          if (response) {
            console.log("comment has been posted");
            setComment("");
            setIsSubmitting(false);
            setReload((prev: number) => prev + 1);
          }
        } catch (error) {
          console.error("error posting comment:", error);
        }
      } else {
        console.log("You cannot post a comment. Please log in first");
        setIsSubmitting(false);
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
    <div className="sm:mb-0 md:mb-16">
      <div className="flex justify-between">
        <div className="pb-4 text-xl">
          <span className="font-bold">Comments </span>
          {`( ${
            Array.isArray(commentsList) && commentsList.length > 0
              ? commentsList.length
              : 0
          } )`}
        </div>
      </div>
      {session.data?.user.email ? (
        <form onSubmit={handlePostComment} className="mb-6">
          <div className="space-y-3">
            <TextArea
              placeholder="Share your thoughts about this auction..."
              value={comment}
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => setComment(e.target.value)}
              className="min-h-[100px] border-[#1E2A36] bg-[#1E2A36] focus:border-[#F2CA16]"
            />

            {/* {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )} */}

            <div className="flex justify-end">
              <Button
                type="submit"
                aria-disabled={isSubmitting}
                className={`bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 ${isSubmitting ? "opacity-50" : ""}`}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-md border border-[#1E2A36] bg-[#1E2A36] p-4">
          <p className="text-center text-gray-400">
            Please log in to leave a comment.
          </p>
        </div>
      )}
      {commentAlert && (
        <AlertMessage message="Please login before commenting" />
      )}
      {inputAlert && <AlertMessage message="Input is empty" />}
      {/* <div className=" mt-2 flex items-center text-sm sm:text-base">
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
      </div> */}
      <section>
        {isLoading ? (
          <div className="flex h-12 w-full items-center justify-center">
            <BeatLoader color="#f2ca16" />
          </div>
        ) : Array.isArray(commentsList) && commentsList.length > 0 ? (
          commentsList
            .slice(0, commentsDisplayed)
            .map((item: any, index: any) => (
              <div key={item._id}>
                <CommentCard
                  comment={item.comment}
                  username={item.user.username}
                  createdAt={item.createdAt}
                  likes={item.likes || []}
                  dislikes={item.dislikes || []}
                  commentID={item._id}
                  userID={session.data?.user._id}
                  setReload={setReload}
                  commenterUserID={item.user.userId}
                  pageID={pageID}
                  session={session}
                  pageType={pageType}
                />
              </div>
            ))
        ) : (
          <div className="py-8 text-center text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        )}
        {commentsDisplayed < commentsList.length && (
          <button
            className="btn-transparent-white mt-8 w-full text-sm"
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

export const CommentCard = ({
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
  likes: UserIdName[];
  dislikes: UserIdName[];
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
  const [replyAlert, setReplyAlert] = useState(false);
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

  const handleReplying = async (e: any) => {
    if (userID) {
      setReplyInput(true);
    } else {
      setReplyAlert(true);
      handleAlertTimer();
      console.log("Cannot like reply. Please login first");
      return;
    }
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
      setReplyAlert(false);
    }, 2000);
  };

  return (
    <div className="mt-4 flex text-[14px]">
      {/* <Image
        src={AvatarOne}
        width={40}
        height={40}
        alt="camera plus"
        className="w-10 h-10 ml-2"
      /> */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F2CA16] text-black`}
      >
        {username?.[0]?.toUpperCase() || "U"}
      </div>
      <div className="ml-4 flex-1">
        <div className="relative flex justify-between">
          <div>
            <span className="font-bold">{username}</span>
            <span className="ml-2 text-[#F2CA16]">User</span>
            <span className="ml-2 opacity-50">
              {dayjs(createdAt).fromNow()}
            </span>
          </div>
          {session && username == session.data?.user.username && (
            <div onClick={(e) => setDropdown((prev) => !prev)}>
              <Image
                src={ThreeDots}
                width={16}
                height={16}
                alt="dots"
                className="ml-4 h-4 w-4"
              />
            </div>
          )}
          {dropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-8 z-10 grid rounded bg-[#172431]"
            >
              <div
                onClick={handleDeleteComment}
                className={`cursor-pointer px-3 py-2 text-center`}
              >
                Delete
              </div>
            </div>
          )}
          {/* {deleteAlert && (
            <AlertMessage message="Please login before deleting" />
          )} */}
        </div>
        <div className="h-max-[100px] ellipsis my-3 overflow-hidden text-justify md:h-auto">
          {censor.applyTo(comment, matches)}
        </div>
        <div className="flex items-center opacity-50">
          <div onClick={handleReplying} className="cursor-pointer">
            Reply
          </div>
          <span className="ml-4">·</span>

          <div className="flex items-center" onClick={handleLiking}>
            {likes.some((like) => like.userId === userID) ? (
              <div>
                <Image
                  src={BlueThumbUp}
                  alt="blue thumbs up"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsUp}
                  alt="thumbs up"
                  width={16}
                  height={16}
                  className="mr-2"
                />
              </div>
            )}
            {likes.length > 0 && <div>{likes.length}</div>}
            <div></div>
          </div>
          <div className="ml-2 flex items-center" onClick={handleDisliking}>
            {dislikes.some((dislike) => dislike.userId === userID) ? (
              <div>
                <Image
                  src={BlueThumbsDown}
                  alt="thumbs down"
                  width={20}
                  height={20}
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsDown}
                  alt="thumbs down"
                  width={16}
                  height={16}
                  className="mr-2"
                />
              </div>
            )}
            {dislikes.length > 0 && <div>{dislikes.length}</div>}
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

        {replyAlert && <AlertMessage message="Please login before replying" />}

        {likeDislikeAlert && (
          <AlertMessage message="Please login before liking or disliking" />
        )}

        {replies.length > 0 && (
          <div>
            {!replyDropdown && (
              <div
                className="mt-3 flex cursor-pointer text-[#42A0FF]"
                onClick={(e) => setReplyDropdown((prev) => !prev)}
              >
                <Image
                  src={CornerDownRight}
                  width={16}
                  height={16}
                  alt="camera plus"
                  className="mr-2 h-4 w-4"
                />
                {`${replies.length} ${replies.length > 1 ? "Replies" : "Reply"}`}
              </div>
            )}
            {replyDropdown && (
              <div>
                <div className="mt-3 h-[1px] w-full bg-white/10"></div>
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
                    userID={session.data?.user._id}
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostReply = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (reply == "") {
      console.log("reply input is empty");
      setReplyInputAlert(true);
      handleAlertTimer();
      setIsSubmitting(false);
      return;
    } else {
      if (session.data?.user.email) {
        try {
          const response = await createReply(
            commentID,
            pageID,
            pageType,
            reply
          );

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
    setIsSubmitting(false);
  };

  const handleAlertTimer = () => {
    setTimeout(() => {
      setReplyInputAlert(false);
      setReplyAlert(false);
    }, 2000);
  };

  return (
    <div className="relative">
      <div className="relative my-3 flex">
        {/* <div className="relative flex w-full items-center bg-[#172431] py-2.5 px-3 rounded">
          <input
            type="text"
            value={reply}
            placeholder="Add a reply"
            className="bg-[#172431] w-full"
            name="comment"
            onChange={(e) => setReply(e.target.value)}
          />
        </div> */}
        {session.data?.user.email ? (
          <form
            onSubmit={handlePostReply}
            className="relative mb-6 w-full items-center"
          >
            <div className="space-y-3">
              <Input
                placeholder="Add a reply"
                value={reply}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setReply(e.target.value)}
                className="border-[#1E2A36] bg-[#1E2A36] focus:border-[#F2CA16]"
              />

              {/* {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )} */}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  aria-disabled={isSubmitting}
                  className={`bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 ${isSubmitting ? "opacity-50" : ""}`}
                >
                  {isSubmitting ? "Replying..." : "Reply"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          ""
        )}
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
  likes: UserIdName[];
  dislikes: UserIdName[];
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
  const session = useSession();

  const handleDeleteReply = async () => {
    setDropdown(false);
    //check if user is logged in
    if (userID) {
      //check if user is the the one who posted the reply
      console.log(userID);
      console.log(replyUserID);
      if (userID == replyUserID) {
        try {
          const response = await deleteReply(replyID, userID, replyUserID);

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
    <div className="mt-4 flex text-[14px] text-xs">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F2CA16] text-black`}
      >
        {username?.[0]?.toUpperCase() || "U"}
      </div>
      <div className="ml-4 flex-1">
        <div className="relative flex justify-between">
          <div>
            <span className="font-bold">{username}</span>
            <span className="ml-2 text-[#F2CA16]">User</span>
            <span className="ml-2 opacity-50">
              {dayjs(createdAt).fromNow()}
            </span>
          </div>
          {session && username == session.data?.user.username && (
            <div onClick={(e) => setDropdown((prev) => !prev)}>
              <Image
                src={ThreeDots}
                width={16}
                height={16}
                alt="dots"
                className="ml-4 h-4 w-4"
              />
            </div>
          )}
          {dropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-8 z-10 grid rounded bg-[#172431]"
            >
              <div
                onClick={handleDeleteReply}
                className={`cursor-pointer px-3 py-2 text-center`}
              >
                Delete
              </div>
            </div>
          )}
          {/* {deleteAlert && (
            <AlertMessage message="Please login before deleting" />
          )} */}
        </div>
        <div className="h-max-[100px] ellipsis my-3 overflow-hidden text-justify md:h-auto">
          {censor.applyTo(reply, matches)}
        </div>
        <div className="flex items-center opacity-50">
          <div className="flex items-center" onClick={handleLiking}>
            {likes.some((like) => like.userId === userID) ? (
              <div>
                <Image
                  src={BlueThumbUp}
                  alt="blue thumbs up"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsUp}
                  alt="thumbs up"
                  width={16}
                  height={16}
                  className="mr-2"
                />
              </div>
            )}
            {likes.length > 0 && <div>{likes.length}</div>}
            <div></div>
          </div>
          <div className="ml-2 flex items-center" onClick={handleDisliking}>
            {dislikes.some((dislike) => dislike.userId === userID) ? (
              <div>
                <Image
                  src={BlueThumbsDown}
                  alt="thumbs down"
                  width={20}
                  height={20}
                />
              </div>
            ) : (
              <div>
                <Image
                  src={ThumbsDown}
                  alt="thumbs down"
                  width={16}
                  height={16}
                  className="mr-2"
                />
              </div>
            )}
            {dislikes.length > 0 && <div>{dislikes.length}</div>}
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
    <div className="mt-2 flex items-center justify-center rounded bg-[#F2CA16] px-4 py-2 text-sm text-black">
      {message}
    </div>
  );
};
