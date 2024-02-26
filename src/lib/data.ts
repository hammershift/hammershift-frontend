export const getCarData = async (ID: string) => {
  try {
    const response = await fetch(`/api/cars?auction_id=${ID}`, {
      cache: "no-store", //dynamic rendering
    });

    if (response.ok) {
      const data = await response.json();
      const car = {
        _id: data._id,
        auction_id: data.auction_id,
        description: [...data.description],
        images_list: [...data.images_list],
        listing_details: [...data.listing_details],
        image: data.image,
        page_url: data.page_url,
        website: data.website,
        price: data.attributes[0].value,
        year: data.attributes[1].value,
        make: data.attributes[2].value,
        model: data.attributes[3].value,
        category: data.attributes[4].value,
        era: data.attributes[5].value,
        chassis: data.attributes[6].value,
        seller: data.attributes[7].value,
        location: data.attributes[8].value,
        state: data.attributes[9].value,
        lot_num: data.attributes[10].value,
        listing_type: data.attributes[11].value,
        deadline: data.attributes[12].value,
        bids: data.attributes[13].value,
        status: data.attributes[14].value,
        pot: data.pot,
        comments: data.comments,
        views: data.views,
        watchers: data.watchers,
        winners: data.winners,
      };
      return car;
    } else {
      console.log("failed to fetch cars");
    }
  } catch (err) {
    console.error(err);
  }
};

export const getCars = async ({
  limit,
  mostBids = false,
}: {
  limit: number;
  mostBids?: boolean;
}) => {
  try {
    const response = await fetch(
      `/api/cars/filter?completed=false&limit=${limit}&mostBids=${mostBids}`,
      {
        cache: "no-store", //dynamic rendering
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Failed to fetch cars list!");
    }
  } catch (err) {
    console.error(err);
  }
};

export interface getCarsWithFilterProps {
  make?: string[];
  category?: string[];
  era?: string[];
  location?: string[];
  limit?: number;
}

export const getCarsWithFilter = async (props: getCarsWithFilterProps) => {
  const queries = Object.entries(props)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array values, for example, joining them with commas
        return `${key}=${value
          .map((item) => encodeURIComponent(item))
          .join("$")}`;
      } else {
        // Handle single values
        return `${key}=${encodeURIComponent(value)}`;
      }
    })
    .join("&");

  try {
    const response = await fetch(`/api/cars/filter?` + queries, {
      cache: "no-store", //dynamic rendering
    });

    if (response.ok) {
      const list = await response.json();
      let auctions = {
        total: list.total,
        cars: list.cars.map((data: any) => ({
          _id: data._id,
          auction_id: data.auction_id,
          description: [...data.description],
          images_list: [...data.images_list],
          listing_details: [...data.listing_details],
          image: data.image,
          page_url: data.page_url,
          website: data.website,
          price: data.attributes[0].value,
          year: data.attributes[1].value,
          make: data.attributes[2].value,
          model: data.attributes[3].value,
          category: data.attributes[4].value,
          era: data.attributes[5].value,
          chassis: data.attributes[6].value,
          seller: data.attributes[7].value,
          location: data.attributes[8].value,
          state: data.attributes[9].value,
          lot_num: data.attributes[10].value,
          listing_type: data.attributes[11].value,
          deadline: data.attributes[12].value,
          bids: data.attributes[13].value,
          status: data.attributes[14].value,
        })),
      };
      // console.log(auctions)
      return auctions;
    } else {
      throw new Error("Failed to fetch cars list!");
    }
  } catch (err) {
    console.error(err);
  }
};

export interface CreateWagerProps {
  auctionID?: string;
  priceGuessed?: number;
  wagerAmount?: number;
  user?: {
    _id: string;
    fullName: string;
    username: string;
  };
  auctionIdentifierId?: string;
}

// export const createWager = async (body: CreateWagerProps) => {
//   await fetch("/api/wager", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ ...body }),
//   });
// };

// TEST IMPLEMENTATION
export const createWager = async (
  body: CreateWagerProps
): Promise<Response> => {
  const response = await fetch("/api/wager", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body }),
  });
  return response;
};

export const getWagers = async (id: string) => {
  const res = await fetch(`/api/wager?id=${id}`);
  const data = await res.json();
  return data;
};

