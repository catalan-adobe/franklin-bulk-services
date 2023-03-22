adobe.com Sections Mapping CLI
===

### Install

```
npm install -g acom-sections-mapping
```

### Usage

```
acom-sections-mapping <command>

Commands:
  acom-sections-mapping prepare  Generate sections data for given list of URLs (json + screenshots)
  acom-sections-mapping serve    Serve sections data via HTTP

Options:
      --version  Show version number                                                                                                                                                                                                     [boolean]
  -h             Show help                                                                                                                                                                                                               [boolean]
```


### Local Development

#### Install

```
npm install
```

#### Run

```
node index.js
```
### TODOs

* [ ] Add unit tests
* [ ] Add reporting (csv, xlsx?) to, for example help re-run operations on failed URLs
* [ ] Accept non Franklin URLs (user would then pass org, repo, branch as parameters)
