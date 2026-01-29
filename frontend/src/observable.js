// Observable pattern implementation

export class Observable {
  constructor(fn) {
    this.subscribers = [];
    if (fn) fn(this);
  }

  subscribe(observer) {
    this.subscribers.push(observer);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== observer);
    };
  }

  next(value) {
    this.subscribers.forEach(sub => {
      if (sub.next) sub.next(value);
    });
  }

  error(error) {
    this.subscribers.forEach(sub => {
      if (sub.error) sub.error(error);
    });
  }

  complete() {
    this.subscribers.forEach(sub => {
      if (sub.complete) sub.complete();
    });
  }

  pipe(...operators) {
    return operators.reduce((source, operator) => operator(source), this);
  }
}

// Common operators
export const map = (fn) => (source) => new Observable(observer => {
  source.subscribe({
    next: (value) => observer.next(fn(value)),
    error: (err) => observer.error(err),
    complete: () => observer.complete()
  });
});

export const filter = (predicate) => (source) => new Observable(observer => {
  source.subscribe({
    next: (value) => {
      if (predicate(value)) observer.next(value);
    },
    error: (err) => observer.error(err),
    complete: () => observer.complete()
  });
});

export const take = (n) => (source) => new Observable(observer => {
  let count = 0;
  source.subscribe({
    next: (value) => {
      if (count++ < n) observer.next(value);
      if (count >= n) observer.complete();
    },
    error: (err) => observer.error(err),
    complete: () => observer.complete()
  });
});
