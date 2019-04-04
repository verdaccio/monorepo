workflow "New workflow" {
  on = "push"
  resolves = ["Test Publish Verdaccio"]
}

action "install packages" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  args = "install"
}

action "testing npm" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["install packages"]
  args = "test"
}

action "build npm" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  needs = ["testing npm"]
  args = "test"
}

action "Test Publish Verdaccio" {
  uses = "verdaccio/github-actions/publish@v0.1.0"
  needs = ["build npm"]
  args = "-d"
}
