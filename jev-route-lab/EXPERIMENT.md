# Jev Route Lab: live event interpretation + time-expanded A*

## Scope

Independent A-to-B routing research. No OPAI files, services, credentials or deployments were modified in this experiment. The Python routing source and tests are delivered as the accompanying conversation ZIP; this repository record does not claim that a web UI or vehicle controller has been deployed.

## Actual live inference

- Request commit: `5373d7ab6e19eb5c17f9fc6368343a2efc5ae355`
- Request file: `.jev/request.json`
- Run: https://github.com/glasses666/gravity-lab/actions/runs/35303921964
- Job: `105472100229`
- HTTP: 200
- Resolved model: `jev-1.13.0`
- Questions: 12 independent Choice questions in one HTTP request
- curl total: 0.482343 seconds
- shell request wall time: 493 milliseconds
- Input tokens: 4214
- Output tokens: 531
- Entire workflow: created at 03:37:49 UTC, completed at 03:38:00 UTC (about 11 seconds). API time is not total automation latency and not pure inference time.

## Observed outputs

| ID | Synthetic notice | Actual choice | Confidence |
|---|---|---|---:|
| e01 | Accident blocks all lanes in this direction | block | 1.0 |
| e02 | Accident only across a separating barrier in opposite direction | ignore | 1.0 |
| e03 | Disabled vehicle fully on shoulder, no remaining impact | ignore | 1.0 |
| e04 | One of two lanes under construction, queue, still passable | delay | 1.0 |
| e05 | Fallen tree blocks all lawful lanes | block | 1.0 |
| e06 | Flood depth and passability unknown | review | 1.0 |
| e07 | Construction completed, barriers removed, closure revoked | ignore | 1.0 |
| e08 | School crossing with intermittent yielding | delay | 1.0 |
| e09 | Hospital-permit-only road; this private car lacks permit | block | 0.9 |
| e10 | Failed lights, officer alternates traffic; not fully closed | delay | 1.0 |
| e11 | Cargo debris completely removed; no residual restrictions | ignore | 1.0 |
| e12 | Equally credible simultaneous reports conflict | review | 1.0 |

For e09, the actual distribution was block=0.93, ignore=0.05, review=0.02, delay=0.0. Other distributions placed 1.0 on the listed choice and 0.0 on the others.

All 12 labels matched the authored expected labels. This is one small synthetic smoke test, not a general accuracy or safety estimate. Expected labels were not included in the model request. Confidence=1.0 on review does not mean a road is safe; it means the chosen interpretation is to require review.

## Routing implementation and local replay

A standard-library Python 3.10+ prototype consumes the recorded real Jev response, compiles event effects and computes earliest arrival over `(node, incoming directed edge, integer simulated time)` states.

- 10 nodes and 17 directed edges.
- Independent physical constraints: closures, height, weight, permits and toll preferences.
- Movement-specific traffic-light phases and turn restrictions.
- Explicit one-second waiting at nodes where the model permits waiting.
- Event intervals and conservative whole-edge closure-overlap checks.
- Unknown or malformed semantic outputs are not treated as clear roads.
- Exact travel time comes from synthetic world parameters, not AI probabilities.
- Heuristic: reverse Dijkstra on unconstrained free-flow durations, never an AI estimate.
- Objective: earliest arrival within a finite integer-time horizon, not globally optimal real-world driving.

### Eight replay cases

All values below are simulated seconds, not measured road journeys. Default vehicle: height 1.9 m, weight 2 t, no hospital permit. A north underpass is 1.8 m high and a cross-link bridge has a 1.5 t limit.

| Case | Chosen route | Trip seconds | Wait seconds |
|---|---|---:|---:|
| Complex world, default car | A-R1-R2-B | 450 | 0 |
| Car height 1.6 m | A-N1-N2-B | 340 | 0 |
| Low car, departure delayed 35 seconds | A-N1-N2-B | 395 | 55 |
| Main-road accident known to clear at t=100 | A-C-D-B | 220 | 40 |
| Flood passage objectively verified clear | A-S1-S2-B | 270 | 15 |
| Flood clear, departure delayed 35 seconds | A-S1-S2-B | 255 | 0 |
| Replan from C after learning events at t=60 | C-R1-R2-B | 430 remaining | 0 |
| Ring road also hard-closed | No feasible route within horizon | n/a | n/a |

The free-flow information-ablation baseline chooses A-C-D-B in 180 seconds, but that route enters the closed accident edge. This is not a fair claim that Jev outperforms an informed A*. The appropriate reference is deterministic search with the same correct constraints: all eight cases matched the authored ground-truth-event reference and the same-state-space zero-heuristic search.

The eight cases replay one actual model response while changing deterministic world parameters. They are not eight independent live model calls.

## Regression checks

Locally executed: 30 unittest tests passed. One test additionally checks 300 seeded graph/departure combinations against an independent time-ordered reachability dynamic program. Coverage includes signal phases, no-wait nodes, closure beginning mid-traversal, closure expiry, non-FIFO queue example, one-way and prohibited turns, height/weight/permit vetoes, stale snapshot rejection, missing answers, bad probabilities, unknown delay, search-budget reporting and no-route reporting.

Important negative control: a deliberately corrupted high-confidence ignore decision for a text-only closure can still produce a route through that closure. A wrapper cannot enforce facts it does not know. Independent fixture-ground-truth validation catches this in the test, but a real system would need trustworthy perception/structured authoritative restrictions. This prototype is simulation-only.

## Design conclusion

Jev contributes semantic event interpretation, not faster graph arithmetic. Fully structured objective world data does not require a model. Signals must be evaluated at arrival time, not assigned an arbitrary fixed red-light penalty. Event changes should invalidate matching decisions; clock ticks alone do not require new model calls. GitHub Actions is an evaluation harness, not a real-time control loop.

Sources consulted: TypeSafe official skill and live HTTP API, Jev 1.13 jaggedness and function-calling cookbook; SUMO documentation on GLOSA, traffic-light control and routing. A future interactive city can use a separate persistent backend plus SUMO/TraCI. That integration and a 3D frontend are not implemented in this delivery.
