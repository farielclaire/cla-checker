const repo = process.argv[2]
const prNumber = process.argv[3]
const execSync = require('child_process').execSync
const token = process.env.CLA_GITHUB_TOKEN
const gistFile = process.env.CLA_GIST_FILE
const domain = 'https://cla-assistant.io'
if (!repo || repo.length == 0) {
    console.log('Failed to get reponame.')
    process.exit(1)
}
if (!prNumber || prNumber.length == 0) {
    console.log('Failed to get the pr number.')
    process.exit(1)
}
if (!token || token.length == 0) {
    console.log('No github personal token provided.')
    process.exit(1)
}
if (!gistFile || gistFile.length == 0) {
    console.log('Gist info not provided.')
    process.exit(1)
}
const [gistUrl, gistVersion] = gistFile.split('/').filter(p => p.length >= 32)
// get the owner of this pr
const pulls = execSync(`curl https://api.github.com/repos/${repo}/pulls/${prNumber}`)
const prInfo = JSON.parse(pulls.toString())
const prUserId = prInfo.user.id
if (!prUserId || prUserId < 0) {
    console.log('Failed to get the owner of this pr.')
    process.exit(1)
}
const repoId = prInfo.base.repo.id
// get all repos and gists
const clas = execSync(`curl -X POST -H 'Content-Type: application/json' -H 'x-token: ${token}' -d '{"repoId":"${repoId}","gist":{"gist_url":"${gistUrl}","gist_version":"${gistVersion}"}}' ${domain}/api/cla/getAll`)
const signedList = JSON.parse(clas.toString())
if (signedList.filter(s => parseInt(s.userId) === parseInt(prUserId)).length === 0) {
    console.log('Cla not singed.')
    process.exit(1)
}
console.log('Cla signed.')
