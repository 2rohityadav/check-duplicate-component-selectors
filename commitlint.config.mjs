export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "chore", // Changes to the build process or auxiliary tools
        "revert", // Reverts a previous commit
        "ci", // Changes to CI configuration files and scripts
        "build", // Changes that affect the build system or external dependencies
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-case": [2, "always", "lower-case"],
    "body-max-line-length": [0, "always"], // Disable line length check for the body
    "footer-max-line-length": [0, "always"], // Disable line length check for the footer
  },
  ignores: [
    (commit) => commit.includes("chore(release)"), // Ignore semantic-release commit messages
  ],
};

/*
Run Commitlint to verify that it works as expected. For example:

This should pass validation:
  echo "feat: add new feature" | npx commitlint

------------------------------------------------------------
Test with an invalid commit message to ensure the rules are enforced:

This should fail because the type Feat is not in lowercase:
  echo "Feat: add new feature" | npx commitlint
*/