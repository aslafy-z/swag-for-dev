workflow "Deploy to Netlify" {
  on = "push"
  resolves = ["Deploy master", "Deploy preview"]
}

action "Push target master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Push targets PR" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Deploy master" {
  needs = "Push targets master"

  uses = "actions/netlify@master"
  secrets = ["NETLIFY_TOKEN"]
  args = "deploy master"
}

action "Deploy preview" {
  needs = "Push targets PR"

  uses = "actions/netlify@master"
  secrets = ["NETLIFY_TOKEN"]
  args = "deploy master"
}

action "Docker Login" {
  needs = ["Publish Filter"]
  uses = "actions/docker/login@master"
  secrets = ["DOCKER_USERNAME", "DOCKER_PASSWORD"]
}

action "Docker Publish" {
  needs = ["Docker Login"]
  uses = "actions/action-builder/docker@master"
  runs = "make"
  args = "publish"
}