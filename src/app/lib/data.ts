

export async function fetchCarData() {

    try {
        fetch("http://localhost:3000/api/cars?auction_id=67253867").then((res) => console.log(res)).catch(error => console.log(error.json()))
    } catch (error) {
        console.log("Error loading car data: ", error);
    }
}