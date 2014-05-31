# Opendirectory-size

This is a simple program to naively calculate the total size of an open
directory.

It attempts to not go higher than the given directory link.

## Installation
```
npm install -g node-opendirectory-size # sudo might be needed
```

## Usage
```
opendirectory-size http://distfiles.gentoo.org/releases/alpha/autobuilds/current-iso/
```

Example output:
    Stats:
    Files: 17
    Total size: 275.11 MB
    Size and number by content-type: 
    Type: text/html;charset=ISO-8859-1, Num: 9, Size: 0 bytes
    Type: application/octet-stream, Num: 3, Size: 111.24 MB
    Type: text/plain; charset=UTF-8, Num: 1, Size: 1.93 KB
    Type: application/x-bzip2, Num: 3, Size: 163.87 MB
    Type: text/plain, Num: 1, Size: 1.89 KB

