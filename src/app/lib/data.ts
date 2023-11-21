
export function getCarData(ID: string) {
    return fetch(process.env.DOMAIN + `api/cars?auction_id=${ID}`)
        .then((res) => res.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error(error)
            throw error;
        })
}