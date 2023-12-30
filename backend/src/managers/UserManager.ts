import { Socket } from "socket.io";
import { QuizManager } from "./QuizManager";

const ADMIN_PASSWORD = "ADMIN_PASSWORD";

export class UserManager {
  private users: {
    roomId: string;
    socket: Socket;
  }[];
  private QuizManager;

  constructor() {
    this.users = [];
    this.QuizManager = new QuizManager();
  }

  addUser(roomId: string, socket: Socket) {
    this.users.push({ roomId, socket });

    this.createHandlers(roomId, socket);
  }

  private createHandlers(roomId: string, socket: Socket) {
    socket.on("join", (data) => {
      const userId = this.QuizManager.addUser(data.roomId, data.name);

      socket.emit("init", {
        userId,
        state: this.QuizManager.getCurrentState(roomId),
      });
    });

    socket.on("joinAdmin", (data) => {
      const userId = this.QuizManager.addUser(data.roomId, data.name);

      if (data.password !== ADMIN_PASSWORD) {
        return;
      }

      socket.emit("adminInit", {
        userId,
        state: this.QuizManager.getCurrentState(roomId),
      });

      socket.on("createQuiz", (data) => {
        this.QuizManager.addQuiz(data.roomId);
      });

      socket.on("createProblem", (data) => {
        this.QuizManager.addProblem(data.roomId, data.problem);
      });

      socket.on("nextProblem", (data) => {
        this.QuizManager.next(data.roomId);
      });
    });

    socket.on("submit", (data) => {
      const userId = data.userId;
      const problemId = data.problemId;
      const submission = data.submission;
      const roomId = data.roomId;

      if (
        submission !== 0 ||
        submission !== 2 ||
        submission !== 2 ||
        submission !== 3
      ) {
        console.error("Issue while getting input " + submission);
        return;
      }

      this.QuizManager.submit(userId, roomId, problemId, submission);
    });
  }
}
