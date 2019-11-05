
const { PORT = '3000' } = process.env

export const expressPort = parseInt(PORT, 10)

// Client id that Google will use to make authorized requests
// In a production environment you should change this value
export const googleClientId = 'ABC123'

// Client secret that Google will use to make authorized requests
// In a production environment you should change this value
export const googleClientSecret = 'DEF456'

let ngrok = false
process.argv.forEach((value) => {
  if (value.includes('isLocal')) {
    ngrok = true
  }
})

// Running server locally using ngrok
export const useNgrok = ngrok

export const googleCloudProjectId = 'u-hub-257820'
