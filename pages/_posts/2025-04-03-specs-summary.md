---
title: LDES & TREE (high-level overview)
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
This post summarizes the Linked Data Event Streams ([LDES](https://semiceu.github.io/LinkedDataEventStreams/)) specification (20 February 2025) and the [TREE](https://treecg.github.io/specification/) specification ( 20 March 2025). It captures why we need LDES, what it is and how it works at a very high level.

If you are looking for a more detailed view, please see the LDES step-by-step guide series.

## Why?
There are two classic approaches to sharing a data set: export the data set in a standard file format or provide a query API. These approaches have conflicting pros and cons when looking from the data producer (publisher) and data consumers (client) sides.

*Linked Data Event Streams (LDES) does a much better job of balancing the (hosting and maintenance) cost between the publisher and the client.*

When offering a slow-changing data set using a *data set export*, it is the publisher who benefits mostly as the client must overcomes most of the difficulties:

|publisher|client|
|:-|-:|
|provides download for slow-changing data|must possibly download (very) large data set|
|decides on timing|has usually outdated view<br>(static snapshot in time)|
|exports full data set|needs to calculate differences|
|can export change set|needs to track versions to correctly apply change set|
|needs no subscription management|cannot receive change notifications|

On the other hand, when offering a fast-changing data set using a *query API*, the burden and cost is mostly on the publisher side:

|publisher|client|
|:-|-:|
|provides up-to-date view for fast-changing data|only has partial view|
|usually enforces rate limiting|decides on query timing|
|must manage subscriptions (if provided)|can receive notifications|
|must ensure notification reception (retries)|needs to subscribe and unsubscribe|
|must maintain multiple API versions|must keep up to date with recent API|
|must make API universally applicable<br>or use standard API|must handle unstable or backwards incompatible API|

## What?
*LDES* provides a data *sharing* API, which does not allow *querying*, but facilitates duplication of the historical, current and future data set states. It is based on linked data, which requires globally unique identifiers and property semantics, and the concept of an event stream, which is a continuous flow of events. In essence, *LDES is an event stream of immutable members*, which contain the full state changes (versions) of the data set items.

|publisher|client|
|:-|-:|
|can share slow-changing and<br>fast-changing data sets|can use the same mechanism<br>for different data sets|
|provides a basic partitioning|can download the full data set in pieces|
|provides a universal data sharing API|retrieves historical/current state (replication)|
|provides a simple change mechanism|retrieves future state (synchronization)|
|does not need a subscription mechanism|can use polling to check pages for changes<br>(no need for subscriptions)|
|can use caching (immutable pages)<br>to handle many clients|is not rate limited|
|does not need to maintain different API versions|does not need to keep up to date<br>with API changes|

## How?
LDES is based on *linked data*, which is a data model representation of structured data possibly linked with other data models contained in different data sets, and is described using *Resource Description Format* (RDF). In RDF, everything is modelled as a collection of *triples* (subject-predicate-object). A *named node* is a globally unique identifier represented by a *Universal Resource Identifier* (URI), usually based on HTTP. A *Universal Resource Locator* (URL) is a dereferenceable URI, which references its machine and/or human readable (context) information. A *blank node* is a locally unique identifier within a data model. A *subject* is a named or a blank node representing the identity of a (sub)model. A *predicate* is a URI representing the relation between the subject and the object, and is captured in a (controlled) vocabulary and/or ontology so it is unique and has unambiguous meaning. An *object* is a literal value (e.g. string, date, number, etc) or a URI, which is the reference to a subject. Linked data can be serialized using various formats, some allowing for quads in addition to triples. A *quad* (subject-predicate-object-graph) is a triple contained in a default (unnamed) or named graph. A *graph* is an arbitrary grouping of a collection of triples.

The LDES specification is based on the TREE specification. Both are living standards that are still evolving. A *tree:Collection* is a data set of items, has zero or more *tree:member* predicates referring to the data items and uses a *tree:shape* to capture a SHACL shape, which is used to describe and possibly validate the members. 

A *ldes:EventStream* is an append-only tree:Collection where the members are immutable versions of state objects. It has a predicate *ldes:versionOfPath*, which is a property path (usually *dct:versionOf*) of the member that allows to group members by state object. It also has a predicate *ldes:timestampPath*, which is a property path (usually *dct:created* or *prov:generatedAtTime*) of the member that allows to sort members within a state object grouping.

Data sets can grow to a size that is too large to return in a single request. Therefore, the TREE specification allows to partition a data set in parts and to retrieve it in pieces. A tree:Collection is split into tree:Nodes, each holding a limited number of members, and can contain one or more root (start) tree:Node from where the whole data set can be retrieved. A *tree:Node* is a node of the search tree of a tree:Collection and it is usually the target of the view predicate (tree:view) of the collection in the current node. A tree:Node has zero or more *tree:relation* predicates referring to a generic *tree:Relation* or a special derived class, which constraints the members that can be retrieved by following that relation. Every tree:Relation has a *tree:node* predicate containing the link to another tree:Node. The tree:Relation subclasses have implicit semantics describing the condition to compare (e.g. equal-to, greater-or-equal-to, has-prefix, geospatially-contains, etc.). In addition, tree:Relation subclasses also have a *tree:path* and a *tree:value* predicate to indicate the property path of a member and the literal value to find the member value respectively compare it against. The tree:Relation subclasses allow to create special partitions (e.g. time-based views, geo-spatial views, reference views, etc) that allow retrieving a subset of the data set and subscribing to changes of that subset.

Theoretically, a LDES can contain an ever growing, infinite number of members. LDES uses retention policies to control the size of the data set in order to keep the storage cost under control and to prevent a data client from having to download a huge history of data. A root node can have a predicate *ldes:retentionPolicy* that is a subclass of a ldes:RetentionPolicy. A *ldes:RetentionPolicy* subclass has implicit semantics describing which members are available in the view and which are not. A *ldes:PointInTimePolicy* has a predicate *ldes:PointInTime* holding a *xsd:dateTime* value, which defines the absolute date and time to compare to a property path (*ldes:timestampPath* by default) of the members and to remove any member with a lower value. A *ldes:DurationAgoPolicy* has a predicate *tree:value* holding a *xsd:duration* value, which defines a dynamic date and time (i.e. current date and time minus the duration value) to compare against the member property. A *ldes:LatestVersionSubset* has a predicate *ldes:amount* holding a positive integer value, which defines the number of latest versions to keep per state object grouping. A ldes:LatestVersionSubset with ldes:amount set to one (the default) represents the current state of the source system, without the history.

Linked data uses a DCAT catalog in a (local or global) registry to allow discovering data sets. LDES is compatible with DCAT and maps a ldes:EventStream to a *dcat:Dataset* and a root node to a *dcat:DataService*. A *dcat:Catalog* is a dcat:Dataset of metadata records describing dcat:Resources such as a dcat:Dataset and a dcat:DataService. A *dcat:Resource* that is compatible with the TREE (and LDES) specification must have a *dct:conformsTo* set to *tree:specification* (respectively *ldes:specification*). A dcat:Dataset has a predicate *dcat:distribution* of type dcat:Distribution. A *dcat:Distribution* has a predicate *dcat:accessURL* referring to a root node and a *dcat:accessService* referring to a dcat:DataService with its *dcat:endpointURL* referring to the same root node.

Because a tree:Node in LDES can hold a limited number of (immutable) members, at some point in time it will not change anymore, expect due to applying retention policies, which removes members. Once a tree:Node reaches the maximum capacity it is marked as *immutable* by returning a HTTP *Cache-Control header* that contains the *immutable directive*, which indicates that is should never again be re-requested.  A tree:Node that does not contain the maximum member count returns a HTTP Cache-Control header that instead contains the *max-age directive*, which communicates the suggested polling interval time for re-requesting the tree:Node for changes (new members).
 
A data client using LDES must implement the replication and synchronization logic to retrieve all nodes by following the relation links, and extract the members from each node. For all but a simple linear (forward-linking list) view, this logic must keep a list of processed members[^1] to prevent re-processing them. Basically, this logic is a producer of a stream of data items and is therefore the first component in a data pipeline. It follows a LDES data set and pushes the members downstream for storage or further processing.

Ready-to-use reference implementations of this universal client logic (LDES client) and the LDES data sharing API (LDES server) are available as open-source components, both in source code and executable (docker image) format. In addition, a lot of theoretical and practical documentation is available online to get started with using LDES for data interoperability.
 
[^1]: Previously, the TREE specification allowed multiple nodes linking to the same node and even circular references. Therefore a client had to keep a list of processed members as well. In the current version, a client does not have to keep a list of processed nodes as only one incoming link is allowed, but for backwards compatibility and detecting faulty TREEs, this is still recommended.

## Further Reading

Please have a look at the LDES step-by-step guide if you want to learn more:
* [Why do we need LDES?]({% post_url 2025-04-01-A-why-do-we-need-ldes %})
* [What is LDES?]({% post_url 2025-04-01-B-what-is-ldes %}) 
* [Linked Data Basics]({% post_url 2025-04-01-C-linked-data-basics %})
* [TREE specification basics]({% post_url 2025-04-01-D-tree-specs %}) 
* [LDES specification basics]({% post_url 2025-04-01-E-ldes-specs %}) 
* [TREE partitioning basics]({% post_url 2025-04-01-F-tree-partitioning %})
* [TREE partitioning types]({% post_url 2025-04-01-G-tree-partitioning-types %}) 
* [TREE time-based view]({% post_url 2025-04-01-H-time-based-view %})
* [TREE geospatial view]({% post_url 2025-04-01-I-geospatial-view %})
* [TREE reference-based view]({% post_url 2025-04-01-J-reference-based-view %}) 
* [LDES retention policies]({% post_url 2025-04-01-K-retention-policies %})
* [LDES point-in-time retention]({% post_url 2025-04-01-L-point-in-time-retention %}) 
* [LDES time-based (sliding time window) retention]({% post_url 2025-04-01-M-sliding-time-window %})
* [LDES version-based retention]({% post_url 2025-04-01-N-version-based-retention %}) 
* [LDES latest state retention]({% post_url 2025-04-01-O-latest-state-retention %})
* [LDES availability & discovery]({% post_url 2025-04-01-P-metadata %}) 
* [LDES client]({% post_url 2025-04-01-Q-replicate-and-sync %}) 
* [Now what?]({% post_url 2025-04-01-R-now-what %})

The recommended way is to read the above topics in order, but feel free to skip the topics that you are already familiar with.