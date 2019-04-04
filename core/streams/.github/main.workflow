workflow "New workflow" {
  on = "push"
  resolves = ["testing npm"]
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
