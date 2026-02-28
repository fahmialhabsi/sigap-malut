# APPROVAL_MATRIX

Purpose
- Define who must approve different categories of automated changes.

Approval roles (examples)
- role-change (rename canonical role): requires 2 sign-offs (Head of IT + Sekretaris)
- schema-change (add/alter column): requires 2 sign-offs (DBA + Head of IT)
- data-migration (update users.role): requires 3 sign-offs (DBA + Head of IT + Sekretaris)
- infra-provisioning: requires 2 sign-offs (Cloud Admin + Head of IT)

Approval format
- Approvals must be recorded in `migration-approval.yaml` (see template) with GitHub handles or email and timestamp.
- The generator will only execute if required approvals listed are present.

Example approval policy entries
- name: "Role rename from 'staf' → 'pelaksana'"
  category: "role-change"
  required_approvers: ["@head-it", "@sekretaris"]