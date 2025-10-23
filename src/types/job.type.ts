import { EnqueueOptions } from "./enqueue.type";

export interface Job<T = any> {
  id: string;
  type: string;
  payload: T;
  options: EnqueueOptions;
}
