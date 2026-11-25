---
title: Multi-Node High Availability System
summary: Moved an educational institution's web information system from a single server to a three-node architecture that stays up when a node goes down.
role: Designer & implementer (undergraduate thesis)
team: Solo
period: 2025–2026
order: 1
featured: true
stack:
  - Linux
  - MariaDB Galera Cluster
  - Keepalived (VRRP)
  - Nginx
  - PHP-FPM
  - VXLAN
stats:
  - label: Measured availability
    value: 99.95%
  - label: Nodes
    value: "3"
  - label: Single points of failure
    value: "0"
links:
  repo: https://github.com/khanigaraa/ha-keepalived-galera
diagram:
  src: /img/ha-architecture.svg
  alt: "Architecture diagram: users reach one Virtual IP managed by Keepalived (VRRP). The Virtual IP is active on Node 1 (MASTER) and moves to Node 2 (BACKUP) if Node 1 goes down. Nodes 1 and 2 run Keepalived, Nginx with PHP-FPM, and MariaDB Galera; Node 3 runs MariaDB Galera only. The three databases replicate multi-master. All three nodes sit inside one VXLAN network on Linux, which bridges the Keepalived (VRRP) traffic."
---

## The problem

An educational institution's web-based information system ran on **a single server**. Web server, application and database all lived on the same machine. If that server went down, through a hardware fault, maintenance or a bad configuration, the whole service went down with it: a *single point of failure*.

## The goal

The service had to **stay reachable even when one server goes down**, without users changing the address they use, and without data being lost or differing between servers.

## The architecture

The system was moved to three Linux nodes:

- **Nodes 1 and 2 (web + database):** both run **Keepalived (VRRP)**, **Nginx + PHP-FPM** and **MariaDB Galera**. Keepalived manages one *Virtual IP* that users always reach. The Virtual IP is active on Node 1 (MASTER); if Node 1 goes down, it moves to Node 2 (BACKUP) automatically, which is ready to serve the application (*failover*).
- **Node 3 (database only):** runs **MariaDB Galera** only, as the third member of the database cluster.
- **MariaDB Galera Cluster** on all three nodes replicates the database *multi-master*: data written on one node is on the others right away, so nothing is left behind when a failover happens. Node 3 is there so the cluster has three members: when one node goes down or is cut off, the remaining two still hold the majority (*quorum*), which prevents ***split brain***, where two halves of the cluster each think they are the real one and the data diverges.
- All three nodes sit **inside one VXLAN overlay network** on Linux. VXLAN serves as the **bridge for Keepalived (VRRP) traffic** between nodes, so Node 1 and Node 2 can watch each other and move the Virtual IP. The same network can also carry other traffic, such as Galera replication.

The design can grow: Node 3 could also run Keepalived and Nginx, giving the web layer two backups.

## Testing

I tested node-failure scenarios: shutting nodes down one at a time while monitoring the service, and checking that the application stayed reachable on the same Virtual IP and that the data stayed consistent.

## The result

- The service **kept running while a node was shut down**.
- Measured availability during testing: **99.95%**.
- The single point of failure at the server level is gone.

## What I learned

Building a system that survives failure means thinking about what happens when something breaks, not only when everything works: from the network and the address users rely on, to keeping the data consistent.
