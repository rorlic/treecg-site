---
title: LDES for interoperability within and across dataspaces
layout: post
authors:
- Pieter Colpaert
tags:
- LDES
---

LDES is a fairly new protocol.
It is being designed for exchanging datasets that aim to be interoperable _within_ and _across_ dataspaces.
A dataspace is an ecosystem of actors---providers, consumers, as well as intermediaries---that want to facilitate data flows for a certain goal.

I.e., in Flanders, a [mobility dataspace on traffic counts](https://www.interregnorthsea.eu/sites/default/files/2024-06/Mobility%20Data%20Space%20Flanders.pdf) was established.
It starts from the observation that multiple parties measure traffic in various ways, and that maybe others could be good indicators of traffic after a transformation (e.g., ANPR cameras).
One organization that needed access to traffic counts on a road segment would often re-count traffic on that same segment, because setting up the data sharing would be more tedious than installing hardware all over again.
This is avoided when we establish a dataspace: an ecosystem of stakeholders that agree on things like data models, how to discover the existence of the data, usage control policies and how to enforce them, and what data exchange APIs will be provided at the minimum.

This is a story that can be re-told for so many different cases, for fast data, but equally as well for slow moving data such as our base registries, or even personal data sharing (left out of scope for this post).
For base registries, think for example about the federation of data portals towards [the European data portal](https://data.europa.eu), the creation of a [pan-European railway infrastructure database](https://julianrojas.org/papers/iswc2021-in-use/) (Rojas, 2021), creating an overview of all art-works in European museums with [Europeana](https://www.europeana.eu/en), or an [EU overview of tenders](https://ted.europa.eu/en/), etc.

Each dataspace can decide on their own how to achieve goals like interoperability and query answering.
With LDES, we are however opinionated about how to achieve those.
Let’s look at the figure below.

![A simple pipeline](https://docs.google.com/drawings/d/e/2PACX-1vT94isiCM5-M69i7D96-vNFTgBScZ9bsr24vw04fO0Z2a5O3R3qtqxgmuoarMLReuGRlVfBYw-UPpw3/pub?w=981&h=291)

A simple pipeline has been depicted. Without the idea of the Web, RDF or dataspaces, we’d call this idea _Event Sourcing_.
Event Sourcing is an architectural style in which you can only change an interface by describing how the world changed at the source.
Views then make the data queryable. Those views can vary depending on the need of the consumers, but also based on usage control policies. 
For example, an ANPR camera can write the raw data of number-plates it detects to an event source.
A trusted intermediary can transform this view towards the data and model agreed upon by the traffic measurements dataspace, and republish this data again.
This way, the data of the ANPR camera becomes _interoperable_ with the applications coded against this particular dataspace.

Again, the story can be re-told for any other kind of dataset.
For example, for data portals, we have created the [DCAT-AP Feeds specification](https://semiceu.github.io/LDES-DCAT-AP-feeds/) that specifies how a data portal can change, so that aggregators like data.europa.eu can build their derived views based on the many national data sources.
Each update can be a trigger to update a derived view.
While event sourcing has been around for designing data architectures for one system, how do we use this in the context of dataspaces across multiple actors over the Web?

We first need to design a protocol that allows intermediaries to reach their full potential.
With the law of supply and demand, intermediaries will be able to self-regulate what specialized services on top of certain datasets to keep available and what services will disappear.
This takes a huge burden away from the dataset maintainers: they do not need to host any possible Web API themselves anymore.

This requires the intermediaries themselves, at the minimum, to be able to replicate and always stay in-sync with the source of the data.
This is why we designed the simplest LDES views to be chronological search trees.
A client can decide what time extent it wants to replicate, and can then on each synchronization job always skip to the latest data.

When you look at an LDES page, such as [the one of the European Railway Infrastructure dataset](https://era.ilabt.imec.be/rinf/ldes), you would not recognize this is a “streaming” interface.
So how does the event streaming then work?
There are LDES client implementations in [Java](https://informatievlaanderen.github.io/VSDS-Linked-Data-Interactions/ldio/ldio-inputs/ldio-ldes-client) and in [TypeScript](https://github.com/rdf-connect/ldes-client) that abstract the complexities of dealing with LDES.
Clients will replicate all objects that are available in the LDES view, and will then always stay in-sync with it by emitting new objects as they get published.
They can be emitted and then pipelined using tooling such as [Apache Nifi](https://informatievlaanderen.github.io/VSDS-Linked-Data-Interactions/ldi-nifi/index), [LDIO](https://informatievlaanderen.github.io/VSDS-Linked-Data-Interactions/ldio/index), [RDF Connect](https://github.com/rdf-connect/) or [Piveau Consus](https://github.com/rdf-connect/piveau-consus-importing-ldes).

The event stream itself is being described in the page: it is defined as an append-only log of objects described using a set of RDF triples.
Those clients will frequently poll the page based on the calculated expiration based on their caching headers.
Based on [our earlier research](https://brechtvdv.github.io/Article-Live-Open-Data-Interfaces/) (Van de Vyvere, 2020), polling remains more powerful for this use case than push-based protocols such as Websockets or Server-Sent Events (SSE) until you want all subscribers to be informed about a change with a latency that is less than ~10 seconds.
In that case, publishers can offer a push-based channel on top of their polling interface that also publishes the history of the stream, although this has not yet been needed in use cases we handled thusfar.

![LDESs between dataspaces](https://docs.google.com/drawings/d/e/2PACX-1vSQdZv2WiuCmAj2RLqfMWliMtHQKMc8mtDXm9W4IjB36_pDiyge3rHmYyEs_i0op9s2a_fMUPQAWHWN/pub?w=852&h=433)

Interoperability and queryability _within_ one dataspace are thus ensured by transforming a source dataset into the right data model, and making the right services available through intermediaries.
However, in reality, on the one hand a dataset is going to be useful for multiple dataspaces, requiring interoperability with multiple ecosystems.
On the other hand, consumers may also choose to shop for data models and features from multiple dataspaces to make their app work for a broader audience.
If more dataspaces rely on Linked Data and Event Streaming, interoperability _across_ thematic dataspaces would become possible: a data provider could offer the LDES in multiple data models.

In conclusion, the idea behind LDES is to apply Event Sourcing on Web-scale, with Linked Data as a framework to weave together heterogeneous models.
The streaming aspect is abstracted away in the clients and servers.
In most cases, the technical implementation makes most sense as a polling interface.
In cases where faster updates are needed, a pubsub interface can also be described.

