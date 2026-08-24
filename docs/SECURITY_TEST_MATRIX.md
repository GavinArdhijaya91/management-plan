# Database Security Test Matrix

This matrix makes the pgTAP threat coverage reviewable without treating a
single test count or line-coverage percentage as proof of tenant security.

Legend:

- **Direct**: the actor performs or attempts the operation in a SQL contract.
- **Structural**: catalog assertions verify grants, RLS, function, or view
  configuration for every applicable object.
- **Derived**: the actor boundary is exercised through a parent visibility or
  canonical RPC contract.
- **Gap**: a scenario must be added before the related capability can be called
  release-ready.

## Actor boundary matrix

| Actor | Workspace/RBAC | Planning hierarchy | Financial data | Evidence/system | Primary contracts |
| --- | --- | --- | --- | --- | --- |
| Anonymous | Structural | Structural | Structural | Direct | `database_security_boundaries`, `portfolio_publication_contracts` |
| Outsider | Direct | Direct | Direct | Direct | `workspace_rbac_rls`, `database_adversarial_access`, `metric_reconciliation_contracts`, `business_review_finalization_contracts` |
| Suspended member | Direct | Direct | Direct | Derived | `workspace_rbac_rls`, `planning_visibility_permissions`, `workspace_chat_contracts` |
| Viewer | Direct | Direct read-only | Direct read-only | Derived | `workspace_rbac_rls`, `planning_visibility_permissions` |
| Staff/member | Direct | Direct assigned-action boundary | Direct create/no-delete | Derived | `workspace_rbac_rls`, `planning_visibility_permissions`, `planning_lifecycle` |
| Manager | Direct | Direct restricted-plan boundary | Direct | Direct | `workspace_rbac_rls`, `planning_visibility_permissions`, review and export contracts |
| Custom role | Direct explicit permission | Direct restricted-plan/read-without-action scenario | Direct read-only | Derived | `workspace_rbac_rls`, `planning_visibility_permissions` |
| Owner | Direct cross-tenant isolation | Direct lifecycle authority | Direct | Direct | `workspace_rbac_rls`, `database_adversarial_access`, ownership and lifecycle contracts |
| Service role | Structural deny-to-browser | Structural | Structural | Direct operation boundary | `database_security_boundaries`, `system_operations_contracts` |

The custom planning contract deliberately grants only `plan.read`. It proves
that the role can read its granted hierarchy while remaining unable to read
actions without `action.read_all`; a custom role does not inherit its base
role's default permission bundle.

## Sensitive asset matrix

| Asset family | Read isolation | Mutation boundary | Lifecycle/evidence | Contract evidence |
| --- | --- | --- | --- | --- |
| Workspace, membership, roles | Direct | Direct | Ownership invariant | `workspace_rbac_rls`, `workspace_ownership_invariants`, `workspace_invitation_lifecycle` |
| Plans, goals, initiatives, actions | Direct | Direct/RPC | Archive protection | `planning_visibility_permissions`, `planning_lifecycle`, `database_adversarial_access` |
| Metrics, targets, measurements | Derived plan visibility | Direct/RPC | Reconciliation source | `metric_reconciliation_contracts`, `database_security`, `planning_visibility_permissions` |
| Transactions and allocations | Direct | RPC/idempotent creation | Export boundary | `workspace_rbac_rls`, `idempotency_contracts`, `transaction_export_contracts` |
| Reviews and snapshots | Direct outsider denial | RPC-only finalization | Immutable snapshot | `business_review_finalization_contracts`, `database_security_boundaries` |
| Audit logs and notifications | Permission/own-user read | Trigger/RPC only | Append-only/state RPC | `audit_evidence_contracts`, `database_security_boundaries`, notification contracts |
| Storage assets | Identity/workspace scoped | MIME, size, owner, and role scoped | No anonymous writes | `storage_asset_boundaries` |
| Community publications | Public published rows only | Author/moderator lifecycle | Publication event protection | `community_insight_feed_contracts` |
| Market source data | Public factual snapshot boundary | Trusted ingestion only | Provenance and freshness | `market_external_data_contracts` |

## Change rule

Every migration that introduces a new public table, actor, permission code, or
`SECURITY DEFINER` RPC must update this matrix and add a negative contract.
Structural checks are necessary, but a release-sensitive actor/action pair also
needs a direct adversarial scenario. The clean-database CI run remains the
authoritative execution gate.
