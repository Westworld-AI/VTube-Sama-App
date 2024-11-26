// 优先级队列
class PriorityQueue<T> {
  private queue: { priority: number; data: T }[] = [];

  enqueue(data: T, priority: number) {
    const item = { priority, data };
    const index = this.queue.findIndex(i => i.priority > priority);
    if (index === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(index, 0, item);
    }
  }

  dequeue() {
    return this.queue.shift()?.data;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

// 消费者
type Consumer<T> = (data: T) => void;

// 事件发射器
class EventEmitter<T> {
  private consumers: Consumer<T>[] = [];

  subscribe(consumer: Consumer<T>) {
    this.consumers.push(consumer);
  }

  unsubscribe(consumer: Consumer<T>) {
    this.consumers = this.consumers.filter(c => c !== consumer);
  }

  emit(data: T) {
    this.consumers.forEach(c => c(data));
  }
}

// 优先级队列事件发射器
class PriorityQueueEmitter<T> {
  private queue = new PriorityQueue<T>();
  emitter = new EventEmitter<T>();

  enqueue(data: T, priority: number) {
    this.queue.enqueue(data, priority);
    this.emitter.emit(data);
  }

  subscribe(consumer: Consumer<T>) {
    this.emitter.subscribe(consumer);
  }

  unsubscribe(consumer: Consumer<T>) {
    this.emitter.unsubscribe(consumer);
  }
}

export { PriorityQueue, PriorityQueueEmitter };
