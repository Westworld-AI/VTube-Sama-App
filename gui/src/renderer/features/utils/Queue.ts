class TaskPriorityQueue {
  private queue: Array<{ task: any; priority: number }>;
  private isProcessing: boolean;

  constructor() {
    this.queue = []; // 任务队列，存储任务及其优先级
    this.isProcessing = false; // 是否有任务正在执行
  }

  // 添加任务到队列
  async enqueue(task: any, priority: number) { // 增加了priority参数
    this.queue.push({ task, priority }); // 将任务和其优先级添加到队列

    // 根据优先级对队列进行排序，优先级值较小的任务在队列前面
    this.queue.sort((a, b) => a.priority - b.priority);

    if (!this.isProcessing) {
      console.log('run process ...');
      const startTime = Date.now(); // 记录开始时间
      await this.process(); // 如果当前没有任务在执行，则开始执行任务
      const endTime = Date.now(); // 记录结束时间
      console.log(`Process completed. Execution time: ${endTime - startTime} ms`); // 打印耗时
    } else {
      console.log('not run process ...');
    }
  }

  // 处理队列中的任务
  async process() {
    this.isProcessing = true; // 标记为任务正在执行
    while (this.queue.length > 0) {
      const { task } = this.queue.shift()!; // 获取队列中的第一个任务，确保它存在
      await task(); // 执行任务
      console.log('run task ...');
    }
    this.isProcessing = false; // 所有任务执行完毕，标记为没有任务正在执行
  }
}

const chatTaskPriorityQueue = new TaskPriorityQueue();
export { chatTaskPriorityQueue };
