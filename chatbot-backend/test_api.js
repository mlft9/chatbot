require('dotenv').config(); 

const apiKey = process.env.OPENAI_API_KEY // Remplacez par votre clé API
const apiUrl = "https://api.openai.com/v1/chat/completions";

async function askChatGPT(question) {
    const requestBody = {
        model: "gpt-3.5-turbo", // Utilisez le modèle souhaité
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: question }
        ],
        max_tokens: 100,
        temperature: 0.7,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response from ChatGPT:", data.choices[0].message.content);
    } catch (error) {
        console.error("Error communicating with ChatGPT API:", error);
    }
}

// Posez une question simple
askChatGPT("Quelle est la capitale de la France ?");
