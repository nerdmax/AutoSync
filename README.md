# AutoSync

[![NPM Version][npm-image]][npm-url]
[![License Stats][npm-license]][npm-url]
[![Github stars][github-stars]][github-url]
[![Github issues][github-issues]][github-issues-url]
<!-- [![Build Status][travis-image]][travis-url] -->

> It can proxy your exesing website to gain the auto bundling, minifying, reloading features. Besides, it can auto upload your changed files to another file system or a remote server via FTP!!!

## Installation

Windows:

<https://github.com/nerdmax/AutoSync/releases>

OS X & Linux:

We will support them later

## Usage example

![](header.png)

_For more examples and usage, please refer to the [Wiki][wiki]._

## Development setup

```sh
git clone git@github.com:nerdmax/AutoSync.git
cd AutoSync
yarn install
yarn run dev
```

## Packaging

```sh
yarn run package
```

## Release History

<!-- * 0.2.1
    * CHANGE: Update docs (module code remains unchanged)
* 0.2.0
    * CHANGE: Remove `setDefaultXYZ()`
    * ADD: Add `init()`
* 0.1.1
    * FIX: Crash when calling `baz()` (Thanks @GenerousContributorName!)
* 0.1.0
    * The first proper release
    * CHANGE: Rename `foo()` to `bar()` -->
* 0.0.1
    * 8 preset projects settings
    * Bundle & Uglify js files
    * Bundle, autoPrfix & Minify CSS files
    * Autosync files on local file systems
    * Autosync files on the remote server via FTP
    * Hold certain files and publish them to the server via on go

## Meta

Max LIU – [My personal website](#) – mrliucan@foxmail.com


## Contributing

1. Fork it (<https://github.com/nerdmax/AutoSync/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->
[npm-image]: https://img.shields.io/npm/v/AutoSync.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/AutoSync
[npm-license]: https://img.shields.io/npm/l/AutoSync.svg
[github-url]: https://github.com/nerdmax/AutoSync
[github-issues]: https://img.shields.io/github/issues/nerdmax/AutoSync.svg
[github-issues-url]: https://github.com/nerdmax/AutoSync/issues
[github-stars]: https://img.shields.io/github/stars/nerdmax/AutoSync.svg
[travis-image]: https://img.shields.io/travis/dbader/node-AutoSync/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-AutoSync
[npm-io]: https://nodei.co/npm/AutoSync.png?downloads=true&downloadRank=true&stars=true
[wiki]: https://github.com/nerdmax/AutoSync/wiki
