---
marp: true
theme: default
paginate: true
---

# Apache Kafka

## Introduction and Overview

**Your Name**  
_Date: $(date)_

---

# What is Apache Kafka?

- **Distributed streaming platform**
- **High-throughput, low-latency** messaging system
- **Fault-tolerant** and **scalable**
- Originally developed by **LinkedIn**

---

# Key Concepts

## Core Components

- **Producers** - Send messages to topics
- **Consumers** - Read messages from topics
- **Brokers** - Store and serve messages
- **Topics** - Categories for organizing messages
- **Partitions** - Topics are split into partitions

---

# Architecture Overview

```
Producer → Topic (Partition 0, 1, 2) → Consumer
    ↓              ↓                    ↑
  Broker 1      Broker 2            Broker 3
```

- **Distributed** across multiple brokers
- **Replicated** for fault tolerance
- **Partitioned** for scalability

---

# Use Cases

## Real-time Data Processing

- **Event streaming**
- **Log aggregation**
- **Metrics collection**

## Integration

- **Microservices communication**
- **Data pipeline**
- **Change data capture**

---

# Benefits

✅ **High Performance** - Millions of messages per second  
✅ **Durability** - Messages persisted to disk  
✅ **Scalability** - Horizontal scaling  
✅ **Fault Tolerance** - No single point of failure  
✅ **Real-time** - Low latency processing

---

# Getting Started

## Quick Setup

```bash
# Download Kafka
wget https://downloads.apache.org/kafka/...

# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties
```

---

# Next Steps

1. **Create your first topic**
2. **Write a producer**
3. **Write a consumer**
4. **Explore advanced features**

## Resources

- [Official Documentation](https://kafka.apache.org/documentation/)
- [Confluent Platform](https://www.confluent.io/)

---

# Questions?

Thank you for your attention!

**Contact:** your.email@example.com
