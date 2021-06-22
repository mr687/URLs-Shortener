const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const monk = require('monk')
const {
  nanoid
} = require('nanoid')
const yup = require('yup')
require('dotenv').config()

const app = express()
const schema = yup.object().shape({
  url: yup.string().trim().url().required(),
  slug: yup.string().trim().matches(/[\w\-]/i)
})
const db = monk(process.env.MONGO_URI)
const wrappers = db.get('wrappers')
wrappers.createIndex({
  slug: 1
}, {
  unique: true
})

app.use(helmet())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
app.use(express.static('./public'))

app.get('/:slug', async (req, res) => {
  const {
    slug
  } = req.params
  try {
    const wrapper = await wrappers.findOne({
      slug
    })
    if (wrapper) res.redirect(wrapper.url)
    res.redirect(`/?error=${slug} not found.`)
  } catch (error) {
    res.redirect('/?error=Link not found.')
  }
})

app.post('/wrappers', async (req, res, next) => {
  let {
    url,
    slug
  } = req.body
  try {
    if (!slug) {
      slug = nanoid(6)
    }
    slug = slug.toLowerCase()
    await schema.validate({
      url,
      slug
    })

    const newWrapper = {
      url,
      slug,
    }

    const created = await wrappers.insert(newWrapper)
    res.json({
      message: 'created.',
      wrapper: created
    })
  } catch (error) {
    if (error.message.startsWith('E11000')) {
      error.message = 'Slug in use.'
    }
    next(error)
  }
})

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status)
  } else {
    res.status(500)
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🍰' : error.stack
  })
});

const port = process.env.PORT || 5555
app.listen(port, () => {
  console.log(`Listening at http:://0.0.0.0:${port}`)
})