#!/usr/bin/env zsh
# This script runs all the checks that CI runs.
# It can be used as a pre-commit hook or run manually.
# Runs all checks regardless of failures to show all errors at once.

FAILED=0

OUTPUT=$(deno ci 2>&1 >/dev/null)
if [ $? -ne 0 ]; then
    echo "deno ci failed:"
    echo "$OUTPUT"
    echo ""
    FAILED=1
fi

OUTPUT=$(deno check 2>&1 >/dev/null)
if [ $? -ne 0 ]; then
    echo "deno check failed:"
    echo "$OUTPUT"
    echo ""
    FAILED=1
fi

OUTPUT=$(deno lint 2>&1 >/dev/null)
if [ $? -ne 0 ]; then
    echo "deno lint failed:"
    echo "$OUTPUT"
    echo ""
    FAILED=1
fi

OUTPUT=$(deno fmt --check 2>&1 >/dev/null)
if [ $? -ne 0 ]; then
    echo "deno fmt --check failed:"
    echo "$OUTPUT"
    echo ""
    FAILED=1
fi

OUTPUT=$(deno test --allow-run 2>&1 >/dev/null)
if [ $? -ne 0 ]; then
    echo "deno test --allow-run failed:"
    echo "$OUTPUT"
    echo ""
    FAILED=1
fi

exit $FAILED
