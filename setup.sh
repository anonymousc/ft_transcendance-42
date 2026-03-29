#!/bin/bash

if [[ $# == 2 ]];then
    if [[ -z $(find . -name secrets1 -type d) ]];then
        SECRETS_EXAMPLE=$(find . -name secrets.example -type d)
        DIRECTORY=$(find . -name secrets.example -type d)/..
        cp -r  $SECRETS_EXAMPLE $DIRECTORY/secrets1

        # if [[  ]]
    else
        echo "already exist"
    fi
else
    echo "Usage $0 'google-client-id' 'google-secret-id'"
fi