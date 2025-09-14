# Kafka Marble Diagrams Usage Guide

This guide explains how to use the RxJS marble diagrams for visualizing Kafka partition behavior in your presentations.

## Quick Start

1. **Generate diagrams**: `yarn marbles`
2. **Include in presentations**: Reference the SVG files in your Markdown
3. **Customize**: Edit `marbles/kafka-marbles.yml` to modify or add diagrams

## Available Diagrams

### 1. Single Partition Processing

- **File**: `single-partition.svg`
- **Use case**: Showing basic message flow through one partition
- **Key concepts**: Ordering, sequential processing

### 2. Multiple Partition Processing

- **File**: `multiple-partitions.svg`
- **Use case**: Demonstrating load distribution across partitions
- **Key concepts**: Parallel processing, load balancing

### 3. Consumer Group Rebalancing

- **File**: `partition-rebalancing.svg`
- **Use case**: Explaining dynamic scaling and partition reassignment
- **Key concepts**: Consumer groups, rebalancing, fault tolerance

### 4. Backpressure Handling

- **File**: `backpressure.svg`
- **Use case**: Showing how consumers handle high message rates
- **Key concepts**: Rate limiting, buffering, flow control

### 5. Exactly-Once Processing

- **File**: `exactly-once.svg`
- **Use case**: Demonstrating idempotent processing guarantees
- **Key concepts**: Message deduplication, transaction semantics

### 6. Partition Assignment Strategies

- **File**: `partition-assignment.svg`
- **Use case**: Comparing different assignment strategies
- **Key concepts**: Round-robin, range, sticky, cooperative

### 7. Message Ordering Guarantees

- **File**: `message-ordering.svg`
- **Use case**: Explaining ordering within partitions
- **Key concepts**: Sequential processing, ordering guarantees

### 8. Consumer Lag Visualization

- **File**: `consumer-lag.svg`
- **Use case**: Showing how lag affects processing
- **Key concepts**: Lag monitoring, catch-up processing

### 9. Dead Letter Queue Pattern

- **File**: `dead-letter-queue.svg`
- **Use case**: Demonstrating error handling and retry patterns
- **Key concepts**: Error handling, retry logic, DLQ

### 10. Log Compaction

- **File**: `compaction.svg`
- **Use case**: Explaining how Kafka maintains latest values
- **Key concepts**: Log compaction, key-based retention

## Using in Marp Presentations

### Basic Usage

```markdown
![w:800](marbles/single-partition.svg)
```

### With Caption

```markdown
![w:800](marbles/multiple-partitions.svg)

**Load Distribution** - Messages distributed across multiple partitions
```

### Full Width

```markdown
![w:1200](marbles/partition-rebalancing.svg)
```

## Customizing Diagrams

### 1. Edit Configuration

Modify `marbles/kafka-marbles.yml` to change:

- Diagram titles and descriptions
- Dimensions (width/height)
- Stream definitions
- Marble patterns

### 2. Add New Diagrams

Add new entries to the YAML file:

```yaml
diagrams:
  my-custom-diagram:
    title: "My Custom Diagram"
    description: "Description of what this shows"
    width: 1000
    height: 400
    streams:
      producer: "a---b---c---d---|"
      consumer: "--a---b---c---d-|"
```

### 3. Regenerate

Run `yarn marbles` to regenerate all diagrams.

## Marble Syntax

The marble diagrams use a simple syntax:

- **Letters (a, b, c, etc.)**: Represent messages/events
- **Dashes (-)**: Represent time passing
- **Pipe (|)**: Represents completion
- **Special characters (R, X, etc.)**: Represent special events (rebalancing, errors)

### Examples

- `a---b---c---|`: Three messages with delays
- `a-b-c-d-e-|`: Five messages in quick succession
- `a---b---X---c-|`: Messages with an error in between
- `-------R---|`: A rebalancing event

## Integration with Build Process

The marble diagrams are automatically generated as part of the build process:

- `yarn build`: Generates all diagrams and builds presentation
- `yarn marbles`: Generates only marble diagrams
- `yarn dev`: Development mode with auto-regeneration

## Troubleshooting

### Diagrams not appearing

1. Check that `yarn marbles` ran successfully
2. Verify file paths in your Markdown
3. Ensure SVG files exist in `src/marbles/`

### Custom diagrams not working

1. Check YAML syntax in `kafka-marbles.yml`
2. Verify marble string syntax
3. Run `yarn marbles` to see error messages

### Build issues

1. Ensure all dependencies are installed: `yarn install`
2. Check that the marbles directory exists
3. Verify file permissions

## Advanced Usage

### Programmatic Generation

You can also generate diagrams programmatically using the example script:

```bash
node marbles/example-usage.js
```

### Custom Styling

Modify the SVG generation in `scripts/build-marbles.js` to change:

- Colors and styling
- Layout and positioning
- Legend content
- Timeline markers

## Contributing

To add new diagram types or improve existing ones:

1. Add configuration to `marbles/kafka-marbles.yml`
2. Update the SVG generation logic if needed
3. Test with `yarn marbles`
4. Update this documentation
