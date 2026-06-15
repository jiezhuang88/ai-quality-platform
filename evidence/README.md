# SDLC Evidence Manifests

Put per-change quality evidence manifests in this directory.

Use `examples/sdlc/evidence-manifest.sample.json` as the starting point.

Run:

```bash
python3 scripts/sdlc_gate.py --manifest evidence/<change>.json
```

The gate reads `policies/sdlc-quality-policy.json` and verifies that each SDLC stage has the evidence required by the change risk level.
