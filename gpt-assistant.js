/*
GPT Assistant v1.0
Developed by DucksIncoming
MIT License, 2023
*/

//Event Listeners
try {
  document.getElementById("chat-input").addEventListener("focus", inputBoxFocus);
  document.getElementById("chat-input").addEventListener("focusout", inputBoxUnfocus);
  document.getElementById("chat-send-button").addEventListener("click", sendMessage)
  document.getElementById("apikey-submit").addEventListener("click", submitAPIKey)
}
catch (e) {

}

//Global Variables
var canMessage = true;
var appApiKey = "";
var apiKey = localStorage["apiKey"];
var memory = JSON.parse(localStorage["chatMemory"]);
var serverSourceURL = "http://localhost:5000/"

if (memory != undefined){
  for (let i = 0; i < memory.length; i++){
    addCommentBlock(memory[i][0], memory[i][1]);
  }
}
else {
  localStorage["chatMemory"] = JSON.stringify([]);
  memory = [];
}

async function requestGPTResponse() {
  const response = await promptGPTResponse();
  const gptResponse = await response.json();
  toggleGPTThinker(0);

  if (gptResponse["error"]){
    apiFailure();
    addCommentBlock("Please input a valid API Key!");
  }
  else {
    let response = JSON.stringify(gptResponse['choices'][0]['message']['content']);
    response = response.substring(1, response.length-1);
    addCommentBlock(response, 1);
    document.getElementById("msg-container").scrollTop = document.getElementById("msg-container").scrollHeight;
    memory.push([response, 1])
    localStorage["chatMemory"] = JSON.stringify(memory);
  }
  
}

async function sendMessage() {
  let inputBox = document.getElementById("chat-input");
  let message = inputBox.value;
  
  if (canMessage && message != "Write something for ChatGPT..." && message != ""){
    addCommentBlock(message, 0);
    inputBox.value = "Write something for ChatGPT...";

    if (message == "clear"){
      localStorage["chatMemory"] = JSON.stringify([]);
      memory = [];
      return;
    }

    if (isMessageValid(message)){
      toggleGPTThinker(1);
      memory.push([message, 0]);
      if (memory.length > 10){
        memory.splice(0,1);
      }
      localStorage["chatMemory"] = JSON.stringify(memory);

      requestGPTResponse();
    }
    else {
      addCommentBlock("Sorry, the prompt you entered didn't work for some reason. Please try again or use a different prompt.", 1);
    }
  }
}

function isMessageValid(msg) {
  return true;
}

function addCommentBlock(msg, userId) { //userId = 0 for user, 1 for gpt
  let author = ["user","gpt"];

  let commentHTML = '<div class="comment-block [AUTHOR]-comment" data-author="[AUTHOR]"><img src="icons/icon_[AUTHOR].png"><p>[RESPONSE]</p></div>';
  commentHTML = commentHTML.replaceAll("[AUTHOR]", author[userId]);
  commentHTML = commentHTML.replace("[ICON]", author[userId]);
  commentHTML = commentHTML.replace("[RESPONSE]", msg);
 
  document.getElementById("msg-container").innerHTML += commentHTML;
}

function toggleGPTThinker(state=null){
  let thinkerHTML = '<div class="gpt-thinking-block" id="gpt-thinking-block"><img class="gpt-thinking-block-icon" src="icons/icon_gpt.png"><img class="gpt-thinker" style="animation-delay: 0s" src="icons/icon_thinker.png"><img class="gpt-thinker" style="animation-delay: 0.1s" src="icons/icon_thinker.png"><img class="gpt-thinker"  style="animation-delay: 0.2s" src="icons/icon_thinker.png"></div>'

  if (state == null || state == 0){
    try {
      document.getElementById("gpt-thinking-block").remove();
      canMessage = true;
      return;
    }
    catch (e){
    }
  }

  canMessage = false;
  document.getElementById("msg-container").innerHTML += thinkerHTML;
  document.getElementById("msg-container").scrollTop = document.getElementById("msg-container").scrollHeight;
}

function inputBoxFocus() {
  let inputBox = document.getElementById("chat-input");
  if (inputBox.value == "Write something for ChatGPT..."){
    inputBox.value = "";
  }
}

function inputBoxUnfocus() {
  let inputBox = document.getElementById("chat-input");
  if (inputBox.value == ""){;
    inputBox.value = "Write something for ChatGPT...";
  }
}

function submitAPIKey(){
  let key = document.getElementById("apikey-dialog-input");
  localStorage["apiKey"] = key.value;
  apiKey = key.value;

  document.getElementById("apikey-dialog").close();
  document.getElementById("page-blur").style.display = "none";
}

function apiFailure() {
  document.getElementById("apikey-dialog").showModal();
  document.getElementById("page-blur").style.display = "block";
}

async function promptGPTResponse() {
  var url = "https://api.openai.com/v1/chat/completions";
  var bearer = 'Bearer ' + apiKey

  let messageHistory = [ { role: "system", content: "You are a helpful assistant." } ];
  for (let i = 0; i < memory.length; i++){
    let role = "assistant"
    if (memory[i][1] == 0){
      role = "user";
    }
    messageHistory.push({ role: role, content: memory[i][0] });
  }
  
  const gptResponse = await fetch(url, {
      method: 'POST',
      headers: {
          'Authorization': bearer,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 2048,
        temperature: 0.7,
        messages: messageHistory,
      })});

    return gptResponse;
}