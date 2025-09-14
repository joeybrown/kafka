#!/usr/bin/env node

/**
 * Example script showing how to use RxJS marble diagrams for Kafka visualization
 * 
 * This script demonstrates how to create custom marble diagrams programmatically
 * and integrate them with your Kafka presentations.
 */

import { TestScheduler } from 'rxjs/testing';
import { of, interval, merge, map, take, delay, filter } from 'rxjs';

// Example 1: Simple message flow through a partition
function createSimplePartitionFlow() {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  scheduler.run(({ cold, expectObservable }) => {
    // Producer sends messages
    const producer$ = cold('a---b---c---d---|', {
      a: { id: 1, data: 'message1' },
      b: { id: 2, data: 'message2' },
      c: { id: 3, data: 'message3' },
      d: { id: 4, data: 'message4' }
    });

    // Partition processes messages
    const partition$ = producer$.pipe(
      map(msg => ({ ...msg, partition: 0, offset: Date.now() }))
    );

    // Consumer processes messages with delay
    const consumer$ = partition$.pipe(
      delay(20, scheduler),
      map(msg => ({ ...msg, processed: true }))
    );

    expectObservable(consumer$).toBe('--a---b---c---d-|', {
      a: { id: 1, data: 'message1', partition: 0, offset: jasmine.any(Number), processed: true },
      b: { id: 2, data: 'message2', partition: 0, offset: jasmine.any(Number), processed: true },
      c: { id: 3, data: 'message3', partition: 0, offset: jasmine.any(Number), processed: true },
      d: { id: 4, data: 'message4', partition: 0, offset: jasmine.any(Number), processed: true }
    });
  });
}

// Example 2: Multiple partitions with load balancing
function createMultiplePartitionFlow() {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  scheduler.run(({ cold, expectObservable }) => {
    // Messages with keys for partitioning
    const messages$ = cold('a---b---c---d---e---f---|', {
      a: { key: 'user1', data: 'message1' },
      b: { key: 'user2', data: 'message2' },
      c: { key: 'user1', data: 'message3' },
      d: { key: 'user3', data: 'message4' },
      e: { key: 'user2', data: 'message5' },
      f: { key: 'user1', data: 'message6' }
    });

    // Partition 0 gets user1 messages
    const partition0$ = messages$.pipe(
      filter(msg => msg.key === 'user1'),
      map(msg => ({ ...msg, partition: 0 }))
    );

    // Partition 1 gets user2 messages
    const partition1$ = messages$.pipe(
      filter(msg => msg.key === 'user2'),
      map(msg => ({ ...msg, partition: 1 }))
    );

    // Partition 2 gets user3 messages
    const partition2$ = messages$.pipe(
      filter(msg => msg.key === 'user3'),
      map(msg => ({ ...msg, partition: 2 }))
    );

    // Consumer processes all partitions
    const consumer$ = merge(partition0$, partition1$, partition2$).pipe(
      map(msg => ({ ...msg, processed: true }))
    );

    expectObservable(consumer$).toBe('a---b---c---d---e---f---|', {
      a: { key: 'user1', data: 'message1', partition: 0, processed: true },
      b: { key: 'user2', data: 'message2', partition: 1, processed: true },
      c: { key: 'user1', data: 'message3', partition: 0, processed: true },
      d: { key: 'user3', data: 'message4', partition: 2, processed: true },
      e: { key: 'user2', data: 'message5', partition: 1, processed: true },
      f: { key: 'user1', data: 'message6', partition: 0, processed: true }
    });
  });
}

