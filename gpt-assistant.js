/*
GPT Assistant v1.0
Developed by DucksIncoming
MIT License, 2023
*/

//Event Listeners
document.getElementById("chat-input").addEventListener("focus", inputBoxFocus);
document.getElementById("chat-input").addEventListener("focusout", inputBoxUnfocus);
document.getElementById("chat-send-button").addEventListener("click", sendMessage)

//Global Variables
var canMessage = true;
var appApiKey = "";
var apiKey = localStorage["apiKey"];
localStorage["chatMemory"] = JSON.stringify([["test1", 0], ["test2", 1], ["test3", 0], ["test4", 1]]);
var memory = JSON.parse(localStorage["chatMemory"]);

if (memory != undefined){
  for (let i = 0; i < memory.length; i++){
    addCommentBlock(memory[i][0], memory[i][1]);
  }
}
else {
  localStorage["chatMemory"] = [];
  memory = [];
}

async function requestGPTResponse() {
  response = openai.ChatCompletion.create();
}

async function sendMessage() {
  let inputBox = document.getElementById("chat-input");
  let message = inputBox.value;
  
  if (canMessage && message != "Write something for ChatGPT..." && message != ""){
    addCommentBlock(message, 0);
    inputBox.value = "Write something for ChatGPT...";
    toggleGPTThinker(1);

    if (isMessageValid(message)){
      memory.push([message, 0]);
      if (memory.length > 10){
        memory.splice(0,1);
      }
      localStorage["chatMemory"] = JSON.Stringify(memory);

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
  let thinkerHTML = '<div class="gpt-thinking-block"><img class="gpt-thinking-block-icon" src="icons/icon_gpt.png"><img class="gpt-thinker" style="animation-delay: 0s" src="icons/icon_thinker.png"><img class="gpt-thinker" style="animation-delay: 0.1s" src="icons/icon_thinker.png"><img class="gpt-thinker"  style="animation-delay: 0.2s" src="icons/icon_thinker.png"></div>'

  if (state == null || state == 0){
    try {
      document.getElementById("gpt-thinker").remove();
      canMessage = true;
      return;
    }
    catch (e){
    }
  }

  canMessage = false;
  document.getElementById("msg-container").innerHTML += thinkerHTML;
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