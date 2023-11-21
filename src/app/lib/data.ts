
export async function getCarData() {
    await fetch('http://localhost:3000/api/cars?auction_id=66558179')
        .then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(error => console.error(error));
}