---
title: LDES step-by-step guide 13/18 - LDES time-based (sliding time window) retention
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
The [time-based](https://semiceu.github.io/LinkedDataEventStreams/#time-based-retention) retention policy is referred in the LDES specification as the time-based retention policy, but I like to call it a sliding time-window to prevent confusion with the point-in-time, which is also time-based.

Instead of using a fixed point-in-time, this policy uses a dynamic point-in-time as a cutoff point on which members to keep and which to remove from the view. This dynamic point is simply some period of time ago before the current date and time, effectively creating a sliding time-window as time progresses.

The retention policy is an object of type `ldes:DurationAgoPolicy`, which has a predicate `tree:value` whose literal value is a duration (`xsd:duration` - see [ISO 8601 durations](https://en.wikipedia.org/wiki/ISO_8601#Durations)). All members with their predicate value before this dynamic timestamp (created by the current date and time minus the duration) are unavailable in the view.

Again, the `ldes:timestampPath` can be redefined on the policy level to use a different member predicate value.

```
@prefix tree:      <https://w3id.org/tree#> .
@prefix ldes:      <https://w3id.org/ldes#> .
@prefix sh:        <http://www.w3.org/ns/shacl#> .
@prefix schema:    <http://schema.org/> .
@prefix dct:       <http://purl.org/dc/terms/> .
@prefix xsd:       <http://www.w3.org/2001/XMLSchema#> .
@prefix wiki:      <http://en.wikipedia.org/wiki/> .
@prefix disney:    <http://en.wikipedia.org/wiki/disney/> .
wiki:disney a ldes:EventStream ;
  tree:shape [ a sh:NodeShape; sh:targetClass schema:Person ] ;
  ldes:versionOfPath dct:isVersionOf ;
  ldes:timestampPath dct:created ;
  tree:view disney:sliding-time-window .
disney:sliding-time-window a tree:Node ;
  ldes:retentionPolicy [
    a ldes:DurationAgoPolicy ;
    tree:value "P30Y"^^xsd:duration 
  ] .
```
> **Note** that in our [example above]({% post_url 2025-04-01-E-ldes-specs %}#full-example) this sliding time-window view would only contain member `wiki:Minnie_Mouse#v2` because any member with a `dct:created` value before today minus 30 years is removed. This remaining member should be removed in about five years (around January 1st, 2030).

Summarized, we can use a **time-based policy** to **drop all members before a relative date and time**, basically the start of the sliding time window.
