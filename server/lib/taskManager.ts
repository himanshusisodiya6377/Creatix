class TaskManager {
  private static instance: TaskManager;
  private tasks: Map<string, AbortController> = new Map();

  private constructor() {}

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  addTask(projectId: string, controller: AbortController) {
    // If a task for this project already exists, abort it before starting new one
    if (this.tasks.has(projectId)) {
      this.cancelTask(projectId);
    }
    this.tasks.set(projectId, controller);
    console.log(`[TaskManager] Registered task for project: ${projectId}`);
  }

  cancelTask(projectId: string): boolean {
    const controller = this.tasks.get(projectId);
    if (controller) {
      controller.abort();
      this.tasks.delete(projectId);
      console.log(` Task ABORTED for project: ${projectId}`);
      return true;
    }
    return false;
  }

  removeTask(projectId: string) {
    if (this.tasks.has(projectId)) {
      this.tasks.delete(projectId);
      console.log(` Completed task removed for project: ${projectId}`);
    }
  }

  isTaskActive(projectId: string): boolean {
    return this.tasks.has(projectId);
  }
}

export const taskManager = TaskManager.getInstance();
