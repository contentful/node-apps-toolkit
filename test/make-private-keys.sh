#!/usr/bin/env sh

pwd
mkdir -p keys

openssl req -x509 -newkey rsa:4096 -nodes -batch -noout -keyout keys/key.pem
openssl rsa -in keys/key.pem -pubout -outform DER -out keys/key.der.pub

echo 'keys/key.pem'
ls -la keys
echo 'POST keys/key.pem'