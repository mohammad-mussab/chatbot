from flask import Flask, jsonify, request
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import pinecone
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferWindowMemory
from flask import session
from langchain.prompts import(
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    ChatPromptTemplate,
    MessagesPlaceholder
)
model = SentenceTransformer('all-MiniLM-L6-v2')

pinecone.init(api_key='', # find at app.pinecone.io
              environment='gcp-starter' # next to api key in console
             )
index = pinecone.Index('cookybot') # index name from pinecone
def find_match(input):
    input_em = model.encode(input).tolist()
    result = index.query(input_em, top_k=2, includeMetadata=True)
    return result['matches'][0]['metadata']['text']+"\n"+result['matches'][1]['metadata']['text']


app = Flask(__name__)
CORS(app)
setup_prompt_sent = False  #

@app.route('/')
def hello_world():
    return """
    <h1>Start Chating...</h1>
    <br>
    <a href="/chat/what is the price of this course?">Go to Chat</a>
    """
history = []
@app.route('/chat', methods=['POST', 'GET'])

def restapi():
    
    global setup_prompt_sent
    if not setup_prompt_sent:
        # Initialize ChatOpenAI model
        llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key='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')

        # Define message templates
        system_msg_template = SystemMessagePromptTemplate.from_template(
            template="""1. Greet the user politely ask user name and ask how you can assistthem today.
                    2. Provide informative and relevant responses to questions about website Cookywhich is resturant providing sercices of Fast food,juck food and home delievryfree.
                    3.If you don't know any answer to question simply say I don't know to thatanswer you can contact us on cookysupport@gmail.com
                    4. If the user asks about a topic unrelated to resturant which is about  ,politely steer the conversation back to Resturant or food or inform them thatthe topic is outside the scope of this conversation.
                    5. Be patient and considerate when responding to user queries, and provide clearexplanations.
                    6. If the user expresses gratitude or indicates the end of the conversation,respond with a polite farewell.
                    7. Do Not generate the long paragarphs in response. Maximum Words should be 70.
                    8. Inform users about our services without making it too obvious. Engage them ina subtle conversation, so they don't realize we're encouraging them to make apurchase
                    Remember, Don't add your information in response only modify the information that has come from chunks.Your primary goal is to provide customer support and serve thecustomer about related queries to Cooky Resturant and also use emojis for greatuser experience. Always prioritize their visiting the website experience andwell-being."""
        )
        
        human_msg_template = HumanMessagePromptTemplate.from_template(template="{input}")
        prompt_template = ChatPromptTemplate.from_messages([system_msg_template,
                                                            MessagesPlaceholder(variable_name="history"),
                                                            human_msg_template])

        # Retrieve query from request
        query = request.json["message"]
        context = find_match(query)
        memory = ConversationBufferWindowMemory(k=7, return_messages=True, history=history)
        # Create ConversationChain instance
        conversation = ConversationChain(memory=memory, prompt=prompt_template, llm=llm, verbose=True)
        result = conversation.predict(input=f"History :\n {history}Context:\n {context} \n\n Query:\n{query} ")

        # Update conversation history
        history.append({query: result})

        setup_prompt_sent = True

        res = {
            "query": query,
            "response": result
        }
        print(history)
        return jsonify(res)
    else:
        llm = ChatOpenAI(model="gpt-3.5-turbo", openai_api_key='')
        
        human_msg_template = HumanMessagePromptTemplate.from_template(template="{input}")
        prompt_template = ChatPromptTemplate.from_messages([MessagesPlaceholder(variable_name="history"),
                                                            human_msg_template])

        query = request.json["message"]
        context = find_match(query)
        memory = ConversationBufferWindowMemory(k=7,history=history, return_messages=True)
        conversation = ConversationChain(memory=memory, prompt=prompt_template, llm=llm, verbose=True)
        result = conversation.predict(input=f"Context:\n {context} \n\n Query:\n{query}")

        # Update conversation history
        history.append({query: result})

        res = {
            "query": query,
            "response": result
        }
        print(history)
        return jsonify(res)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

    