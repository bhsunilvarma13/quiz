import { IoManager } from "./managers/IoManager";

export type submission = 0 | 1 | 2 | 3;

interface Submission {
  problemId: string;
  userId: string;
  isCorrect: boolean;
  optionSelected: submission;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  image: string;
  answer: submission;
  startTime: number;
  options: {
    id: number;
    title: string;
  }[];
  submissions: Submission[];
}

interface User {
  id: string;
  name: string;
  points: number;
}

export class Quiz {
  public roomId: string;
  private hasStarted: boolean;
  private problems: Problem[];
  private activeProblem: number;
  private users: User[];
  private currentState: "leaderboard" | "question" | "not_started" | "ended";

  constructor(roomId: string) {
    this.roomId = roomId;
    this.hasStarted = false;
    this.problems = [];
    this.activeProblem = 0;
    this.users = [];
    this.currentState = "not_started";
  }

  addProblem(problem: Problem) {
    this.problems.push(problem);
    console.log(this.problems);
  }

  start() {
    this.hasStarted = true;

    this.setActiveProblem(this.problems[0]);
  }

  setActiveProblem(problem: Problem) {
    problem.startTime = new Date().getTime();

    problem.submissions = [];

    IoManager.getIo().emit("CHANGE_PROBLEM", {
      problem,
    });

    setTimeout(() => {
      this.sendLeaderboard();
    }, 20 * 1000);
  }

  next() {
    this.activeProblem++;

    const problem = this.problems[this.activeProblem];

    if (problem) {
      this.setActiveProblem(problem);
    } else {
      // IoManager.getIo().emit("QUIZ_END");
    }
  }

  randomId(length: number) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";

    var charlength = chars.length;

    var result = "";

    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * charlength));
    }

    return result;
  }

  addUser(name: string) {
    const id = this.randomId(7);

    this.users.push({
      id,
      name,
      points: 0,
    });

    return id;
  }

  submit(
    userId: string,
    roomId: string,
    problemId: string,
    submission: submission
  ) {
    const problem = this.problems.find((x) => x.id === problemId);

    const user = this.users.find((x) => x.id === userId);

    if (!problem || !user) {
      return;
    }

    const existingSubmision = problem.submissions.find(
      (x) => x.userId === userId
    );

    if (existingSubmision) {
      return;
    }

    problem.submissions.push({
      problemId: problemId,
      userId: userId,
      isCorrect: submission === problem.answer,
      optionSelected: submission,
    });

    user.points +=
      1000 - (500 * (new Date().getTime() - problem.startTime)) / 20;
  }

  getLeaderboard() {
    return this.users
      .sort((a, b) => (a.points < b.points ? 1 : -1))
      .splice(0, 20);
  }

  sendLeaderboard() {
    const leaderboard = this.getLeaderboard();
    IoManager.getIo().to(this.roomId).emit("leaderboard", {
      leaderboard,
    });
  }

  getCurrentState() {
    if (this.currentState === "not_started") {
      return {
        type: "not_started",
      };
    }

    if (this.currentState === "ended") {
      return {
        type: "ended",
        leaderboard: this.getLeaderboard(),
      };
    }

    if (this.currentState === "leaderboard") {
      return {
        type: "leaderboard",
        leaderboard: this.getLeaderboard(),
      };
    }

    if (this.currentState === "question") {
      const problem = this.problems[this.activeProblem];
      return {
        type: "question",
        question: problem,
      };
    }
  }
}
