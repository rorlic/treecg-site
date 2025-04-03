---
title: LDES step-by-step guide 1/18 - Why do we need LDES?
layout: post
authors:
- Ranko Orlic
tags:
- LDES
---
When a _data owner_ (individual or department with authoritative data rights) wants to make a [data set](https://en.wikipedia.org/wiki/Data_set) available there are two options: a downloadable data file (data dump) or a querying API ([application programming interface](https://en.wikipedia.org/wiki/API)) to retrieve (a part of) the data set yourself.

A data dump is usually in a common format such as CSV ([comma-separated values](https://en.wikipedia.org/wiki/Comma-separated_values)) while an API is either custom made (proprietary) or some (ad-hoc) standard. The choice between a data dump and an API depends on many factors. Usually for data sets which do not change often a _data publisher_ (individual or department making the data available on behalf of the data owner) will use a data dump. For frequently changing data sets that would be impractical, therefore an API is used. Both options have their strengths but unfortunately also weaknesses.

By definition, a data dump does not allow a _data client_ (individual or department using the data) to be notified of changes in the data set. In addition, when only a small portion of the data set changes, the data client still needs to obtain the updated version of the whole data set and determine the changes on its end. Alternatively, the data publisher can provide smaller data dumps which only contain the data changes (delta data dumps). However, in this case the data client needs to keep track of its version of the data dump in order to apply the correct delta data dump, or risk missing data changes from a previous delta data dump. Note that the data publisher decides on the frequency of published (regular and delta) data dumps. Therefore, data clients typically have an outdated view on the data set at most points in time.

The other option is to offer a data set behind a proprietary or standard API. Let us look at both alternatives.

It is very challenging to create a proprietary API as it needs to be universally applicable to satisfy the needs of various data clients. Typically this will result in different versions of the API over time making it a nightmare for the data publisher to maintain them. Therefore, the data publisher will only maintain a few most recent API version(s), which forces a data client to keep its end up to date as much as possible.

Is using a standard API maybe a better option? Well, that clearly depends on the maturity and the stability of the standard API. More mature APIs will change less frequently allowing the data publisher to make less changes to its API implementation and keep maintenance cost lower. Unfortunately, while an API is maturing there is no guarantee that the API is stable and provides backwards compatibility, thus forcing the data publisher to re-implement the API. In all cases, the data publisher cannot afford its version(s) of the standard API to lag behind the latest version too much as some data clients may depend on, expect and require it. This forces all data clients over time to keep up to date, similar as for proprietary APIs.

Also note that a data client only retrieves a portion of the data set by querying the API. Therefore, the data client has a partial view on the data set. Actually, a data publisher will typically only allow a partial view on the data set to limit the load on its systems and to allow fair access for all its data clients.

Enter LDES. The main reason for the existence of LDES is **to better balance the (hosting and maintenance) cost between the publisher and the consumer** and to stay clear of the API maintenance hell.
