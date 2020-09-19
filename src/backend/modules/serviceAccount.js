const { v4 } = require('uuid');
const { googleInit } = require('../googleClient')
const { batchCreateAccounts } = require('../batchs/createAccounts')
const { serviceAccountsPath } = require('../config').default;

exports.default = async (req, res, app) => {
  let ctl = req.query.ctl || 'list'
  let page = req.query.page || 1
  let size = req.query.size || 20
  let body = req.body
  let current_time = Math.round(new Date() / 1000)
  console.log(ctl)
  //https://console.cloud.google.com/cloud-resource-manager?folder=&organizationId=0
  switch (ctl) {
    case "create": {
      const { google, credentials } = await googleInit()
      const resource = google.cloudresourcemanager('v1beta1')
      let projectName = body.projectName || 'quickstart'

      let response = (await resource.projects.list({
        filter: `name:${projectName} lifecycleState:ACTIVE`,
      })).data
      let project = {}
      // console.log(response)
      if (!('projects' in response) || !response.projects.find(p => p.name === projectName)) {
        let response = (await resource.projects.create({
          requestBody: {
            name: projectName,
            project_id: 'p' + v4().replace(/-/g, '').substr(0, 16),
          }
        })).data
        project = response
      } else {
        project = response.projects.find(p => p.name === projectName)
      }

      response = (await google.serviceusage('v1beta1').services.list({
        filter: 'state:ENABLED',
        parent: `projects/${project.projectNumber}`
      })).data
      // console.log(response)

      if (!('services' in response) || !response.services.find(p => p.name === `projects/${project.projectNumber}/services/iam.googleapis.com`)) {
        response = (await google.serviceusage('v1beta1').services.enable({
          name: `projects/${project.projectNumber}/services/iam.googleapis.com`
        })).data
        // console.log(response)
      }

      if (!('services' in response) || !response.services.find(p => p.name === `projects/${project.projectNumber}/services/drive.googleapis.com`)) {
        response = (await google.serviceusage('v1beta1').services.enable({
          name: `projects/${project.projectNumber}/services/drive.googleapis.com`
        })).data
        // console.log(response)
      }

      if (!('services' in response) || !response.services.find(p => p.name === `projects/${project.projectNumber}/services/cloudresourcemanager.googleapis.com`)) {
        response = (await google.serviceusage('v1beta1').services.enable({
          name: `projects/${project.projectNumber}/services/cloudresourcemanager.googleapis.com`
        })).data
        // console.log(response)
      }

      if (!('services' in response) || !response.services.find(p => p.name === `projects/${project.projectNumber}/services/cloudidentity.googleapis.com`)) {
        response = (await google.serviceusage('v1beta1').services.enable({
          name: `projects/${project.projectNumber}/services/cloudidentity.googleapis.com`
        })).data
        // console.log(response)
      }

      // roles/iam.serviceAccountAdmin
      // roles/iam.serviceAccountUser
      let IamPolicys = (await resource.projects.getIamPolicy({
        resource: `${project.projectNumber}`
      })).data
      // console.log(response.bindings)
      let bindings = []

      if (!IamPolicys.bindings.find(b => b.role === 'roles/iam.serviceAccountAdmin')) {
        bindings.push({
          members: IamPolicys.bindings[0].members,
          role: "roles/iam.serviceAccountAdmin"
        })
      }

      // 服务号模拟用户号
      // let members = IamPolicys.bindings.filter(b => b.role === 'roles/iam.serviceAccountUser').map(bind => bind.members).flat(Infinity)
      // if (members.indexOf('xxxxx@gmail.com') === -1) {
      //   bindings.push({
      //     members: members.concat(['user:xxxxx@gmail.com']),
      //     role: "roles/iam.serviceAccountUser"
      //   })
      // }

      if (bindings.length) {
        response = (await resource.projects.setIamPolicy({
          resource: `${project.projectNumber}`,
          requestBody: {
            policy: {
              bindings: IamPolicys.bindings.concat(bindings),
              version: 3
            }
          }
        })).data
        console.log(response)
      }


      let accountsNum = body.accountsNum
      let accountsCount = await app.recorder.count({
        'item_type': 'serviceAccount',
        'projectId': project.projectId
      })
      if (accountsCount + accountsNum > 100) {
        accountsNum = accountsCount + accountsNum - 100
      }

      console.log('accountsNum', accountsNum)
      let list = []
      let i = 0
      do {
        i = i + 1
        let aid = 'sfa' + v4().replace(/-/g, '').substr(0, 16)
        const request = {
          name: `projects/${project.projectId}`,
          requestBody: {
            accountId: aid,
            serviceAccount: {
              displayName: aid
            }
          }
        };
        list.push(request)
      } while (accountsNum > i)
      let completed = await batchCreateAccounts(list, {
        project,
        app
      })
      res.send({
        code: 200,
        data: {
          completed: completed
        },
        message: '创建账号成功'
      })
      break
    }
    case "delete": {
      const { google, credentials } = await googleInit()
      const iam = google.iam('v1');
      let email = body.email
      let projectId = body.projectId
      await app.recorder.deleteItems({
        'item_type': 'serviceAccount',
        'email': email
      }, {
        multi: true
      })
      let response = (await iam.projects.serviceAccounts.delete({
        name: `projects/${projectId}/serviceAccounts/${email}`
      })).data
      console.log(response)
      res.send({
        code: 200,
        message: '删除账号成功'
      })
      break
    }
    default:
      let list = await app.recorder.findItems({ 'item_type': 'serviceAccount' }, page, size)
      let total = await app.recorder.count({ 'item_type': 'serviceAccount' })
      res.send({
        code: 200,
        msg: 'success',
        data: {
          'total': total,
          'list': list
        }
      })
      break
  }
}