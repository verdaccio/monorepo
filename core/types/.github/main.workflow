workflow "Publish Workflow" {
  on = "push"
  resolves = [
    "Test Publish Verdaccio"
  ]
}

action "Test Publish Verdaccio" {
  uses = "verdaccio/github-actions/publish@master"
  args = "-ddd"
}
