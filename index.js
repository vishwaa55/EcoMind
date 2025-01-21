const sub = document.getElementById("sub");
const chatArea = document.getElementById("chat");
const ques = document.getElementById("ques");
const chatHistory = document.getElementById("chatHistory");
const maxHistoryItems = 7;
let chatHistoryItems = [];

const scrollToBottom = () => {
    chatArea.scrollTop= chatArea.scrollHeight;
};

//chat submission
const handleSubmit = async (e) => {
    e.preventDefault();
    const q = ques.value.trim();
    if (!q) return;
    document.getElementById('welcomeMessage').style.display = 'none';
    
    const box1 = document.createElement("div");
    box1.className = "box1";
    const chat1 = document.createElement("div");
    chat1.appendChild(box1);
    chat1.className = "c1";
    chatArea.appendChild(chat1);
    box1.textContent = q;
    ques.value = "";
    scrollToBottom();
    
    
    fetch('http://localhost:6001/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ques: q}),
    })
    .then(res => res.json())
    .then(res => {
        const box2 = document.createElement("div");
        box2.className = "box2";
        box2.textContent = res.msg;
        const chat2 = document.createElement("div");
        chat2.className = "c2";
        chat2.appendChild(box2);
        chatArea.appendChild(chat2);
        updateChatHistory(res);
        // Scroll to bottom after receiving response
        scrollToBottom();
    });
};

// Listen for click event on submit button
sub.addEventListener("click", handleSubmit);

// Listen for Enter key in the input field
ques.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit(e);
    }
});


const updateChatHistory=(res)=>{
    
    
    const qs=res.his
    for(let i=0;i<qs.length;i++)
    {
        const newHis=document.createElement('div')
        newHis.className='chat-history-item'
        newHis.textContent='You: '+qs[i].ques.substring(0,40)+(qs[i].ques.length>40?"...":"")+"                  Bot :"
            +qs[i].answer.substring(0,40)+(qs[i].answer.length>40?"...":"");
        chatHistoryItems.unshift(newHis)
        chatHistory.insertBefore(newHis, chatHistory.firstChild);
        
    }
    if (chatHistoryItems.length > maxHistoryItems) {
        chatHistory.removeChild(chatHistoryItems.pop());
     }
}