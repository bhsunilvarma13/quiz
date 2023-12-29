import { Quiz } from "../Quiz";
import { IoManager } from "./IoManager";

export class QuizManager {
  private quizes: Quiz[];

  constructor() {
    this.quizes = [];
  }

  public start(roomId: string) {
    const io = IoManager.getIo();

    const quiz = this.quizes.find((x) => x.roomId === roomId);

    quiz?.start();
  }

  addUser(roomId: string, name: string) {
    return this.getQuiz(roomId)?.addUser(name);
  }

  submit(
    roomId: string,
    submission: 0 | 1 | 2 | 3,
    problemId: string,
    userId: string
  ) {
    this.getQuiz(roomId)?.submit(userId, roomId, problemId, submission);
  }

  getQuiz(roomId: string) {
    const quiz = this.quizes.find((x) => x.roomId === roomId);

    return quiz || null;
  }

  getCurrentState(roomId: string) {
    const quiz = this.quizes.find((x) => x.roomId === roomId);

    if (!quiz) {
      return null;
    } else {
      return quiz.getCurrentState();
    }
  }
}
