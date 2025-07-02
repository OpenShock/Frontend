# How to contribute to OpenShock

Do you want to contribute to OpenShock? We'd love to have you! Here are some ways you can help:

### Reporting Bugs

- Please do not report security vulnerabilities here. Instead, please report them to ...

### Branching Strategy

- **Default Branch**: The `master` branch serves as our primary branch, designated for staging releases. Maintaining stability in this branch is a priority.

- **Trunk-Based Development**: Our repository follows the `trunk-based development` strategy. This entails using feature branches for all new development, which are subsequently merged into the `master` branch upon completion.

- **Branch Naming Conventions**:
  - Bug fixes: `bugfix/bug-name`.
  - Features: `feature/feature-name`.
  - Housekeeping tasks: `chore/chore-name`.
  - Hotfixes `hotfix/bug-name`.
  - Documentation: `docs/document-name`. (This applies to `README.md`, `CONTRIBUTING.md`, `LICENSE`, etc...)

- **Pull Requests**:
  - Pull requests are used to merge feature, bug fixe, and chore branches into the `master` branch.
  - A minimum of one other developer must review the pull request before merging.
  - All pull requests must pass the automated tests before being merged.
  - All pull requests must be squashed and merged.

- **Hotfixes**:
  - Hotfixes will always be branched off the latest tag.
  - Hotfixes do not require a pull request, but needs to be merged by a project maintainer.
  - The hotfix workflow is as follows:
    1. Create a new branch named `hotfix/bug-name`.
    2. Implement the hotfix.
    3. Release the hotfix with a new tag.
    4. Squash and merge the hotfix back into the `master` branch.

- **Releases**:
  - Releases are initiated by creating a new tag on the `master` branch, following semantic versioning principles. Tags are named `vX.Y.Z`.
  - The release workflow is as follows:
    1. Create a new tag on the `master` branch.
    2. Push the tag to the remote repository.
    3. The release will be automatically deployed to the production environment.
