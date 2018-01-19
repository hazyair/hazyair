#!/bin/sh

LD_LIBC_CONFIG=/etc/ld.so.conf.d/libc.conf

BERKELEYDB=`pwd`/node_modules/berkeleydb/lib

if ! grep -q -E "/node_modules/berkeleydb/lib" $LD_LIBC_CONFIG; then
  printf "%s\n" "$BERKELEYDB" >> $CONFIG
fi

sudo ldconfig