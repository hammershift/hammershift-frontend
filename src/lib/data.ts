export const getCarData = async (ID: string) => {
  try {
    const response = await fetch(`/api/cars?auction_id=${ID}`, {
      cache: 'no-store', //dynamic rendering
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
      };
      return car;
    } else {
      console.log('failed to fetch cars');
    }
  } catch (err) {
    console.error(err);
  }
};

export const getCars = async ({ limit, mostBids = false }: { limit: number; mostBids?: boolean }) => {
  try {
    const response = await fetch(`/api/cars/filter?completed=false&limit=${limit}&mostBids=${mostBids}`, {
      cache: 'no-store', //dynamic rendering
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch cars list!');
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
        return `${key}=${value.map((item) => encodeURIComponent(item)).join('$')}`;
      } else {
        // Handle single values
        return `${key}=${encodeURIComponent(value)}`;
      }
    })
    .join('&');

  try {
    const response = await fetch(`/api/cars/filter?` + queries, {
      cache: 'no-store', //dynamic rendering
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
      console.log(auctions)
      return auctions;
    } else {
      throw new Error('Failed to fetch cars list!');
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
export const createWager = async (body: CreateWagerProps): Promise<Response> => {
  const response = await fetch('/api/wager', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

export const addPrizePool = async (pot: AddPrizePoolProps, auction_id: string | string[]) => {
  await fetch(`/api/cars?auction_id=${auction_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...pot }),
  });
};

export const sortByNewGames = async () => {
  const res = await fetch('/api/cars/filter?sort=Newly%20Listed&&limit=3');
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
  const res = await fetch('/api/cars/filter?sort=Most%20Expensive&&limit=3');
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
  const res = await fetch('/api/cars/filter?sort=Most%20Bids&&limit=3');
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
  const res = await fetch('/api/cars/filter?sort=Ending%20Soon&&limit=3');
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
  const res = await fetch('/api/myWagers');
  const data = await res.json();
  return data;
};

export const getMyWatchlist = async () => {
  const res = await fetch('/api/myWatchlist');
  const data = await res.json();
  return data;
};


export const getCarsWithURLString = async ({ urlString, limit }: { urlString: string, limit: number }) => {

  const queries = urlString + `&limit=${limit}`

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
      body: JSON.stringify({ auctionID: auctionObjectId })
    })

    await fetch(`/api/wager?id=${wagerID}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refunded: true }),
    })

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
    console.error('Error:', error);
    throw error;
  }
};

// fetches comments
export const getComments = async (id: string, sort: string) => {
  try {
    const res = await fetch(`/api/comments?id=${id}&sort=${sort}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    return { message: "cannot get comments" };
  }
};

// creates comment
export const createComment = async (auctionID: string, comment: string) => {
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auctionID, comment }),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// deletes comment
export const deleteComment = async (commentID: string, userID: string, commenterUserID: string) => {
  if (userID == commenterUserID) {
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentID }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  } else {
    console.log("deleter not comment owner")

  }
};

// like comment
export const likeComment = async (commentID: string, userID: string, likes: string[]) => {
  if (!likes.includes(userID)) {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error:', error);
    }
  } else {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error:', error);
    }

  }
};

// dislike comment
export const dislikeComment = async (commentID: string, userID: string, dislikes: string[]) => {
  console.log(commentID)
  if (!dislikes.includes(userID)) {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error:', error);
    }
  } else {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      console.error('Error:', error);
    }
  }
};
