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

We first prefetch data using the `bin/fetchData.js` script, we then build the page using Jekyll.



## Installation
This setup requires the installation of:
- ruby
- bundler
- jekyll
- npm
  
To compile and watch the website:

(note that this does not watch changes in the config file or any of the rdf sources)
```bash
# Start the website in watch mode
npm run watch

# This installs the dependencies, 
# retrieves the RDF data
# and starts the site on localhost:4000.
```

To build the website:
```bash
# Build the website
npm run build

# This installs the dependencies, 
# retrieves the RDF data
# and generates the site in the _site folder.
```

On new data being added, run the respective command again.
