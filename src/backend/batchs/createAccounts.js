const async = require('async')
const { v4 } = require('uuid')
const { googleInit } = require('../googleClient')

async function run (list, options) {
  const { google, credentials } = await googleInit()
  const { project, app } = options
  const iam = google.iam('v1');
  const resource = google.cloudresourcemanager('v1beta1')
  let completed_account = []
  return new Promise((resolve, reject) => {
    async.eachSeries(list, (request, listCallback) => {
      iam.projects.serviceAccounts.create(request, async (err, res) => {
        if (err) {
          listCallback(err);
        } else {
          let account = res.data
          let data = (await iam.projects.serviceAccounts.keys.create({
            name: account.name,
            requestBody: {
              'privateKeyType': 'TYPE_GOOGLE_CREDENTIALS_FILE',
              'keyAlgorithm': 'KEY_ALG_RSA_2048'
            }
          })).data
          // console.log(data)

          completed_account.push(account)

          await app.recorder.insertItem({
            'item_type': 'serviceAccount',
            'projectId': project.projectId,
            'enable': true,
            ...account,
            privateKeyData: data.privateKeyData
          })
          listCallback();
        }
      })
    }, async function (err) {
      if (err) {
        // console.log(err.response)
        reject(err)
      } else {
        console.log('complete')
        let response = (await resource.projects.getIamPolicy({
          resource: `${project.projectNumber}`
        })).data

        response = (await resource.projects.setIamPolicy({
          resource: `${project.projectNumber}`,
          requestBody: {
            policy: {
              bindings: response.bindings.concat([
                {
                  members: completed_account.map(account => 'serviceAccount:' + account.email),
                  role: "roles/iam.serviceAccountUser"
                }, {
                  members: completed_account.map(account => 'serviceAccount:' + account.email),
                  role: "roles/iam.serviceAccountTokenCreator"
                }
              ]),
              version: 3
            }
          }
        })).data
        console.log(response)

        resolve(completed_account.length)
      }
    });
  })
}
exports.batchCreateAccounts = run