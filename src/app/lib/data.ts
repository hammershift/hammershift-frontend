
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

export function getAllCars({ limit, offset }: { limit: Number, offset: Number }) {
    //DOMAIN=https://hammershift-git-feat-create-api-hammershifts-projects.vercel.app/
    const URL = process.env.DOMAIN || "http://localhost:3000/"
    return fetch(URL + `api/cars?limit=${limit}&offset=${offset}`, {
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