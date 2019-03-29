workflow "New workflow" {
  on = "push"
  resolves = [
    "Test Publish Verdaccio",
    "Run Jest Test",
  ]
}

action "Run Jest Test" {
  uses = "actions/docker/cli@c08a5fc9e0286844156fefff2c141072048141f6"
  args = "build ."
}

action "Test Publish Verdaccio" {
  uses = "verdaccio/github-actions/publish@master"
  needs = ["Run Jest Test"]
  args = "-ddd"
}
