export async function fetchCarData() {
    try {
        const res = await fetch("http://localhost:3000/api/cars?id=66514736");

        console.log(res);
        if (!res.ok) {
            throw new Error("Failed to fetch car data");
        }

        // return res.json();
        console.log(res.json())
    } catch (error) {
        console.log("Error loading car data: ", error);
    }
}