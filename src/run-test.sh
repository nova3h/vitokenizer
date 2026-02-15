#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source, run with bash command"
    return
fi

nodemon -L --watch *.mjs --watch *.js --watch data-out/words-manual.js --watch data-in/singles.js --exec "node --experimental-default-type=module process.mjs"
