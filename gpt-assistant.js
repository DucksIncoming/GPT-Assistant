/*
GPT Assistant v1.0
Developed by DucksIncoming
MIT License, 2023
*/

import OpenAI from 'openai';

//Event Listeners
document.getElementById("chat-input").addEventListener("focus", inputBoxFocus);
document.getElementById("chat-input").addEventListener("focusout", inputBoxUnfocus);
document.getElementById("chat-send-button").addEventListener("click", sendMessage)

//Global Variables
var canMessage = true;
var appApiKey = "";

chrome.storage.local.get(["apiKey"]).then((result) => {
  appApiKey = result;
});

const openai = new OpenAI({
  apiKey: appApiKey,
});

async function requestGPTResponse(msg) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: msg }],
      model: 'gpt-3.5-turbo',
    });
  
    addCommentBlock(completion.choices[0], 1);
  }
  catch (e) {
    prompt("Notice: This service requires access to an OpenAI API Key. You can find the process for registering one at https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key. Please input your API key if you already have it.")
  }
}

main();

addCommentBlock("This is a test!", 0);
addCommentBlock("This is also a test!", 1);

function sendMessage() {
  let inputBox = document.getElementById("chat-input");
  let message = inputBox.value;
  
  if (canMessage && message != "Write something for ChatGPT..." && message != ""){
    addCommentBlock(message, 0);
    inputBox.value = "Write something for ChatGPT...";
    requestGPTResponse(message);
  }
}

function addCommentBlock(msg, userId) { //userId = 0 for user, 1 for gpt
  let author = ["user","gpt"];

  let commentHTML = '<div class="comment-block [AUTHOR]-comment" data-author="[AUTHOR]"><img src="icons/icon_[AUTHOR].png"><p>[RESPONSE]</p></div>';
  commentHTML = commentHTML.replaceAll("[AUTHOR]", author[userId]);
  commentHTML = commentHTML.replace("[ICON]", author[userId]);
  commentHTML = commentHTML.replace("[RESPONSE]", msg);

  document.getElementById("msg-container").innerHTML += commentHTML;
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