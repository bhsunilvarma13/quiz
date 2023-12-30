import { Quiz } from "../Quiz";
import { IoManager } from "./IoManager";

let GLOBALPROBLEMID = 0;

export class QuizManager {
  private quizes: Quiz[];

  constructor() {
    this.quizes = [];
  }

  public start(roomId: string) {
    const quiz = this.getQuiz(roomId);

    if (!quiz) {
      return;
    }

    quiz.start();
  }

  public addProblem(
    roomId: string,
    problem: {
      title: string;
      description: string;
      image: string;
      options: {
        id: number;
        title: string;
      }[];
      answer: 0 | 1 | 2 | 3;
    }
  ) {
    const quiz = this.getQuiz(roomId);

    if (!quiz) {
      return;
    }

    quiz.addProblem({
      ...problem,
      startTime: new Date().getTime(),
      submissions: [],
      id: (GLOBALPROBLEMID++).toString(),
    });
  }

  public next(roomId: string) {
    const quiz = this.getQuiz(roomId);

    if (!quiz) {
      return;
    }

    quiz.next();
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

  addQuiz(roomId: string) {
    const quiz = new Quiz(roomId);
    this.quizes.push(quiz);
  }
}
