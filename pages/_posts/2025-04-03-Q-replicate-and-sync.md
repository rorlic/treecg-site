---
title: LDES step-by-step guide 17/18 - LDES client
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
Let us assume that you have found a LDES about things that interest you. Suppose you want to retrieve the complete data set in order to analyze the history of these things. Maybe you even want to predict future values based on the historical knowledge. If so, you probably want to retrieve the future versions as well in order to compare your predicted values. But how do you do this?

### Retrieving the history (replication)

First you need to retrieve the LDES content and extract the view URL. After that, you retrieve the view content and extract the members as well as the next node URL(s) from the relation(s). For each node found, you retrieve the node content to extract the additional members and any contained relations, which again give you more node URLs. You need to repeat this until you have retrieved all the node URLs. Now you have successfully _replicated_ the data set.

How exactly should we extract the view URL, the node URLs and the members themselves? 

#### View URL extraction
We will start with extracting the view URL. Please remember that any linked data model is just a collection of triples. When we use a HTTP request to retrieve a LDES by an URL, we may get redirected to some other URL, but eventually we get back a HTTP response containing a linked data model describing our LDES. The response contains triples with predicate `tree:view` for which the object is the view URL. But, because we may get redirected the LDES **URL** does not necessarily match the LDES **URI**. So, we first need to get the event stream URI. This is pretty easy: we know that the LDES is a `ldes:EventStream`. We simply lookup the (unique!) triple with predicate `rdfs:type` and object `ldes:EventStream` which gives us a subject and then we lookup the triples matching this subject and predicate `tree:view`. The object(s) from these triples are the view URL(s).

We can write those two queries down (using variables names starting with `?` to indicate things we do not know) and add some keywords to get the following:
```
prefix ldes: <https://w3id.org/ldes#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select ?v 
where {
    ?s rdfs:type ldes:EventStream .
    ?s tree:view ?v .
}
```