export const getOneUserWager = async (auction_id: string, user_id: string) => {
  const res = await fetch(`/api/wager?id=${auction_id}&user_id=${user_id}`);
  const data = await res.json();
  return data;
};

export interface AddPrizePoolProps {
  pot?: number;
}

export const addPrizePool = async (
  pot: AddPrizePoolProps,
  auction_id: string | string[]
) => {
  await fetch(`/api/cars?auction_id=${auction_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...pot }),
  });
};

export const sortByNewGames = async () => {
  const res = await fetch("/api/cars/filter?sort=Newly%20Listed&&limit=3");
  const data = await res.json();
  let auctions = {
    total: data.total,
    cars: data.cars.map((data: any) => ({
      _id: data._id,
      auction_id: data.auction_id,
      description: [...data.description],
      images_list: [...data.images_list],
      listing_details: [...data.listing_details],
      image: data.image,
      page_url: data.page_url,
      website: data.website,
      price: data.attributes[0].value,
      year: data.attributes[1].value,
      make: data.attributes[2].value,
      model: data.attributes[3].value,
      category: data.attributes[4].value,
      era: data.attributes[5].value,
      chassis: data.attributes[6].value,
      seller: data.attributes[7].value,
      location: data.attributes[8].value,
      state: data.attributes[9].value,
      lot_num: data.attributes[10].value,
      listing_type: data.attributes[11].value,
      deadline: data.attributes[12].value,
      bids: data.attributes[13].value,
      status: data.attributes[14].value,
    })),
  };
  return auctions;
};

export const sortByMostExpensive = async () => {
  const res = await fetch("/api/cars/filter?sort=Most%20Expensive&&limit=3");
  const data = await res.json();
  let auctions = {
    total: data.total,
    cars: data.cars.map((data: any) => ({
      _id: data._id,
      auction_id: data.auction_id,
      description: [...data.description],
      images_list: [...data.images_list],
      listing_details: [...data.listing_details],
      image: data.image,
      page_url: data.page_url,
      website: data.website,
      price: data.attributes[0].value,
      year: data.attributes[1].value,
      make: data.attributes[2].value,
      model: data.attributes[3].value,
      category: data.attributes[4].value,
      era: data.attributes[5].value,
      chassis: data.attributes[6].value,
      seller: data.attributes[7].value,
      location: data.attributes[8].value,
      state: data.attributes[9].value,
      lot_num: data.attributes[10].value,
      listing_type: data.attributes[11].value,
      deadline: data.attributes[12].value,
      bids: data.attributes[13].value,
      status: data.attributes[14].value,
    })),
  };
  return auctions;
};

export const sortByMostBids = async () => {
  const res = await fetch("/api/cars/filter?sort=Most%20Bids&&limit=3");
  const data = await res.json();
  let auctions = {
    total: data.total,
    cars: data.cars.map((data: any) => ({
      _id: data._id,
      auction_id: data.auction_id,
      description: [...data.description],
      images_list: [...data.images_list],
      listing_details: [...data.listing_details],
      image: data.image,
      page_url: data.page_url,
      website: data.website,
      price: data.attributes[0].value,
      year: data.attributes[1].value,
      make: data.attributes[2].value,
      model: data.attributes[3].value,
      category: data.attributes[4].value,
      era: data.attributes[5].value,
      chassis: data.attributes[6].value,
      seller: data.attributes[7].value,
      location: data.attributes[8].value,
      state: data.attributes[9].value,
      lot_num: data.attributes[10].value,
      listing_type: data.attributes[11].value,
      deadline: data.attributes[12].value,
      bids: data.attributes[13].value,
      status: data.attributes[14].value,
    })),
  };
  return auctions;
};

export const sortByTrending = async () => {
  const res = await fetch("/api/cars/filter?sort=Ending%20Soon&&limit=3");
  const data = await res.json();
  let auctions = {
    total: data.total,
    cars: data.cars.map((data: any) => ({
      _id: data._id,
      auction_id: data.auction_id,
      description: [...data.description],
      images_list: [...data.images_list],
      listing_details: [...data.listing_details],
      image: data.image,
      page_url: data.page_url,
      website: data.website,
      price: data.attributes[0].value,
      year: data.attributes[1].value,
      make: data.attributes[2].value,
      model: data.attributes[3].value,
      category: data.attributes[4].value,
      era: data.attributes[5].value,
      chassis: data.attributes[6].value,
      seller: data.attributes[7].value,
      location: data.attributes[8].value,
      state: data.attributes[9].value,
      lot_num: data.attributes[10].value,
      listing_type: data.attributes[11].value,
      deadline: data.attributes[12].value,
      bids: data.attributes[13].value,
      status: data.attributes[14].value,
    })),
  };
  return auctions;
};

export const getMyWagers = async () => {
  const res = await fetch("/api/myWagers");
  const data = await res.json();
  return data;
};

export const getMyWatchlist = async () => {
  const res = await fetch("/api/myWatchlist");
  const data = await res.json();
  return data;
};

export const getCarsWithURLString = async ({
  urlString,
  limit,
}: {
  urlString: string;
  limit: number;
}) => {
  const queries = urlString + `&limit=${limit}`;

  try {
    const response = await fetch(`/api/cars/filter?` + queries, {
      cache: "no-store", //dynamic rendering
    });

    if (response.ok) {
      const list = await response.json();
      let auctions = {
        total: list.total,
        cars: list.cars.map((data: any) => ({
          auction_id: data.auction_id,
          description: [...data.description],
          images_list: [...data.images_list],
          listing_details: [...data.listing_details],
          image: data.image,
          page_url: data.page_url,
          website: data.website,
          price: data.attributes[0].value,
          year: data.attributes[1].value,
          make: data.attributes[2].value,
          model: data.attributes[3].value,
          category: data.attributes[4].value,
          era: data.attributes[5].value,
          chassis: data.attributes[6].value,
          seller: data.attributes[7].value,
          location: data.attributes[8].value,
          state: data.attributes[9].value,
          lot_num: data.attributes[10].value,
          listing_type: data.attributes[11].value,
          deadline: data.attributes[12].value,
          bids: data.attributes[13].value,
          status: data.attributes[14].value,
        })),
      };

      return auctions;
    } else {
      throw new Error("Failed to fetch cars list!");
    }
  } catch (err) {
    console.error(err);
  }
};

export const refundWager = async (auctionObjectId: string, wagerID: string) => {
  try {
    await fetch("/api/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auctionID: auctionObjectId }),
    });

    await fetch(`/api/wager?id=${wagerID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refunded: true }),
    });

    console.log("refunded successfully");
  } catch (error) {
    console.error("refunding error");
  }
};

