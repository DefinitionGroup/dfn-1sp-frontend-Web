# Git Worktree Survival Guide

A definitive, short guide for working in this repo's git worktrees without
confusing yourself or your tools.

---

## The one rule

**One repo (`.git/`), many working folders. Each folder is locked to its own
branch. `git` always acts on the folder you are standing in.**

A worktree is just an extra checkout of the same repository in a different
folder, pinned to a different branch. All worktrees share one `.git/`
database, so every commit is visible to all of them — but the *files on disk*
are independent per folder.

---

## Current layout

```
/Users/martin/DEV/1SP-dfn-1sp-frontend                          → branch: flzr-may26
   (the "parent" checkout)

/Users/martin/DEV/1SP-dfn-1sp-frontend/.claude/worktrees/serene-wozniak-b511bc
   → branch: platform/multisite-monorepo
   (this worktree — where the multi-site work lives)
```

Verify the live state any time with `git worktree list` (see below) — the
branches above can change as work progresses.

---

## The 3 commands that end all confusion

Run these whenever you are unsure where you are:

```bash
pwd                          # which folder am I in?
git branch --show-current    # which branch does this folder have?
git worktree list            # every folder + its branch, in one view
```

If those three agree with what you expect, you are fine. If they do **not**,
stop and re-read them before doing anything — do not guess.

---

## Where to do which work

- **This worktree** (`serene-wozniak-b511bc`) owns `platform/multisite-monorepo`.
  Do the multi-site / FLZR work here.
- **The parent folder** (`1SP-dfn-1sp-frontend`) owns a different branch.
  Changes you make in the worktree will **not** appear there — different
  folder, different branch, different files on disk.

A branch can be checked out in **only one** folder at a time. Git enforces
this: if you try to `git switch platform/multisite-monorepo` in the parent
while this worktree already has it, git refuses. That refusal is a safety
feature, not a bug.

---

## ⚠️ Why GitHub Desktop breaks things

**GitHub Desktop does not understand worktrees.** It assumes one repo = one
folder = one branch. Pointed at the parent folder, it will:

- Show you the *parent's* branch, not this worktree's branch
- Offer to switch the parent's branch out from under you
- Show a giant diff (it compares against `main`, not "uncommitted changes")

**Fix: do not use GitHub Desktop for this repo.** Use the terminal. If you
want a GUI, point your editor directly at the worktree folder:

```
VS Code → File → Open Folder →
  /Users/martin/DEV/1SP-dfn-1sp-frontend/.claude/worktrees/serene-wozniak-b511bc
```

VS Code's built-in Source Control panel understands worktrees correctly when
opened *on the worktree folder itself*.

---

## The everyday loop (terminal, in this worktree)

```bash
cd /Users/martin/DEV/1SP-dfn-1sp-frontend/.claude/worktrees/serene-wozniak-b511bc

git status                   # what changed
git add -A                   # stage everything
git commit -m "message"      # commit
git push                     # send to the remote
```

`git push` from here always goes to `origin/platform/multisite-monorepo`. The
folder determines the branch, which determines the push target. No surprises.

---

## Reading a "the diff is huge!" panic

When any tool shows hundreds of changed files, ask: **what is it comparing?**

| Surface | Compares | Expected size |
|---|---|---|
| `git status` | uncommitted changes only | small / zero |
| `git diff main` | your whole branch vs `main` | **huge** (months of work) |
| PR badge / GitHub PR page | your branch vs its base branch | **huge** |
| GitHub Desktop | confused — usually branch-vs-main | misleadingly huge |

A huge number is almost always "branch vs main" — which is **correct**, that's
what your pull request contains. The number that answers "did I save my work?"
is `git status`. If it says **clean**, your work is committed.

---

## Common situations

### "My changes don't show up in git!"

You (or a GUI) are looking at the wrong folder. Run the 3 commands. You are
probably standing in the parent folder (different branch) instead of the
worktree. `cd` into the worktree and `git status` again.

### "I committed but the PR didn't update"

You committed locally but did not push, **or** you pushed from the wrong
folder/branch. Check:

```bash
git log @{u}..HEAD     # commits you have locally that the remote doesn't
git push               # push them
```

### "Git won't let me switch to a branch"

That branch is checked out in another worktree. Either work in that worktree
directly, or `git worktree list` to find where it lives.

### "GitHub Desktop changed my branch"

Switch back via terminal: `git switch <the-branch-you-wanted>`. Then stop
using GitHub Desktop for this repo (see the warning above).

---

## Cleaning up a worktree (when its work has shipped)

```bash
# 1. From the worktree: make sure everything is saved and pushed
cd /Users/martin/DEV/1SP-dfn-1sp-frontend/.claude/worktrees/serene-wozniak-b511bc
git status                              # must be clean
git log @{u}..HEAD                      # must be empty (nothing local-only)

# 2. From the PARENT folder: remove the worktree
cd /Users/martin/DEV/1SP-dfn-1sp-frontend
git worktree remove .claude/worktrees/serene-wozniak-b511bc

# 3. (Optional) delete the branch once it is merged
git branch -d platform/multisite-monorepo
```

The branch and all its commits live in the shared `.git/` and on the remote.
`git worktree remove` deletes only the **folder** — never your work.

If a worktree folder was deleted manually (e.g. by accident) and `git worktree
list` still shows it, clean up the stale registration with:

```bash
git worktree prune
```

---

## TL;DR card

1. **Terminal, not GitHub Desktop**, for anything in a worktree repo.
2. Lost? → `pwd && git branch --show-current && git worktree list`
3. "Did I save it?" → `git status` says **clean** = yes.
4. Huge diff = "branch vs main" = normal, ignore it.
5. `git push` from a folder always targets that folder's branch.
