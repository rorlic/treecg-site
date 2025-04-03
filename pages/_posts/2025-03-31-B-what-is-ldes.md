---
title: What is LDES? - Step-by-step guide 2/17
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
When publishing data for use by data clients, the actual problem that we are trying to solve is data _sharing_, not data _querying_. So, why would we try to solve that with a _querying_ API? We need a generic API which allows for sharing data sets instead.

LDES provides a way to do exactly that. It allows a data client to copy the _historical_ and _current_ state of a data set (*replicate*) and to keep up to date with the _changes_ made to it in the future (*synchronize*).

If you look at the name LDES you can see that it actually consists of 2 parts: _Linked Data_ (LD) and _Event Streams_ (ES).

[Linked Data](https://en.wikipedia.org/wiki/Linked_data) is [structured data](https://www.ibm.com/think/topics/structured-vs-unstructured-data) that can be (inter)linked with other (linked) data. In order to link related data sets together, all data items must have a (globally) unique identifier and all data properties need to have well-defined meaning (semantics). Linked data is therefore very suited for things like [semantic queries](https://en.wikipedia.org/wiki/Semantic_query).

An [(Event) Stream](https://en.wikipedia.org/wiki/Stream_(computing)) is a continuous flow of data produced over time by some system. In software development, we typically handle such a flow using [stream processing](https://en.wikipedia.org/wiki/Stream_processing). Each data item contains an [event](https://en.wikipedia.org/wiki/Event_(computing)), which is basically a change of the state of a thing. An event can either represent only the portion of this thing that has changed, or the full new state of the thing. The LDES specification requires that the data items contain the complete new state of a thing. We call this a (state object) _version_.

In essence, a LDES is **an event stream of (full) versions of things, represented as linked data**.
