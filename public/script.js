const form = document.querySelector('form')
const generateButton = document.querySelector('form button')
const errorMessage = document.getElementById('errorMessage')
const successMessage = document.getElementById('successMessage')
const inputUrl = document.getElementById('inputUrl')
const inputSlug = document.getElementById('inputSlug')

const displayForm = (flag) => {
  if (flag) {
    generateButton.innerHTML = 'generate'
  } else {
    generateButton.innerHTML = 'processing..'
  }
  generateButton.disabled = !flag
  inputUrl.disabled = !flag
  inputSlug.disabled = !flag
}

const clearForm = () => {
  displayForm(true)
  inputUrl.value = ''
  inputSlug.value = ''
}

const onSuccess = (success) => {
  successMessage.style.display = 'block'
  errorMessage.style.display = 'none'
  successMessage.innerHTML = `{ success: ${success.message.toLowerCase()} }<br>{ link: https://lnk.ngoder.com/${success.wrapper.slug} }`
  clearForm()
}

const onError = (error) => {
  successMessage.style.display = 'none'
  errorMessage.style.display = 'block'
  errorMessage.innerHTML = `{ error: ${error.message.toLowerCase()} }`
  displayForm(true)
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault()
  displayForm(false)

  const url = inputUrl.value
  const slug = inputSlug.value
  const data = {
    url,
    slug
  }

  const response = await fetch('/wrappers', {
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  const result = await response.json()
  if (response.ok) {
    onSuccess(result)
  } else {
    onError(result)
  }
})

(() => {
  clearForm()
})()