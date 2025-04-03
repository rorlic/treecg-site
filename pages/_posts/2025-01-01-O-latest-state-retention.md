---
title: LDES step-by-step guide 15/18 - LDES latest state retention
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
This policy is not explicitly mentioned in the LDES specification, but you can read it between the lines: the optional predicate `ldes:amount` defaults to 1 for the `ldes:LatestVersionSubset` retention policy.

By keeping only the latest version of a state object we effectively drop the history of the state objects and have a view on the _current state_ of the source system. This is what other systems provide by default through an API. 

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
  tree:view disney:latest-state .
disney:latest-state a tree:Node ;
  ldes:retentionPolicy [
    a ldes:LatestVersionSubset
  ] .
```
> **Note** that in our [example above]({% post_url 2025-01-01-E-ldes-specs %}#full-example) this latest-state view would only contain members `wiki:Minnie_Mouse#v2` and `wiki:Mickey_Mouse#v2` because these are the latests versions of each state object. If at some time in the future a third version of a member would be added, then the previous version of that state object would be removed from the view.

A **latest-state retention policy** is a special case of a version-based retention policy to **drop all but the latest version of each member**, in essence just keeping the current/latest state of a data set, without the history of changes.
