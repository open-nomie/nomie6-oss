import localforage from 'localforage'
import { openModal } from '../../../components/backdrop/BackdropStore2'
// import { md5 } from '../../../modules/nid/nid'
import type { IStorage } from '../storage'
import S3 from 'aws-sdk/clients/S3'

let s3Client: S3

import S3ConnectionModal from '../views/s3-modal.svelte'

var localBackup = localforage.createInstance({
  name: 'nomie-s3-local',
})

let listeners = []

let CONNECTION: S3ConnectionType

export const checkNomieServerToken = async (
  endpoint: string,
  token: string
): Promise<NomieServerConnectResponseType | undefined> => {
  const url = `${endpoint}/server`
  try {
    const call = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (call.status !== 200) {
      throw new Error(call.statusText)
    }
    const res = await call.json()
    return res
  } catch (e) {
    throw new Error(e)
  }
}

export type S3ConnectionType = {
  server?: string
  bucket?: string
  access_key?: string
  secret_key?: string
  region?: string
  encryption?: string
  folder?: string
  validated?: boolean
}
export const DEFAULT_S3_FOLDER = 'default'
type NomieServerConnectResponseType = {
  validServer: boolean
  validToken: boolean
  canConnect: boolean
}

export const saveS3Connection = async (s3Config: S3ConnectionType): Promise<boolean> => {
  await localBackup.setItem('connection', s3Config)
  return true
}

export const getS3Connection = async (): Promise<S3ConnectionType | undefined> => {
  const connection: S3ConnectionType | undefined = await localBackup.getItem('connection')
  return connection
}

export const getS3Client = (connection: S3ConnectionType) => {
  return new S3({
    accessKeyId: connection.access_key,
    secretAccessKey: connection.secret_key,
    endpoint: connection.server,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4',
    region: connection.region,
  })
}

const writeS3Doc = async (path: string, content: any): Promise<any> => {
  const params = {
    Bucket: CONNECTION.bucket,
    Key: `${CONNECTION.folder || DEFAULT_S3_FOLDER}/${path}`,
    Body: JSON.stringify(content),
  }
  return await s3Client
    .putObject(params)
    .promise()
    .catch((e) => {
      throw e
    })
}

const readS3Doc = async (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: CONNECTION.bucket,
      Key: `${CONNECTION.folder || DEFAULT_S3_FOLDER}/${path}`,
    }
    s3Client.getObject(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  // try {

  //   return res
  // } catch (e) {
  //   // console.error(e)
  //   return undefined
  // }
}

export const testS3Connection = async (connection: S3ConnectionType): Promise<boolean> => {
  s3Client = getS3Client(connection)
  const params = { Bucket: connection.bucket, Key: 'nomie-connection-test', Body: 'Connected' }
  try {
    await s3Client.putObject(params).promise()
    return true
  } catch (e) {
    throw e
  }
}

export const openS3ConnectionModal = async (connection?: S3ConnectionType) => {
  connection = connection || CONNECTION
  return new Promise((resolve) => {
    openModal({
      id: 's3-connection-modal',
      component: S3ConnectionModal,
      componentProps: {
        connection: connection,
        testConnection: testS3Connection,
        onSuccess(props) {
          
          resolve(props)
        },
      },
    })
  })
}

const toPathString = (path: string): string => {
  return path.replace(/\//g, '|')
}

export const S3Engine: IStorage = {
  onReady(func) {
    // No need to setup just call the function
    if (listeners.indexOf(func) == -1) {
      listeners.push(func)
    }
  },
  basePath(path) {
    return path
  },
  fireReady() {
    listeners.forEach((func) => {
      func()
    })
    listeners = []
  },
  async init() {
    await localBackup.ready()
    CONNECTION = await localBackup.getItem('connection')
    if (CONNECTION) {
      s3Client = getS3Client(CONNECTION)
      this.fireReady()
    } else {
      openS3ConnectionModal(CONNECTION)
    }
  },
  async getProfile() {
    return {
      username: 'Local User',
    }
  },
  async put(path, content) {
    return await writeS3Doc(toPathString(path), content)
  },
  async get(path) {
    try {
      const data = await readS3Doc(toPathString(path)).catch((e) => {
        throw e
      })
      if (data?.Body) {
        const body = data.Body.toString('utf-8')
        return JSON.parse(body)
      }
    } catch (e) {
      if(e.code === 'NoSuchKey') {
        return null;
      } else {
        throw e;
      }
    }
    return null
  },
  async list() {
    const res = await s3Client
      .listObjectsV2({
        Bucket: CONNECTION.bucket,
      })
      .promise()
    const all = res.Contents || []
    const items = all
      .map((row) => {
        return row.Key
      })
      .filter((key) => {
        return key.search(CONNECTION.folder || DEFAULT_S3_FOLDER) > -1
      })
      .map((path) => {
        return path.replace(`${CONNECTION.folder || DEFAULT_S3_FOLDER}/`, '').replace(/\|/g, '/')
      })
    return items
  },
  async delete(path) {
    // const forage = getHashedLocalforage();
    // return forage.removeItem(path)
  },
}
