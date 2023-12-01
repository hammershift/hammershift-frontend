
export function getCarData(ID: string) {
    return fetch(`/api/cars?auction_id=${ID}`, {
        cache: 'no-store' //dynamic rendering
    })
        .then((res) => res.json())
        .then(data => {
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
                status: data.attributes[14].value
            }
            return car;
        })
        .catch((error) => {
            return console.error(error);
        })
}

export function getCars({ limit }: { limit: Number }) {
    return fetch(`https://hammershift-hk3cbfu7k-hammershifts-projects.vercel.app/auctions/api/cars/filter?completed=false&limit=${limit}`, {
        cache: 'no-store' //dynamic rendering
    })
        .then((res) => res.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            return console.error(error)

        })
}


export interface getCarsWithFilterProps {
    make?: string[],
    category?: string[],
    era?: string[],
    location?: string[],
    limit?: number
}

export async function getCarsWithFilter(props: getCarsWithFilterProps) {
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

    fetch(`/api/cars/filter?` + queries, {
        cache: 'no-store' //dynamic rendering
    })
        .then((res) => res.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            return console.error(error)
        })
}