const mongoose = require("mongoose");
const { Schema } = mongoose;
mongoose.connect("mongodb://localhost:27017/game", {
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
module.export = Player;
