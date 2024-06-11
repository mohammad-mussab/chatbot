const chatbotElement = document.createElement("div")
chatbotElement.innerHTML = `<button class="chatbot-toggler">
<span class="material-symbols-rounded">mode_comment</span>
<span class="material-symbols-outlined">close</span>
</button>
<div class="chatbot">
<header>
  <h2>Chatbot</h2>
  <p class="subheading">Ask me anything</p>
  <span class="close-btn material-symbols-outlined">close</span>
</header>
<ul class="chatbox">
  <li class="chat incoming">
    <span class="material-symbols-outlined">smart_toy</span>
    <p>Hi there 👋<br>How can I help you today?</p>
  </li>
</ul>
<div class="chat-input">
  <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
  <span id="send-btn" class="material-symbols-rounded">send</span>
</div>`

const p = new Promise((resolve, reject) => {
    let linkFont1 = document.createElement("link");
    linkFont1.rel = "stylesheet";
    linkFont1.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0";
    document.head.append(linkFont1)
    linkFont1.onload = () => {
        resolve(true);
    }
    linkFont1.onerror = () => {
        reject(new Error("'linkFont1' Loading Failed"));
    }
})


p.then((value) => {
    return new Promise((resolve, reject) => {
        let linkFont2 = document.createElement("link");
        linkFont2.rel = "stylesheet";
        linkFont2.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0";
        document.head.append(linkFont2)
        linkFont2.onload = () => {
            resolve(true);
        }
        linkFont2.onerror = () => {
            reject(new Error("'linkFont2' Loading Failed"));
        }
    })
}).then((value) => {
    return new Promise((resolve, reject) => {
        let linkChatbotCss = document.createElement("link");
        linkChatbotCss.rel = "stylesheet";
        linkChatbotCss.href = "style.css";
        document.head.append(linkChatbotCss)
        linkChatbotCss.onload = () => {
            resolve(true);
        }
        linkChatbotCss.onerror = () => {
            reject(new Error("'linkChatbotCss' Loading Failed"));
        }
    })
}).then((value) => {
    window.document.body.prepend(chatbotElement)
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");
    let userMessage = null; // Variable to store user's message
    const inputInitHeight = chatInput.scrollHeight;

    const createChatLi = (message, className) => {
        // Create a chat <li> element with passed message and className
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", `${className}`);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi; // return chat <li> element
    }
    
    const generateResponse = (chatElement) => {
        const API_URL = "http://127.0.0.1:5000/chat";
        const messageElement = chatElement.querySelector("p");
    
        // Define the properties and message for the API request
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userMessage,
            })
        }
    
        // Send POST request to API, get response and set the reponse as paragraph text
        fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
            messageElement.textContent = data["response"].trim();
        }).catch(() => {
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }
    
    const handleChat = () => {
        userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
        if(!userMessage) return;
    
        // Clear the input textarea and set its height to default
        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;
    
        // Append the user's message to the chatbox
        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);
        
        setTimeout(() => {
            // Display "Thinking..." message while waiting for the response
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    }
    
    
    chatInput.addEventListener("input", () => {
        // Adjust the height of the input textarea based on its content
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });
    
    chatInput.addEventListener("keydown", (e) => {
        // If Enter key is pressed without Shift key and the window 
        // width is greater than 800px, handle the chat
        if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
    
    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    


})





