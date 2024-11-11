const { username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const publicMessages = document.querySelector("#messages");
const socket = io("http://localhost:3000");
// autoscroll messages
const autoscroll = () => {
  publicMessages.scrollBy(0, 500);
};
// timestamp function
const time = () => new Date().getTime();
//// set auto scroll on every 5 seconds
setInterval(() => {
  autoscroll();
}, 5000);
if (!username) {
  window.location.href = "./index.html";
}
// set first socket connection
socket.on("connect", () => {
  if (username || username !== undefined) {
    socket.emit("new user", username);
  }
});
// welcome message
setTimeout(() => {
  const message = `${moment(time()).format(
    "HH:mm"
  )} - Welcome ${username}, enjoy here!`;
  const html = `<p class="public_message mentioned">${message}</p>`;
  $("#messages").append(html);
}, 4000);
// user joined event listener
socket.on("user joined", ({ username, time }, users) => {
  const html = `<p class="public_message mentioned">${moment(time).format(
    "HH:mm"
  )} - Admin: User ${username} has join!</p>`;
  $("#messages").append(html);
});
// message on user left
socket.on("user left", ({ userLeft, time, users }) => {
  console.log(userLeft, time, users);
  const html = `<p class="public_message mentioned">
  ${moment(time).format("HH:mm")} - Admin: The user ${userLeft} left the chat!
  </p>`;
  $("#messages").append(html);
  autoscroll();
});
// send public message
$("#message-form").on("submit", (e) => {
  e.preventDefault();
  const message = $("#public_input").val().trim();
  if (message.length > 1) {
    socket.emit("public message", { message, username }, (error) => {
      $("#public_input").focus();
      if (error) {
        return console.log(error);
      }
    });
  }
  document.getElementById("public_input").value = "";
  $("#public_input").focus();
  autoscroll();
});
// listen to public messages from server
socket.on("public msg from server", ({ message, name, time }) => {
  const html = `<p class="public_message">${moment(time).format(
    "HH:mm"
  )} - ${name}: ${message} </p>`;
  $("#messages").append(html);
});