// Example 3: Consumer group rebalancing
function createRebalancingFlow() {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  scheduler.run(({ cold, expectObservable }) => {
    // Messages flowing through partitions
    const partition0$ = cold('a---b---c---d---e---f---|', {
      a: { partition: 0, offset: 0 },
      b: { partition: 0, offset: 1 },
      c: { partition: 0, offset: 2 },
      d: { partition: 0, offset: 3 },
      e: { partition: 0, offset: 4 },
      f: { partition: 0, offset: 5 }
    });

    const partition1$ = cold('---x---y---z---w---v---u-|', {
      x: { partition: 1, offset: 0 },
      y: { partition: 1, offset: 1 },
      z: { partition: 1, offset: 2 },
      w: { partition: 1, offset: 3 },
      v: { partition: 1, offset: 4 },
      u: { partition: 1, offset: 5 }
    });

    // Consumer 1 handles partition 0
    const consumer1$ = partition0$.pipe(
      map(msg => ({ ...msg, consumer: 'consumer1' }))
    );

    // Consumer 2 handles partition 1
    const consumer2$ = partition1$.pipe(
      map(msg => ({ ...msg, consumer: 'consumer2' }))
    );

    // Rebalancing event
    const rebalance$ = cold('-------R---------------|', {
      R: { type: 'rebalance', timestamp: Date.now() }
    });

    // Combined consumer output
    const combined$ = merge(consumer1$, consumer2$, rebalance$);

    expectObservable(combined$).toBe('a---x---b---y---c---z---d---w---e---v---f---u---R-|', {
      a: { partition: 0, offset: 0, consumer: 'consumer1' },
      x: { partition: 1, offset: 0, consumer: 'consumer2' },
      b: { partition: 0, offset: 1, consumer: 'consumer1' },
      y: { partition: 1, offset: 1, consumer: 'consumer2' },
      c: { partition: 0, offset: 2, consumer: 'consumer1' },
      z: { partition: 1, offset: 2, consumer: 'consumer2' },
      d: { partition: 0, offset: 3, consumer: 'consumer1' },
      w: { partition: 1, offset: 3, consumer: 'consumer2' },
      e: { partition: 0, offset: 4, consumer: 'consumer1' },
      v: { partition: 1, offset: 4, consumer: 'consumer2' },
      f: { partition: 0, offset: 5, consumer: 'consumer1' },
      u: { partition: 1, offset: 5, consumer: 'consumer2' },
      R: { type: 'rebalance', timestamp: jasmine.any(Number) }
    });
  });
}

// Example 4: Backpressure handling
function createBackpressureFlow() {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  scheduler.run(({ cold, expectObservable }) => {
    // High-frequency producer
    const producer$ = cold('a-b-c-d-e-f-g-h-i-j-k-l-|', {
      a: { id: 1 }, b: { id: 2 }, c: { id: 3 }, d: { id: 4 },
      e: { id: 5 }, f: { id: 6 }, g: { id: 7 }, h: { id: 8 },
      i: { id: 9 }, j: { id: 10 }, k: { id: 11 }, l: { id: 12 }
    });

    // Consumer with processing delay (backpressure)
    const consumer$ = producer$.pipe(
      delay(20, scheduler), // Simulate processing time
      map(msg => ({ ...msg, processed: true }))
    );

    // Buffer for unprocessed messages
    const buffer$ = producer$.pipe(
      delay(10, scheduler),
      map(msg => ({ ...msg, buffered: true }))
    );

    expectObservable(consumer$).toBe('a---b---c---d---e---f---g---h---i---j---k---l-|', {
      a: { id: 1, processed: true },
      b: { id: 2, processed: true },
      c: { id: 3, processed: true },
      d: { id: 4, processed: true },
      e: { id: 5, processed: true },
      f: { id: 6, processed: true },
      g: { id: 7, processed: true },
      h: { id: 8, processed: true },
      i: { id: 9, processed: true },
      j: { id: 10, processed: true },
      k: { id: 11, processed: true },
      l: { id: 12, processed: true }
    });
  });
}

// Run examples
console.log('🎯 Running Kafka marble diagram examples...');

try {
  console.log('1. Simple partition flow...');
  createSimplePartitionFlow();
  console.log('✅ Simple partition flow test passed');

  console.log('2. Multiple partition flow...');
  createMultiplePartitionFlow();
  console.log('✅ Multiple partition flow test passed');

  console.log('3. Rebalancing flow...');
  createRebalancingFlow();
  console.log('✅ Rebalancing flow test passed');

  console.log('4. Backpressure flow...');
  createBackpressureFlow();
  console.log('✅ Backpressure flow test passed');

  console.log('🎉 All marble diagram examples completed successfully!');
} catch (error) {
  console.error('❌ Error running marble diagram examples:', error.message);
  process.exit(1);
}
