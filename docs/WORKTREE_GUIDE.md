# Working in the correct checkout

Use the actual Git state instead of paths or branch names copied from a past task. The [original worktree snapshot](archived/guides/worktree-guide-original.md) is retained as history.

## Before editing or committing

```sh
pwd
git rev-parse --show-toplevel
git branch --show-current
git status --short --branch
git worktree list
```

Confirm that the checkout is the one intended for the task. Each worktree has its own working files and branch, while repository history is shared. A different terminal or Git GUI window may be showing a different checkout.

## Environment and local servers

Environment files and uncommitted content do not automatically transfer to a new worktree. Configure each app deliberately, use distinct ports and verify the loaded dataset before interpreting a content mismatch. See [local Sanity debugging](local-sanity-debugging.md).

## Commit and push checks

Review `git diff` and `git diff --cached`, stage only the requested scope, and verify the destination branch before pushing. Check the exact remote ref with `git ls-remote origin refs/heads/<branch>` when confirming a push; local tracking references alone may be stale.

If a command cannot update Git metadata because of permissions, resolve the permission boundary rather than repeatedly retrying writes. Avoid resetting or deleting another checkout to solve a branch mismatch.

## Removing a worktree

First verify that its work is saved and its branch state is understood. Remove it from another checkout using the explicit path only when cleanup is intended. Keep any needed untracked environment files or local recovery artifacts before removal.
