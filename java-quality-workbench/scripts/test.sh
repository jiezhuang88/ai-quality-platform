#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p out/test
javac -d out/test $(find src/main/java src/test/java -name "*.java")
java -cp out/test com.aicodequality.QualityWorkbenchTests
