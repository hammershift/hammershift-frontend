
export function getCarData(ID: string) {
    //DOMAIN=https://hammershift-git-feat-create-api-hammershifts-projects.vercel.app/
    const URL = process.env.DOMAIN || "http://localhost:3000/"
    return fetch(URL + `api/cars?auction_id=${ID}`, {
        cache: 'no-store' //dynamic rendering
    })
        .then((res) => res.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error(error)
            throw error;
        })
}

export function getCars({ limit }: { limit: Number }) {
    //DOMAIN=https://hammershift-git-feat-create-api-hammershifts-projects.vercel.app/
    const URL = process.env.DOMAIN || "http://localhost:3000/"
    return fetch(URL + `api/cars/filter?status=1&limit=${limit}`, {
        cache: 'no-store' //dynamic rendering
    })
        .then((res) => res.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error(error)
            throw error;
        })
}

export function getCarsCount() {
    const URL = process.env.DOMAIN || "http://localhost:3000/"
    return fetch(URL + `api/cars/filter?status=1`, {
        cache: 'no-store' //dynamic rendering
    })
        .then((res) => res.json())
        .then(data => {
            return data.length;
        })
        .catch((error) => {
            console.error(error)
            throw error;
        })
}