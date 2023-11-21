
export function getCarData(ID: string) {
    return fetch(`http://localhost:3000/api/cars?auction_id=${ID}`)
        .then((res) => res.json())
        .then(data => {
            return data;
        })
        .catch((error) => {
            console.error(error)
            throw error;
        })
}