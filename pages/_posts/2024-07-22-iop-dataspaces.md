---
title: LDES for interoperability within and across dataspaces
layout: post
authors:
- Pieter Colpaert
tags:
- LDES
---

Linked Data Event Streams (LDES) is a relatively new protocol designed for exchanging interoperable datasets _within_ and _across_ dataspaces.
A dataspace is an ecosystem of actors---such as providers, consumers, and intermediary participants---that facilitates data flows to achieve specific goals.

For instance, in Flanders, a [mobility dataspace on traffic counts](https://www.interregnorthsea.eu/sites/default/files/2024-06/Mobility%20Data%20Space%20Flanders.pdf) was established to address the fragmented nature of traffic measurements.
The story goes that one organization that needed access to traffic counts on a road segment decided to re-count traffic on a segment that was already counted by another organization.
Setting up the data sharing would have been more tedious than installing rather expensive hardware all over again.
By creating an ecosystem where stakeholders agree on data models, discovery methods, usage control policies, and data exchange APIs, the need for redundant data collection is eliminated.

This concept is applicable not only to fast data but also to slow-moving data, such as base registries or personal data sharing (which is outside the scope of this post).
Examples include the federation of data portals toward [the European data portal](https://data.europa.eu), the creation of a [pan-European railway infrastructure database](https://julianrojas.org/papers/iswc2021-in-use/) (Rojas, 2021), creating an overview of all art-works in European museums with [Europeana](https://www.europeana.eu/en).

Each dataspace can decide independently how to achieve interoperability and query answering.
However, with LDES, we provide a specific approach.
As depicted in the figure below, we utilize an architectural style known as _Event Sourcing_ (see [Microsoft's](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) and [Amazon's](https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/service-per-team.html) descriptions about it).
This involves describing changes at the source and creating query-able views tailored to consumer needs and usage control policies.
For example, an ANPR camera can write raw number plate data to an event source, which a trusted intermediary participant transforms and republishes according to the agreed-upon data model of the traffic measurements dataspace as aggregated and anonymized traffic counts.

![A simple pipeline](https://docs.google.com/drawings/d/e/2PACX-1vT94isiCM5-M69i7D96-vNFTgBScZ9bsr24vw04fO0Z2a5O3R3qtqxgmuoarMLReuGRlVfBYw-UPpw3/pub?w=981&h=291)

Again, the story can be adapted for any other kind of dataset.
For example, for data portals, we have created the [DCAT-AP Feeds specification](https://semiceu.github.io/LDES-DCAT-AP-feeds/) that specifies how a data portal can change, so that aggregators like *data.europa.eu* can build their derived views incrementally knowing what types of changes it can expect.

For each type of dataset there are always intermediary participants that would like to aggregate datasets, transform them into a model that can be used into a certain dataspace, or provide specialized APIs on top of them.
Intermediary participants can self-regulate such services based on demand: i.e., if an autocompletion API would not be used anymore, it can be brought offline, still allowing others in the ecosystem to take over certain functionalities.
The LDES protocol therefore is focused on enabling intermediary participants, and thus lowering the burden on dataset providers as they do not need to focus on offering all these services on their own.

This requires the participants themselves, at the minimum, to be able to replicate and always stay in-sync with the source of the data.
This is why we designed the simplest LDES views to be chronological search trees.
A client can decide what time extent it wants to replicate, and can then on each synchronization job always skip to the latest data.

When you look at an LDES page, such as [the one of the European Railway Infrastructure dataset](https://era.ilabt.imec.be/rinf/ldes), you would not recognize this to be a “streaming” interface.
The streaming aspects will only come visible from the moment you use an LDES client.
There are LDES client implementations in [Java](https://informatievlaanderen.github.io/VSDS-Linked-Data-Interactions/ldio/ldio-inputs/ldio-ldes-client) and in [TypeScript](https://github.com/rdf-connect/ldes-client).
Clients will start from the beginning of the stream and incrementally, while time passes, emit all new updates it can find by following links, polling the page, or even subscribing to a pubsub channel.
Those updates can then be pipelined using tooling such as [Apache Nifi](https://informatievlaanderen.github.io/VSDS-Linked-Data-Interactions/ldi-nifi/index), [LDIO](https://informatievlaanderen.github.io/VSDS-Linked-Data-Interactions/ldio/index), [RDF-Connect](https://github.com/rdf-connect/) or [Piveau Consus](https://github.com/rdf-connect/piveau-consus-importing-ldes).

The event stream itself is thus being described in the page: it is defined as an append-only log of objects described using a set of RDF triples.
Those clients will frequently poll the page based on the calculated expiration based on their caching headers.
Based on [our earlier research](https://brechtvdv.github.io/Article-Live-Open-Data-Interfaces/) (Van de Vyvere, 2020), polling remains more powerful and cost-efficient for this use case than push-based protocols such as Websockets or Server-Sent Events (SSE) until you want all subscribers to be informed about a change with a latency that is less than ~10 seconds.
In that case, publishers can offer a push-based channel on top of their polling interface that also publishes the history of the stream, although this has not yet been needed in use cases we handled thusfar.

Interoperability and queryability _within_ one dataspace are thus ensured by transforming a source dataset into the right data model, and making the right services available through intermediary participants.
However, in reality, a dataset is going to be useful for multiple dataspaces, requiring interoperability with multiple ecosystems.
If more dataspaces rely on Linked Data and Event Streaming, interoperability _across_ thematic dataspaces would become possible: a data provider could offer the LDES in multiple data models, or intermediary participants can derive multiple views from the same source.

That’s how Linked Data Event Streams (LDES) enables the exchange of interoperable datasets within and across dataspaces by applying event sourcing on Web APIs.
Publishing an LDES yourself is light-weight by design to facilitate adoption.
The responsibility of knowing where you are in the stream is fully up to the subscribers, which can be done with the open-source LDES clients.
