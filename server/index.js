const path = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const socketio = require("socket.io");

const app = express();

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const clientDirectoryPath = path.join(__dirname, "../client");

app.use(express.static(clientDirectoryPath));
// constants we required
const time = () => new Date().getTime();
const users = [];
const user_sockets = {};

io.on("connection", (socket) => {
  socket.on("new user", (username) => {
    if (!(username in user_sockets)) {
      socket.username = username;
      user_sockets[username] = socket.id;
      users.push(username);
    }
    // broadcast event user joined
    socket.broadcast.emit(
      "user joined",
      {
        username,
        time: time(),
      },
      users
    );
  });
  socket.on("public message", ({ message, username }) => {
    let name;
    name = username;
    io.emit("public msg from server", { message, name, time: time() });
  });

  // set listener for disconnect
  socket.on("disconnect", () => {
    const user = socket.username;
    console.log(`User ${user} disconnected!`);
    delete user_sockets[socket.username];
    users.splice(users.indexOf(socket.username), 1);
    // console.log(user_sockets);
    // console.log(users);
    socket.broadcast.emit("user left", {
      userLeft: user,
      time: time(),
      users,
    });
  });
});

server.listen(port, () => {
  console.log(`Our server running at ${port} port.`);
});
