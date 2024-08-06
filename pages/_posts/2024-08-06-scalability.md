---
title: Is LDES scalable?
layout: post
authors:
- Pieter Colpaert
tags:
- LDES
---

What happens when the Linked Data Event Streams (LDES) keeps increasing in volume?
Or, what if I want to handle fast data?
Or, what if my data is increasingly popular and it needs to handle more subscribers?
Or, what if I want to handle an increasing amount of LDESs as a consumer?

LDES is designed to be easy to publish, but also to be as scalable as possible.
LDES allows this by staying as close as possible to the HTTP stack, and allowing you to use principles commonly used on Web resources such as compression, caching, search tree fragmentations, retention policies, aggregating data, etc.

## A search tree for replication and synchronization

We recommend publishing an LDES using simple pages structured in a chronological search tree.
For example, on the first page, you could encounter links to the year pages, then to the months, to the days, ... until your pages are sufficiently small.
This way, pages that are finalized can have a `cache-control: immutable` header, indicating a client does not need to re-fetch the page ever again.
Pages that are not yet finished--being the pages on the right side of the search tree--can have a `max-age` directive indicating when a client should fetch the page again.
One can experiment with different page sizes to make make replication and synchronization tasks more efficient.

Let’s talk about the scalability of LDES by starting from this design.

## Part 1: Volume

Something that should already be enabled by default over HTTP is [per page compression](https://developer.mozilla.org/en-US/docs/Web/HTTP/Compression).
This way, the verbose RDF format you are using will already get a big reduction in size (~70% according to Mozilla).

In many cases, only compression will not be sufficient to tame the volume of data.
Think for example about a dataset of sensor observations that gets a new sensor value each minute: after a while, you will start wondering why you still keep the per minute granularity of your data on disk.
Therefore the LDES specification introduces per view retention policies.
This means a server maintainer can decide to remove older data based on either duration (`ldes:DurationAgoPolicy`), either on whether it‘s an older version of something (`ldes:LatestVersionSubset`).
This way, keeping older data can either be delegated to another party in the ecosystem or can be something that is just not interesting to do.
In order to make storage and exchange of high volume data more manageable, one could also create aggregates of an LDES.
This is for example something that has been done in a [demonstrator of Windels et al. on managing timeseries within Solid](https://biblio.ugent.be/publication/01HFRR194TM7B2N4D5RNJ8R8MJ).

These techniques are common to data processing in general deal with a large volume of data: you keep the recent raw data that is valuable at that time, and you aggregate what you want to preserve for a longer time.
LDES supports those techniques and is thus certainly not less scalable in volume than any other technology supporting these techniques.

## Part 2: Velocity

How fast can an LDES be updated?
In our search tree design, we use HTTP requests and responses.
The “unfinished” pages---the ones in which we did not indicate to the cache that they are immutable---can be updated with links to new pages, or with new members.
Therefore the standard mechanism to retrieve new members as they get published is through polling.
Each time a response is received, the client will calculate the time to re-fetch the page.
This can be fully decided by the client: if the client can live with a latency of max 120 seconds, it can decide to only poll every 120 seconds (or a bit less to leave time for its own processing).
However, a client is also going to respect the `max-age` and `age` response headers, making sure redundant HTTP requests are being done to refetch the page.
Also conditional caching through the `etag` response and `if-none-match` request headers will make sure no bytes are lost

In order to answer the question, we thus must make a distinction between: how much updates does the LDES itself have per second, the maximum acceptable latency (MAL) for an individual member, and the throughput of the client.
It is certain that the amount of updates per second, should not be more than the maximum throughput possible on the client.
When testing the [LDES client in Javascript](https://github.com/rdf-connect/ldes-client) with LDESs such as the one for [the European railway infrastructure](https://era.ilabt.imec.be/rinf/ldes), we notice a throughput of ~6k members/second (or 112.290 quads/second), providing an upper limit on the amount of members per second one LDES search tree can foresee.

When faster data and lower latencies are necessary, we can also consider adding a publisher subscribe channel using Websockets or Server-Sent Events in the description of the LDES view.
However, so far,  we have not yet encountered a use case that requires that kind of velocity for data published on the Web.

## Part 3: Gaining more subscribers

Servers publishing a search tree don’t need any dynamic server functionality. Every HTTP request can be served right from the HTTP cache.
We call this a [_materializable_ interface](https://treecg.github.io/paper-materializable-interfaces/).
This way, CDNs (Content Delivery Networks) and archives can be used as-is, bringing the data as efficiently as possible to a large amount of re-users.

In Part 1, we talked about compression, and in part 3 here, we mention that with an increasing amount of subscribers, our caching infrastructure will be the biggest driver behind our scalability.
Then why don’t we just publish one big data dump then?
This is because we need to find a pareto optimal efficiency for consumers that indeed start from no history at all and want to take a copy of the full history, and consumers that already have the history and only want to synchronize with the latest updates.
Each consumer can synchronize on their own pace. They can decide to not run their synchronization process for a month, and then synchronize again, or they can decide to keep their copy in sync minimizing their latency.
Hence the reason for the search tree: while it may be less efficient to copy the full history at once, the server can keep consumers that want to synchronize at their own tempo happy.
More advanced techniques could this way involve rebalancing of the history: i.e., for data from 2 years ago, a server could rebalance into bigger pages, making compression more efficient.

## Part 4: Integrating more datasets

When data engineers today are faced with a task to code against a specific dataset, they are going to code against those specific HTTP messages.
The application will then be _interoperable_ with only 1 dataset.
Scaling up the amount of datasets a consumer can use on the same budget, means researching how we can lower the cost of development to integrate more datasets.

Linked Data allows data publishers to re-use terms across datasets.
Application developers are then encouraged to code against one or more _application profiles_ (such as SHACL shapes).
I.e., a developer does not per se need to understand the full data, if it recognizes patterns of interest, it can perform the task it was made for.
Today however, an automated _discovery mechanism_ for datasets is still lacking, although dataspaces and data portals are promising to solve that.
I find this something very promising to look forward to: once we know how to select an RDF dataset from the vast amount of linked datasets available on the Web, we will be able to properly scale up the amount of datasets we can code against at once.
