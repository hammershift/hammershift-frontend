
export const getWinnersRank = async () => {
    const response = await fetch('/api/winners', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        console.error("response error:", response.statusText);
        return;
    }

    const winners = await response.json();
    const data = winners.winners;
    const newData = [];
    console.log(winners)

    for (let i = 0; i < data.length; i++) {
        const usernameResponse = await fetch('/api/username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userID: data[i].user })
        });

        if (!usernameResponse.ok) {
            console.error(usernameResponse.statusText);
            return;
        }

        const username = await usernameResponse.json();
        newData.push({ rank: data[i].rank, user: username.username, numberOfWinnings: data[i].numberOfWinnings });
    }

    return { winners: newData };
};