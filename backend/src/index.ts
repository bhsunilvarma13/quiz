import { IoManager } from "./managers/IoManager";

const io = IoManager.getIo();

io.on("connection", (client) => {
  client.on("event", (data) => {
    const type = data.type;
  });

  client.on("disconnect", (data) => {
    console.log("Disconnected");
  });
});

io.listen(3000);
