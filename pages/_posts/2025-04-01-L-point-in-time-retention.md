---
title: LDES step-by-step guide 12/18 - LDES point-in-time retention
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
The [point-in-time](https://semiceu.github.io/LinkedDataEventStreams/#point-in-time) retention policy is the most simple one: it drops a part of the history before a point in time.

The retention policy is an object of type `ldes:PointInTimePolicy`, which has a predicate `ldes:pointInTime` whose value is a timestamp (`xsd:dateTime` - see [ISO 8601 date and time representation](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations)). All members with their predicate value before this timestamp are unavailable in the view. Differently put, you can create a view that only holds data members with a timestamp on or after that point-in-time.

By default, the retention policy uses the `ldes:timestampPath` as defined by the `ldes:EventStream` as the predicate (or predicate path) to find the member's timestamp value to compare with the point-in-time value. Although not mentioned in the LDES specification, you can override this by providing a `ldes:timestampPath` predicate on the retention policy with a different property (or property path).

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
  tree:view disney:point-in-time .
disney:point-in-time a tree:Node ;
  ldes:retentionPolicy [
    a ldes:PointInTimePolicy ;
    ldes:pointInTime "1950-01-01T00:00:00Z"^^xsd:dateTime 
  ] .
```

> **Note** that in our [example above]({% post_url 2025-04-01-E-ldes-specs %}#full-example) this point-in-time view would only contain members `wiki:Minnie_Mouse#v2` and `wiki:Mickey_Mouse#v2` because the other two members have a `dct:created` value which is lower than our `ldes:pointInTime` value.

Summarized, we can use a **point-in-time policy** to **drop all members before an absolute date and time**.
