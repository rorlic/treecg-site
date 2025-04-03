---
title: LDES step-by-step guide 14/18 - LDES version-based retention
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
The [version-based](https://semiceu.github.io/LinkedDataEventStreams/#version-subsets) retention policy allows to keep a limited number of versions (state changes) of a state object.

The policy is based on the idea that only a number of latest versions may be relevant to a data client and anything older is obsolete.

The retention policy is an object of type `ldes:LatestVersionSubset`, which has a(n optional) predicate `ldes:amount` defining the (non-negative) number of versions (N) to keep per state object (`xsd:nonNegativeInteger`). Please remember that the `ldes:timestampPath` defines the order of all the versions of the same (state) object and that the `ldes:versionOfPath` predicate allows to group all the versions of this object.

When the policy is applied, the oldest surplus versions are removed from the view, effectively keeping the N newest versions per state object.

Again, both the `ldes:versionOfPath` and `ldes:timestampPath` predicates can be redefined on the policy level.

There is an alternative way to group members together and decide which to keep in these groupings: you can also specify a `ldes:versionKey`, which basically looks up and concatenates literal values to use as a key for the group. All members within each group are then sorted by the `ldes:timestampPath` predicate and the N newest are kept.

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
  tree:view disney:version-based .
disney:version-based a tree:Node ;
  ldes:retentionPolicy [
    a ldes:LatestVersionSubset ;
    ldes:amount 2
  ] .
```
> **Note** that in our [example above](#ldes-specification) this version-based view would contain all current members. If at some time in the future a third version of a member would be added, then the first version would be removed from the view.

Summarized, we can use a **version-based policy** to **drop all but a number of latest versions of each member**.