Congratulations! You have written your first [SPARQL](https://en.wikipedia.org/wiki/SPARQL) query that gives us one or more view URLs.

There are other ways to lookup things in RDF. If you need to do this from within a software system, you need to use one of the [Software Development Kits](https://en.wikipedia.org/wiki/Software_development_kit) (SDKs) for RDF. These exist for many programming languages such as [Java](https://jena.apache.org/), [.NET](https://dotnetrdf.org/), [JavaScript](https://rdf.js.org/N3.js/), etc.

Once we have the view URL we again do a HTTP request and (after a possible redirect) we receive the HTTP response containing the (starting) node's relations and the contained members.

#### Node URL extraction
To get the links to the related nodes, we need to lookup the subject that is a `tree:Node`, get the (anonymous) objects of type `tree:Relation` (or a sub-class thereof) using the node's `tree:relation` predicate, and finally take the relation's `tree:node` predicate to get the URL in the object position.

Using SPARQL we can express this as follows:
```
prefix ldes: <https://w3id.org/ldes#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select ?n 
where {
    ?s rdfs:type tree:Node .
    ?s tree:relation ?r .
    ?r tree:node ?n .
}
```
> **Note** that we do not really care about the relation type here as we need to get all the nodes and therefore follow all the links we find.

In the current TREE specification it is not allowed anymore to have more than one incoming link for a node. This means that you do not need to keep a list of visited nodes as each node can be reached only once. However, for backwards compatibility and to detect (what are now) faulty TREE structures (such as circular links), it is recommended to keep track of the URLs that we already visited and only request the new ones.

#### Member extraction
We already know how to retrieve all the nodes containing members, but we still need to extract the triples per members from the triples collection. Getting the URIs of the members is easy, but collecting all the triples that belong to each member is non trivial. The TREE specification describes an [algorithm to extract members](https://treecg.github.io/specification/#member-extraction-algorithm). The algorithm in essence works this way:
* we take all the quads (or triples) with predicate `tree:member` as the object from that triple gives us the focus node URI of a member, that is, the member identifier
* for each member identifier we collect all the quads that are part of the member as follows:
    * take all the quads with the member identifier in the subject position and recursively collect all the quads for each blank node found in the object position (essentially implementing the [CBD](https://www.w3.org/submissions/CBD/) mechanism)
    * add all the quads within the named graph with the member identifier as its name
    * if the above steps did not yield any quads, dereference the member identifier (request it using the HTTP protocol) and take the quads from the response

> **Note** that the [member extraction algorithm](https://treecg.github.io/specification/#member-extraction-algorithm) also uses the `tree:shape` to limit or to include quads to the member, but this behavior will be removed in the future.

Here is how to get the member URIs:
```
prefix ldes: <https://w3id.org/ldes#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

select ?m 
where {
    ?s rdfs:type ldes:EventStream .
    ?s tree:member ?m .
}
```

### Retrieving the future (synchronization)
Usually, an API that allows you to get notified of changes will provide some way of subscribing for these notifications. This requires management of these notifications on the server side, possibly including retries if the client side cannot be notified. On the client side we need to unsubscribe in order to stop receiving notifications. In addition, the server and client side need to have a common understanding what the notification means and how to interpret what (part of the) data has changed. As you can imagine, this is pretty complex all things considered.

Again, LDES takes a different approach: there are no subscriptions and no notifications, but instead the server side can indicate to the client side which node is "full" and which node may contain additional members in the future. Please remember that a LDES is a collection of immutable members. In other words, the members (which are versions of a state object) themselves will never change. If a state object changes, a new version object is added to the LDES as a member.

We have seen that a LDES is retrieved using nodes, which contain a number of members. So, how many members does a node contain? Well, that depends on the LDES server implementation, but typically there will be a configured maximum member count. When a node contains that many members, it is marked "full" and linked to a new node that is created to contain additional members. In other words, once the node contains the configured maximum number of members, that node will not change anymore, that is, no more members will be added to it. Can members be removed? Yes, they can! Due to retention, some members in a node may be removed. Is that not a problem? No, not at all! Any data client that has already processed this node, will not process it again as it will never receive any additional member. Any data client that processes the node later, will not see the removed members, which is indeed what you would expect.

When the node reaches its maximum capacity, it is marked _immutable_. This indicates to the data client that this node should never be re-requested again. But the opposite is also true: if a node is not marked _immutable_, it means that members may be added in the future and that the data client should periodically re-request the nodes in order to receive new members, that is, _synchronize_ with the LDES changes.

How does the server indicate that a node is immutable? For this, LDES relies on the [cache-control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) HTTP header. This header allows to specify the `immutable` directive, which indicated that the (HTTP) response will not be updated while it is "fresh". The "freshness" is determined by another directive: the `max-age`, which is a value (in seconds) specifying how long the response is valid after the response creation. It is typically used for cache servers that sit between a HTTP client and a HTTP server, to communicate how long to respond with the same response (caching) and when to re-request the response from the server.

To indicate that a node may receive members in the future, a LDES server returns the `cache-control` header with a `max-age` set to a _polling_ interval, which is the (minimum) time interval for re-requesting a node. A data client may wait longer if desired, but re-requesting it sooner will probably return the same result. If fact, to check if the HTTP response changed, the data client will first check the [etag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) header value. If the value is the same as in the previous HTTP response, then the content did not change and there is no need to re-extract anything. In fact, if a LDES server is behind a reverse proxy with caching capabilities, instead of requesting the content of a nodes (HTTP GET command) you can ask for only the response HTTP headers (HEAD command), which is a lot faster, and request the node content only if the `etag header` has changed.

Example header returned for a _mutable_ node: `Cache-Control: max-age=60`

> **Note** that this node can be re-requested every minute to receive new members.

To indicate that a node will not receive any more members, a LDES server returns the `cache-control` header with the _immutable_ directive included and the (mandatory) max-age set to a large value (typically a week or a year). A data client should ignore the max-age value in this case and never re-request the node again.

Example header returned for a _immutable_ node: `Cache-Control: immutable, max-age=604800`

> **Note** that this node should not be re-requested (as it will never contain new members).

When a mutable node is re-requested and it contains new members, a data client should only consider those new members for further processing and ignore the previously received ones. Clearly, the data client needs to remember which members have already been encountered and only process the unprocessed ones. This brings up an interesting point: any number of nodes can contain the exact same member. Which is why a data client must keep a list of _all_ the members already encountered.

> **Note** that it should be possible to retrieve a one-dimensional forward-linked list of nodes without keeping a list of visited members and nodes, because each node URL and each member can only appear once in this view. However, retrieving such a view will be slower as you can not benefit from retrieving the nodes in a parallel way.

### LDES Client
Now, what happens to the extracted members? Some data clients may want the receive the history of things, while other data clients may simply want the (latest) state of things. Some data clients may even want to alter the data in another model more appropriate for their use case. Some may want to feed it into a custom system while other may simply want to store the data in a database.

No matter which use case a data client has, their data pipeline starts with replicating and (optionally) synchronizing a LDES, extract the members and, if no history is needed, unwrap a version object back to its state object, also called _materialization_. Because the starting point of a LDES pipeline is always the same, it makes sense to have a reuseable _LDES client_ which implements this functionality.

As shown above, a LDES client must implement the replication logic keeping a list of visited nodes. It must keep a list of processed members and handle polling mutable nodes to receive new members. Finally, it must extract members from a node, optionally materialize members, and pass them further downstream in the data pipeline. Finally, a LDES client should come in the form of a SDK, which allows embedding in existing data pipeline systems, or alternatively, as a standalone executable pushing members using HTTP or another standard protocol towards these systems.

These data pipeline systems can then store the data members in any database type, be it a traditional one, a document or perhaps a graph database. Could we store the data members again as a LDES? We sure could! But why would we want that? Well, there may be different reasons to do this. Maybe the data publisher only offers a one-dimensional, forward-linked view and you want to offer your data clients alternative [views](#partitioning-types) which allow them to retrieve the data set much faster or retrieve only a subset of the data set. Maybe the data publisher has a short [retention policy](#retention-policies) on its view(s) and you want to offer a longer history to your data clients. Or maybe you want to combine different event streams into a new LDES offering a richer data model.

In all these cases, you should host your own LDES server and create a data pipeline which starts with a LDES client to replicate and synchronize the original LDES, transform the members in the way you see fit and push the members to your LDES server, which is setup to (re-)partition the LDES or offer the LDES with different models or retention policies. If your LDES server implementation cannot ingest version objects, you need to ensure the data pipeline does materialization and the LDES server creates the versions automatically. In fact, in this scenario you are a _data broker_, which is an individual or department who offers combined or otherwise altered data.

Summarized, **a LDES client is used to replicate and synchronize a data set**, which allows you to easily retrieve the history and the latest state of the non-version objects.
