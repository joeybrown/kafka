# Kafka Partition Marble Diagrams

This directory contains RxJS-style marble diagrams that visualize how Kafka partitions work.

## Generated Diagrams


### Single Partition Processing
- **File**: `single-partition.svg`
- **Description**: Messages flowing through a single Kafka partition in order
- **Dimensions**: 800x400px

### Multiple Partition Processing
- **File**: `multiple-partitions.svg`
- **Description**: Messages distributed across multiple partitions for parallel processing
- **Dimensions**: 1000x500px

### Consumer Group Rebalancing
- **File**: `partition-rebalancing.svg`
- **Description**: How consumers handle partition reassignment when group membership changes
- **Dimensions**: 1200x600px

### Backpressure Handling
- **File**: `backpressure.svg`
- **Description**: How consumers handle high message rates with buffering
- **Dimensions**: 1000x450px

### Exactly-Once Processing
- **File**: `exactly-once.svg`
- **Description**: Ensuring messages are processed exactly once with idempotent operations
- **Dimensions**: 1000x500px

### Partition Assignment Strategies
- **File**: `partition-assignment.svg`
- **Description**: Different strategies for assigning partitions to consumers
- **Dimensions**: 1200x550px

### Message Ordering Guarantees
- **File**: `message-ordering.svg`
- **Description**: How Kafka maintains ordering within partitions
- **Dimensions**: 1000x450px

### Consumer Lag Visualization
- **File**: `consumer-lag.svg`
- **Description**: How consumer lag affects processing and recovery
- **Dimensions**: 1000x500px

### Dead Letter Queue Pattern
- **File**: `dead-letter-queue.svg`
- **Description**: How failed messages are handled and retried
- **Dimensions**: 1000x500px

### Log Compaction
- **File**: `compaction.svg`
- **Description**: How Kafka maintains the latest value for each key
- **Dimensions**: 1000x450px


## Usage

These diagrams are automatically generated and can be included in your presentations by referencing them in your Markdown files:

```markdown
![Single Partition Processing](./marbles/single-partition.svg)
```

## Regenerating

To regenerate all marble diagrams, run:

```bash
yarn marbles
```
