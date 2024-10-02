# biops

CLI tool for BI Operations

## Installation

```sh
$ bun install
$ set -gx PATH $PATH (bun pm bin)
$ bun link
$ biops --version
```

## Usage

```sh
$ biops --help
$ biops provider add
$ biops provider add
✔ Name of the provider my-redash
✔ Type of the provider redash
✔ URL of the provider redash.hogefuga.com
✔ Credential for the provider
Added provider my-redash of type redash
$ biops provider list
$ biops provider list
All providers:
* my-redash type: redash
$ biops query list
```
