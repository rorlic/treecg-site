# The TREE website

Purpose:
 * General overview and goal of TREE
 * A primer on how to get started
 * Links to the spec
 * Automatically update data about the team and our publications about TREE
 * Hosting demos

Future:
 * A data catalog
 * An LDN inbox to notify us about any new


## Building the website

We first prefetch data using the `bin/fetchData.js` script, we then build the age using Jekyll.

First install all dependencies:
```bash
# Node dependencies
npm install
# Ruby dependencies
bundle install
```

Then fetch the data and build the website

```bash
./bin/fetchData.js
jekyll build
```

Use `jekyll serve` when you’re developing, run `bin/fetchData.js` when someone added new data somewhere.
