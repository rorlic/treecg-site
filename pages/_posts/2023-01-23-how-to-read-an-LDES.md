---
title: How to read a Linked Data Event Stream
layout: post
authors:
- Wout Slabbinck
tags:
- LDES
---
A [Linked Data Event Stream (LDES)](https://w3id.org/ldes/specification) is a collection of immutable events, representing changes that occur in a certain dataset/data collection.
An event, also referred to as a member, is represented as a group of triples within the [Representation Description Framework (RDF)](https://www.w3.org/TR/rdf11-concepts/).
Each one has a URI as a subject, which makes sure it is unique.

The publishing of an LDES allows data consumers to always stay in sync with a data source. 
You can watch the video fragment below to learn more about the ecosystem that the event stream provides.
<div class="iframe-container">
  <iframe src="https://player.vimeo.com/video/523711762?h=f9ed9c8ae2" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
</div>

The specification describes the structure of the LDES itself. With that information, you, as a human, can read the event stream. However, what if you do not want to read it yourself, but instead want one of your applications to ingest the events in the Event Stream?
The question is then: "How does an application consume events of a Linked Data Event Stream". 

In the following sections of this blog, I will first elaborate on how to read one with some simple example code. 
Next, I will provide some tools that are available to ingest any kind of LDES.

All code examples and toolings are written in Javascript/Typescript, more specifically [Node.js](https://nodejs.org/en/).

## Custom code

In this section, I'll provide some code that can read an LDES.

### Local

Below is a simple LDES which contains two members. Each member has a title, a description and the time at its creation.
In the triple `example:EventStream a ldes:Evenstream .`, we see that the URI `http://www.example.org/EventStream`  is of type `ldes:EventStream`.

From this **URI**, the members can be reached due to the `tree:member` property.

```turtle
@prefix example: <http://www.example.org/>.
@prefix ldes: <http://w3id.org/ldes#>.
@prefix tree: <https://w3id.org/tree#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

example:EventStream a ldes:Evenstream;
	tree:member example:member1, example:member2.

example:member1 dct:title "The first member";
	dct:description "The first member of the Linked Data Event Stream";
	dct:created "2023-01-02T10:00:00Z"^^xsd:dateTime.
	
example:member2 dct:title "The second member";
	dct:description "The second member of the Linked Data Event Stream";
	dct:created "2023-01-02T11:00:00Z"^^xsd:dateTime.
```

Let's extract the events from this LDES now in code.
First, download the following npm packages, which allow you to load this example LDES in memory as a [N3 Store](https://github.com/rdfjs/N3.js/).

```sh
# Some packages to install
npm i rdf-store-stream rdf-parse streamify-string
```

Using the above libraries, the following piece of code parses the LDES into a Store.

```javascript
// imports to read the LDES in an N3 Store
const { storeStream } = require("rdf-store-stream");
const rdfParser = require("rdf-parse").default;
const streamifyString = require('streamify-string');

// the LDES example as a string
const ldesText = `@prefix example: <http://www.example.org/>.
@prefix ldes: <http://w3id.org/ldes#>.
@prefix tree: <https://w3id.org/tree#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.

example:EventStream a ldes:Evenstream;
	tree:member example:member1, example:member2.

example:member1 dct:title "The first member";
	dct:description "The first member of the Linked Data Event Stream";
	dct:created "2023-01-02T10:00:00Z"^^xsd:dateTime.
	
example:member2 dct:title "The second member";
	dct:description "The second member of the Linked Data Event Stream";
	dct:created "2023-01-02T11:00:00Z"^^xsd:dateTime.`;

// parse the LDES RDF into an N3 Store 
const textStream = streamifyString(ldesText);
const quadStream = rdfParser.parse(textStream, { contentType: 'text/turtle' });
const ldesStore = await storeStream(quadStream);
```

Okay great! Now let us read the members of the LDES.

When the LDES URI is not known, we can query the RDF graph to look for the `ldes:EventStream` class.
```javascript
const LDESSubjects = ldesStore.getSubjects("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://w3id.org/ldes#EventStream");
```

However, we know the URI already, so we can use that to extract all the metadata of the LDES itself. 

```javascript
// extract the LDES metadata
const metadataQuads = ldesStore.getQuads("http://www.example.org/EventStream");

for (const quad of metadataQuads) {
  console.log(quad);
}

// extract the members of the LDES
const memberSubjects = ldesStore.getObjects("http://www.example.org/EventStream", "https://w3id.org/tree#member")
for (const membersubject of memberSubjects) {
  const memberQuads = ldesStore.getQuads(membersubject);
  console.log(membersubject.value);
  console.log(memberQuads)
}
```

### Online

In this part, we are going to work with an LDES which is hosted on the web. 
With this part, I want to show that the above custom code to retrieve all members in the LDES will work as long as it is **valid RDF** and adheres to the structure of an LDES and that it **does not matter** where it is hosted.

Let's continue with our example.

<!-- , to not make it more complex than it has to be. -->

This means the first thing that has to be done is to host this LDES on an HTTP server.

**Install an HTTP server**

```sh
npm i http-server
```

**Set up the HTTP server**

To set up the server, execute the following following command:

```sh
npx http-server
```

The above command starts an HTTP server and hosts all the files from the directory where the command has been run at URL [`http://localhost:8080/`](http://localhost:8080/).

Saving the example LDES as `example-LDES.ttl` and storing it in that directory results in our own hosted LDES at URL `http://localhost:8080/example-LDES.ttl`.



```javascript
// send an HTTP fetch request to the hosted example LDES URL
const response = await fetch("http://localhost:8080/example-LDES.ttl")

// convert its body to string
const ldesText = await response.text()

// parse the LDES RDF into an N3 Store 
const textStream = streamifyString(ldesText);
const quadStream = rdfParser.parse(textStream, { contentType: 'text/turtle' });
const ldesStore = await storeStream(quadStream);
```

And at this point, we can interact with the LDES in the same way that was explained in the first part.

### Limitations

When the LDES is hosted as one page, the custom code will work fine to consume all the events in the event stream.
However, when the LDES is fragmented over multiple pages (using TREE hypermedia), the simple approach is not sufficient anymore.

I could explain how to extract a `tree:view` from the LDES and how to dereference the relations to retrieve all the members.
Though, I would not want to reinvent the wheel as there are already libraries that offer this kind of functionality: the **[LDES client](https://github.com/treecg/event-stream-client)**.

## LDES client

The LDES client is a prototype (developed by Brecht Van de Vyvere) and is used to retrieve all the members of an LDES by passing an URL.
This library parses the metadata of the LDES and (when present) dereferences all the relations of the view. Thus it abstracts away the technicalities of the LDES structure (and the TREE hypermedia) so that end users can focus on consuming the members in a streaming way.

Let's use it!
First, we have to install the package [@treecg/actor-init-ldes-client](https://github.com/treecg/event-stream-client)

```ttl
npm i @treecg/actor-init-ldes-client
```

After installation, we can use the code below to retrieve the members of an LDES. 
The LDES client only deals with LDESs on the web. So for simplicity's sake, I re-used the LDES we hosted ourselves.

We start by creating an engine. Then we invoke the `createReadStream` function with an **url** and several options. Here we ask the engine to disable synchronization and as a representation, we want Quads, which actually will give us members following the [`Member`](https://github.com/TREEcg/types/blob/main/lib/Member.ts) Interface.
Disabling synchronization means that once all relations are followed and all members are read, the engine is done and closes. When enabled, the engine acts a service and would (depending on the `pollingInterval`) fetch certain pages to look for new members in the LDES.

It is important to note that this will generate a **stream** of **members**. To consume any members of the LDES, we add a **listener** (`data`) so we can do something (in the example below just logging) with a member.

```javascript
const newEngine = require('@treecg/actor-init-ldes-client').newEngine;

let url = "http://localhost:8080/example-LDES.ttl"
const LDESClient = new newEngine();
const eventstream = LDESClient.createReadStream(url, {disableSynchronization: true, representation: "Quads"});

eventstream.on('data', (member) => {
  console.log(member.id.value);
  console.log(member.quads);
})

eventstream.on('metadata', (metadata) => {
  console.log(metadata)
})

eventstream.on('end', () => {
  console.log("No more data!");
```

Furthermore, we also log the metadata. In the custom code, we've received an array of Quads.
With the LDES client now, we see that it contains the url of the entry point of the engine and an object that contains `treeMetadata` with collections, nodes and relations.

This object is generated by the function `extractMetadata` [@treecg/tree-metadata-extraction](https://www.npmjs.com/package/@treecg/tree-metadata-extraction) package.

### TREE metadata extractor

The TREE metadata extractor does exactly what its name stands for: extracting TREE hypermedia (and by extension LDES) metadata from RDF data.

It is very simple to use, the only thing we have to pass to its only method, `extractMetadata`, is an array of [Quads](https://rdf.js.org/data-model-spec/#quad-interface).

The resulting output is an object which contains a Map of `collection`, `node` and `relation`.

Let's use this tool to read all the members from the non-fragmented example LDES.

```sh
npm i @treecg/tree-metadata-extraction
```



```javascript
const extractMetadata = require('@treecg/tree-metadata-extraction').extractMetadata;
const metadata =  await extractMetadata(ldesStore.getQuads());

const collection = metadata.collections.get("http://www.example.org/EventStream");
for (const member of collection.member) {
    const memberID = member['@id'];
    console.log(ldesStore.getQuads(memberID));
}
```

The extractor creates a Map for all collections, nodes and relations it can find in the input quads.
In our input, there are no relations and nodes and only one collection.
So we can get this `collection` out of the metadata to retrieve all the member identifiers.
And finally, we use the member identifiers to fetch the member triples from the RDF data.
