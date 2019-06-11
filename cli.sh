#!/bin/bash
set -e

# User Input Variable
action=up
name=
type=micro

while [[ $# -gt 0 ]]; do
    case "$1" in
        -a)
            action="$2"
            shift
            ;;
        -n|-p)
            name="$2"
            shift
            ;;
        -t)
            type="$2"
            shift
            ;;
        -*)
            echo "Illegal option $1"
            ;;
    esac
    shift $(( $# > 0 ? 1 : 0 ))
done

case "${action}" in
    up)
        faas-cli build -f ${name}.yml
        faas-cli deploy -f ${name}.yml --label "com.openfaas.scale.zero=true"
        ;;
    create)
        faas-cli new ${name} --lang cc-server
        ;;
esac

