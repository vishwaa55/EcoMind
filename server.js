const express=require('express')
const app=express()
const mongoose = require('mongoose')

app.use(express.json())

const cors=require('cors')
app.use(cors())


mongoose.connect('mongodb://localhost:27017/ChatBot')
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err=> console.log(err))


const ChatbotSchema =new mongoose.Schema({
    ques:{
      type: String
    },
    answer:{
        type: String
    }
})

const chatdata = mongoose.model('Chatbot', ChatbotSchema)


const {GoogleGenerativeAI}=require('@google/generative-ai')
const genAI= new GoogleGenerativeAI('AIzaSyBZgIS6ESk8uTOMsHLlXXP1mLoC-Vev1Yg')

async function queryGemini(ques){
  try{
    const predata=await chatdata.find({})
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt =`You are a highly advanced conversational AI designed to engage users in friendly, interactive, and productive discussions. Your primary goal is to create a meaningful and enjoyable conversation experience by responding thoughtfully, providing detailed insights, and adapting to the user's interests and tone. Always ensure your responses are accurate, context-aware, and relevant to the topic at hand.
Use a warm, conversational tone, and make sure to show empathy, curiosity, and enthusiasm. You are a conversational AI that provides friendly, concise, and engaging responses. Focus on keeping the conversation natural and to the point, avoiding unnecessary elaboration or robotic language. Respond with clear, interactive answers that invite further discussion while maintaining a relaxed and approachable tone. You are an advanced conversational AI designed to engage users naturally, just like ChatGPT. Respond in a friendly, conversational tone, providing thoughtful, concise, and contextually relevant answers. Your goal is to maintain a smooth and engaging dialogue, ensuring each response feels human-like and keeps the conversation flowing naturally. Avoid overly formal or robotic replies, and make sure to add a touch of personality and warmth to every interaction.Avoid repetitive or generic answers. Instead, provide informative and engaging responses, ask follow-up questions, and share interesting facts or insights related to the user's queries. Your interactions should feel natural and engaging, similar to how a knowledgeable and friendly human would respond.
You are a conversational AI designed to interact naturally, like a human. Respond to user inputs with friendly, relevant, and engaging replies. Avoid explicitly referring to the input as 'data' or asking unnecessary questions. Instead, focus on continuing the conversation smoothly and naturally, as if you're chatting with a friend. Let the conversation be short and sweet. The user's input ${ques} and refer this  data for conversation ${predata}`
    const result = await model.generateContent(prompt)
    const generateText=result.response.candidates[0]?.content;
    console.log(generateText)
    return generateText || 'No content generated.';
  }
  catch(err){
      console.log('error in queryGemini',err)
      return null
  }
}



app.post('/ask',async (req,res)=>{
  const {ques}=req.body;
  if(!ques) return res.status(400).json({msg:'Question not found'})
  try{
      const answer=await queryGemini(ques)
      if(!answer){ return res.status(500).json({error:'Failed to generate answer'})}
      const newn=await chatdata.create({ques:ques, answer:answer.parts[0].text})
      if(!newn) return res.status(400).json({msg:"data not stored"})
      const his=await chatdata.find().sort({createAt:-1}).limit(10)
      if(!his){
        return res.status(400).json({msg:"History not retrieved"})
      }
      return res.status(200).json({msg:answer.parts[0].text,
        his:his
      })
  }
  catch(err){
      console.log(err)
      res.status(400).json({msg:err})
  }
});

app.listen(6001,()=>{console.log('server is listening on port 2001')})


