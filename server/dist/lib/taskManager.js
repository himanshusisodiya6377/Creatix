class TaskManager {
    constructor() {
        this.tasks = new Map();
    }
    static getInstance() {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }
    addTask(projectId, controller) {
        // If a task for this project already exists, abort it before starting new one
        if (this.tasks.has(projectId)) {
            this.cancelTask(projectId);
        }
        this.tasks.set(projectId, controller);
        console.log(`[TaskManager] Registered task for project: ${projectId}`);
    }
    cancelTask(projectId) {
        const controller = this.tasks.get(projectId);
        if (controller) {
            controller.abort();
            this.tasks.delete(projectId);
            console.log(`[TaskManager] 🛑 Task ABORTED for project: ${projectId}`);
            return true;
        }
        return false;
    }
    removeTask(projectId) {
        if (this.tasks.has(projectId)) {
            this.tasks.delete(projectId);
            console.log(`[TaskManager] Completed task removed for project: ${projectId}`);
        }
    }
    isTaskActive(projectId) {
        return this.tasks.has(projectId);
    }
}
export const taskManager = TaskManager.getInstance();
