Patch: Role permission proposal

Location: .dse/patches/role_permission_patch/

Files included:

- `proposed_roles.json` — full `roles.json` with `default_permissions` updated per proposal.
- `09-Role-Module-Matrix.proposed.md` — original matrix with an added `Permissions` column and new rows for roles present in the canonical registry.

How to review:

1. Inspect `proposed_roles.json` to verify the `default_permissions` arrays for each role.
2. Inspect `09-Role-Module-Matrix.proposed.md` to confirm module mappings and permission alignment.

Suggested apply steps (manual):

```bash
# backup current files
cp .dse/roles.json .dse/roles.json.bak
cp dokumenSistem/09-Role-Module-Matrix.md dokumenSistem/09-Role-Module-Matrix.md.bak

# when approved, replace
cp .dse/patches/role_permission_patch/proposed_roles.json .dse/roles.json
cp .dse/patches/role_permission_patch/09-Role-Module-Matrix.proposed.md dokumenSistem/09-Role-Module-Matrix.md

# commit & push
git checkout -b feature/role-permission-proposal
git add .dse/roles.json dokumenSistem/09-Role-Module-Matrix.md
git commit -m "Proposal: map structured permissions to canonical roles"
git push --set-upstream origin feature/role-permission-proposal
```

If you want, I can create the branch and apply the changes locally and prepare a commit message for review instead of manual steps — tell me to proceed.
