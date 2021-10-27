import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import express from 'express'
import mime from 'mime-types'
import swaggerUi from 'swagger-ui-express'
import { createImage } from './createImage.js'

/**
 *
 * @param {object} dimension
 */
export const setImageDimension = dimension => {
  const dimensions = dimension.split('x')
  createImageOptions.dimension = {
    width: dimensions[0],
    height: dimensions[1]
  }
}
const expressPort = 8000
const jimpOptions = {}
const createImageOptions = {
  extension: 'png',
  dimension: {
    width: 1,
    height: 1
  },
  storePath: './public/image-store',
  /**
   *
   * @param {object} options
   */
  callbackOnGenerated: (options) => {
    options.responseObject.sendFile(
      path.resolve(options.imagePath),
      jimpOptions
    )
  },
  callbackOnGeneratedResponseObject: null
}
export const getCreateImageOptions = _ => createImageOptions

const swaggerDocument = YAML.parse(
  fs.readFileSync('./swagger.yml', 'utf8')
)
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// public folder
app.use('/public', express.static('./public'))

// swagger stuff
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req, res) => {
  return res.status(200).send({
    success: 'true',
    message: ':-D'
  })
})

/**
 *
 * @param {object} response
 * @param {string} fileName
 */
export const createImageCallback = (response, fileName) => {
  response.sendFile(
    path.resolve(fileName),
    jimpOptions
  )
  return false
}

app.get('/:extension/:dimension', (req, res) => {
  setImageDimension(req.params.dimension)
  createImageOptions.extension = req.params.extension
  createImageOptions.callbackOnGeneratedResponseObject = res

  res
    .status(200)
    .contentType(mime.lookup(req.params.extension))
  createImage(createImageOptions)
})

app.listen(expressPort)
