const generateResponse = () => {
    const API_URL = "http://127.0.0.1:5000/chat";

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: "what is the price of this course",
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        console.log(data["response"])
    }).catch(() => {
        console.log("Error")
    })
}


generateResponse()
