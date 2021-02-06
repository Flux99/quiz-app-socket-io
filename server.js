const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(3000);
//const Player = require("./database.js");
const mongoose = require("mongoose");

var bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost:27017/gameDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PlayerSchema = new mongoose.Schema({
  playername: String,
  score: String,
  player_id: String,
  room: String,
});

const Player = mongoose.model("player", PlayerSchema);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// parse application/json
app.use(bodyParser.json());

const rooms = {};
app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });
});

app.post("/room", (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect("/");
  }
  console.log("logggg", req.body.room);
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  io.emit("room-created", req.body.room);
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect("/");
  }
  res.render("room", { roomName: req.params.room });
});

server.listen(5500, (req, res) => {
  console.log("running on port 5500");
});

io.on("connection", (socket) => {
  socket.on("new-user", (room, name) => {
    console.log("new-user-serverside", room, name);
    socket.join(room);
    rooms[room].users[socket.id] = name;
    console.log("users", rooms[room].users);

    const player = new Player({
      playername: name,
      room: room,
    });
    player.save().then((data) => {
      console.log("Its done");
    });

    var userPerRoom = Object.keys(rooms[room].users).length;
    console.log("user per room", userPerRoom);
    //Object.keys(myObj).length;
    //console.log(numberofUser);

    // socket.to(room).broadcast.emit("user-connected", name);
    if (userPerRoom <= 2) {
      socket.to(room).broadcast.emit("user-connected", name);
      console.log("server-side", name);
    }
    if (userPerRoom > 2) {
      console.log(userPerRoom);
      socket.emit("user-full", "User-full");
    }
  });

  sendResult = (score, roomName, name) => {
    socket.to(roomName).broadcast.emit("chat-message", {
      message: score,
      name: name,
    });
  };

  socket.on("send-chat-message", (room, message) => {
    socket.to(room).broadcast.emit("chat-message", {
      message: message,
      name: rooms[room].users[socket.id],
    });
  });
  deleteRooms = () => {
    socket.on("disconnect", () => {
      console.log("disconnect-channel");
      getUserRooms(socket).forEach((room) => {
        socket
          .to(room)
          .broadcast.emit("user-disconnected", rooms[room].users[socket.id]);
        delete rooms[room].users[socket.id];
      });
    });
  };
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);
    return names;
  }, []);
}

app.get("/game/end", (req, res) => {
  console.log("end page");
  res.render("end", { name: "playername" });
});
var playerNAME = "";
var score = 0;
app.post("/game/end", (req, res) => {
  console.log("end game post", req.body);
  const roomName = req.body.roomName;
  const name = req.body.name;
  score = req.body.score;
  playerNAME = name;

  const update = {
    playername: name,
    room: roomName,
    score: score,
  };

  const query = {
    room: req.body.roomName,
    playername: req.body.name,
  };
  Player.updateOne(
    query,
    { playername: name, room: roomName, score: score },
    function (err, data) {
      if (err) {
        console.log(err);
        res.jsonp("False");
      } else {
        console.log("updated sucessfully", data);
        deleteRooms();
        sendResult(score, roomName, name);
        res.jsonp("True");
      }
    }
  );

  //res.render("end", { name: "playername" });
});

app.get("/game/board", (req, res) => {
  console.log("/game/board", playerNAME, score);
  res.render("end", { playername: playerNAME, Score: score });
});
