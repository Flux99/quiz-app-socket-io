const socket = io("http://localhost:3000");
const messageContainer = document.getElementById("message-containers");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

var NAME = "";

if (messageForm != null) {
  const name = prompt("What is your name?");
  NAME = name;
  appendMessage("You joined");
  console.log("Playername", name);
  socket.emit("new-user", roomName, name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", roomName, message);
    messageInput.value = "";
  });
}

socket.on("room-created", (room) => {
  console.log("room", room);
  const roomElement = document.createElement("div");
  roomElement.innerText = room;
  const roomLink = document.createElement("a");
  roomLink.href = `/${room}`;
  roomLink.innerText = "join";
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
});

socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  console.log("nameo", name);
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

socket.on("user-full", (name) => {
  console.log("nameee", name);
  location.href = "/";
});

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const questionCounterText = document.getElementById("questionCounter");
const scoreText = document.getElementById("score");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [
  {
    question: "Inside which HTML element do we put the JavaScript??",
    choice1: "<script>",
    choice2: "<javascript>",
    choice3: "<js>",
    choice4: "<scripting>",
    answer: 1,
  },
  {
    question:
      "What is the correct syntax for referring to an external script called 'xxx.js'?",
    choice1: "<script href='xxx.js'>",
    choice2: "<script name='xxx.js'>",
    choice3: "<script src='xxx.js'>",
    choice4: "<script file='xxx.js'>",
    answer: 3,
  },
  {
    question: " How do you write 'Hello World' in an alert box?",
    choice1: "msgBox('Hello World');",
    choice2: "alertBox('Hello World');",
    choice3: "msg('Hello World');",
    choice4: "alert('Hello World');",
    answer: 4,
  },
  {
    question: " What is self closing tag??",
    choice1: "<img/>",
    choice2: "<javascript><javascript/>",
    choice3: "<js></js>",
    choice4: "</scripting>",
    answer: 1,
  },
  {
    question:
      "What is the correct syntax for referring to an external css called 'xxx.css'?",
    choice1: "<link href='xxx.css'>",
    choice2: "<link name='xxx.css'>",
    choice3: "<link src='xxx.css'>",
    choice4: "<link file='xxx.css'>",
    answer: 1,
  },
];

const Correct_bonus = 10;
const Max_questions = 5;

startGame = () => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  console.log(availableQuestions);
  getNewQuestion10();
};

getNewQuestion10 = () => {
  setInterval(function () {
    //this code runs every 10 second
    getNewQuestion();
  }, 10000);
};

getNewQuestion = () => {
  console.log("questionCounter,Max_questions", questionCounter, Max_questions);
  if (availableQuestions.length === 0 || questionCounter >= Max_questions) {
    console.log("scoreText.innerText=", NAME, scoreText.innerText);
    const playScore = {
      roomName: roomName,
      name: NAME,
      score: scoreText.innerText,
    };
    console.log("Object", playScore);

    (async () => {
      const rawResponse = await fetch("/game/end", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playScore),
      });
      const content = await rawResponse.json();

      console.log(content);
      if (content == "True") {
        location.href = "/game/board";
      }
    })();
    //return window.location.assign("/end");
  }
  questionCounter++;
  questionCounterText.innerText = `${questionCounter}  / ${Max_questions}`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + number];
  });

  availableQuestions.splice(questionIndex, 1);

  acceptingAnswers = true;
};

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectChoice = e.target;
    const selectAnswer = selectChoice.dataset["number"];
    const classToapply =
      selectAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if (classToapply == "correct") {
      incrementScore(Correct_bonus);
    }
    selectChoice.parentElement.classList.add(classToapply);

    setTimeout(() => {
      selectChoice.parentElement.classList.remove(classToapply);
      getNewQuestion();
    }, 1000);
  });
});

incrementScore = (num) => {
  score += num;
  scoreText.innerText = score;
};

const playerName = document.getElementById("playerName");

const finalScore = document.getElementById("finalScore");

saveHighScore = (e) => {
  console.log("clicked the save button");
  e.preventDefault();
  console.log("playerName", playerName.innerText);
};
startGame();