export const getUserInfo = async (id: string) => {
  try {
    const res = await fetch(`/api/userInfo?id=${id}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

///////////////////////// COMMENTS /////////////////////////
// fetches comments
export const getComments = async (pageID: string, pageType: "auction" | "tournament", sort: string) => {
  try {
    const res = await fetch(`/api/comments?pageID=${pageID}&pageType=${pageType}&sort=${sort}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error("Error:", error);
    return { message: "cannot get comments" };
  }
};

// creates comment
export const createComment = async (pageID: string, pageType: "auction" | "tournament", comment: string) => {
  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pageID, pageType, comment }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// deletes comment
export const deleteComment = async (
  commentID: string,
  userID: string,
  commenterUserID: string
) => {
  if (userID == commenterUserID) {
    try {
      const res = await fetch("/api/comments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentID }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  } else {
    console.log("deleter not comment owner");
  }
};

// like comment
export const likeComment = async (
  commentID: string,
  userID: string,
  likes: string[]
) => {
  if (!likes.includes(userID)) {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID,
          key: "likes",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID,
          key: "removeLikes",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

// dislike comment
export const dislikeComment = async (
  commentID: string,
  userID: string,
  dislikes: string[]
) => {
  console.log(commentID);
  if (!dislikes.includes(userID)) {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID,
          key: "dislikes",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID,
          key: "removeDislikes",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

// creates reply
export const createReply = async (
  commentID: string,
  reply: string,
  auctionID: string
) => {
  try {
    const res = await fetch("/api/comments/replies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commentID, reply, auctionID }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// deletes reply
export const deleteReply = async (
  replyID: string,
  userID: string,
  replyUserID: string,
  commentID: string
) => {
  if (userID == replyUserID) {
    try {
      const res = await fetch("/api/comments/replies", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ replyID, commentID }),
      });
      if (res.ok) {
        return res;
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  } else {
    console.error("deleter not reply owner");
  }
};

//like reply
export const likeReply = async (
  commentID: string,
  replyID: string,
  userID: string,
  likes: string[]
) => {
  if (likes.includes(userID)) {
    try {
      const res = await fetch("/api/comments/replies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID,
          replyID,
          key: "removeLikes",
        }),
      });

      if (res.status === 200) {
        console.log("removed like reply");
        const data = await res.json();
        return data;
      } else {
        console.error("Error in removing liking reply");
      }
    } catch (error) {
      console.error("Error in removing liking reply");
    }
  } else {
    try {
      const res = await fetch("/api/comments/replies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentID,
          replyID,
          key: "likes",
        }),
      });

      if (res.status === 200) {
        console.log("liking reply successful");
        const data = await res.json();
        return data;
      } else {
        console.error("Error in liking reply");
      }
    } catch (error) {
      console.error("Error in liking reply");
    }
  }
};

//dislike reply
export const dislikeReply = async (
  commentID: string,
  replyID: string,
  userID: string,
  dislikes: string[]
) => {
  const key = dislikes.includes(userID) ? "removeDislikes" : "dislikes";
  const successMessage = dislikes.includes(userID)
    ? "removed dislike reply"
    : "disliking reply successful";
  const errorMessage = dislikes.includes(userID)
    ? "Error in removing disliking reply"
    : "Error in disliking reply";

  try {
    const res = await fetch("/api/comments/replies", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commentID,
        replyID,
        key,
      }),
    });

    if (res.status === 200) {
      console.log(successMessage);
      const data = await res.json();
      return data;
    } else {
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(errorMessage);
    throw error;
  }
};

export const editUserInfo = async (userId: string, edits: any) => {
  try {
    const res = await fetch("/api/userInfo", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        updatedFields: edits,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update user. Status: ${res.status}`);
    }

    const data = await res.json();
    console.log("User updated successfully:", data.updatedUser);
    return data.updatedUser;
  } catch (error: any) {
    console.error("Error updating user:", error.message);
    throw error;
  }
};

interface TournamentUser {
  _id: string;
  fullName: string;
  username: string;
  image: string;
}

interface TournamentWager {
  auctionID: string;
  priceGuessed: number;
}

interface TournamentData {
  tournamentID: string;
  wagers: TournamentWager[];
  buyInAmount: number;
  user: TournamentUser;
}

export const createTournamentWager = async (wagerData: TournamentData) => {
  try {
    const res = await fetch("/api/tournamentWager", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wagerData),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getTournaments = async () => {
  try {
    const res = await fetch("/api/tournaments");
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Tournaments Error", error);
    throw error;
  }
};

export const getSortedTournaments = async (sortType: string) => {
  try {
    const res = await fetch(`/api/tournaments?sort=${sortType}`);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Tournaments Error", error);
    throw error;
  }
};

export const getLimitedTournaments = async (limit: number) => {
  try {
    const res = await fetch(`/api/tournaments?sort=newest&&limit=${limit}`);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Tournaments Error", error);
    throw error;
  }
};

export const getTournamentById = async (id: string) => {
  try {
    const res = await fetch(`/api/tournaments?id=${id}`);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Tournament Error", error);
    throw error;
  }
};

export const getAuctionsByTournamentId = async (tournamentID: string) => {
  try {
    const res = await fetch(`/api/cars?tournamentID=${tournamentID}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Auctions by Tournament ID: ", error);
  }
};

export const addTournamentPot = async (pot: number, tournamentID: string) => {
  await fetch(`/api/tournament?id=${tournamentID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pot: pot }),
  });
};

export const getOneTournamentWager = async (
  tournament_id: string,
  user_id: string
) => {
  const res = await fetch(
    `/api/tournamentWager?tournament_id=${tournament_id}&user_id=${user_id}`
  );
  const data = await res.json();
  return data;
};

export const getAllTournamentWagers = async (tournament_id: string) => {
  const res = await fetch(
    `/api/tournamentWager?tournament_id=${tournament_id}`
  );
  const data = await res.json();
  return data;
};

export const getTournamentTransactions = async (tournament_id: string) => {
  const res = await fetch(
    `/api/transaction?tournamentID=${tournament_id}`
  );
  const data = await res.json();
  return data;
};

export const getAuctionTransactions = async (auction_id: string) => {
  const res = await fetch(
    `/api/transaction?auctionID=${auction_id}`
  );
  const data = await res.json();
  return data;
};
