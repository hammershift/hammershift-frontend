export const getCarData = async (ID: string) => {
  try {
    const response = await fetch(`/api/cars?auction_id=${ID}`, {
      cache: 'no-store', //dynamic rendering
    });

    if (response.ok) {
      const data = await response.json();
      const car = {
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

export const getCars = async ({ limit }: { limit: number }) => {
  try {
    const response = await fetch(`/api/cars/filter?completed=false&limit=${limit}`, {
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

export const createWager = async (body: CreateWagerProps) => {
  await fetch('/api/wager', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...body }),
  });
};

export const getWagers = async (id: string) => {
  const res = await fetch(`/api/wager?id=${id}`);
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
