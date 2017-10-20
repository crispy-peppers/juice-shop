/* jslint node: true */
const crypto = require('crypto')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
const sanitizeHtml = require('sanitize-html')
const z85 = require('z85')
const utils = require('./utils')
const fs = require('fs')

exports.publicKey = fs.readFileSync('encryptionkeys/jwt.pub', 'utf8')
const privateKey = '-----BEGIN RSA PRIVATE KEY-----\r\nMIICXAIBAAKBgQDNwqLEe9wgTXCbC7+RPdDbBbeqjdbs4kOPOIGzqLpXvJXlxxW8iMz0EaM4BKUqYsIa+ndv3NAn2RxCd5ubVdJJcX43zO6Ko0TFEZx/65gY3BE0O6syCEmUP4qbSd6exou/F+WTISzbQ5FBVPVmhnYhG/kpwt/cIxK5iUn5hm+4tQIDAQABAoGBAI+8xiPoOrA+KMnG/T4jJsG6TsHQcDHvJi7o1IKC/hnIXha0atTX5AUkRRce95qSfvKFweXdJXSQ0JMGJyfuXgU6dI0TcseFRfewXAa/ssxAC+iUVR6KUMh1PE2wXLitfeI6JLvVtrBYswm2I7CtY0q8n5AGimHWVXJPLfGV7m0BAkEA+fqFt2LXbLtyg6wZyxMA/cnmt5Nt3U2dAu77MzFJvibANUNHE4HPLZxjGNXN+a6m0K6TD4kDdh5HfUYLWWRBYQJBANK3carmulBwqzcDBjsJ0YrIONBpCAsXxk8idXb8jL9aNIg15Wumm2enqqObahDHB5jnGOLmbasizvSVqypfM9UCQCQl8xIqy+YgURXzXCN+kwUgHinrutZms87Jyi+D8Br8NY0+Nlf+zHvXAomD2W5CsEK7C+8SLBr3k/TsnRWHJuECQHFE9RA2OP8WoaLPuGCyFXaxzICThSRZYluVnWkZtxsBhW2W8z1b8PvWUE7kMy7TnkzeJS2LSnaNHoyxi7IaPQUCQCwWU4U+v4lD7uYBw00Ga/xt+7+UqFPlPVdz1yyr4q24Zxaw0LgmuEvgU5dycq8N7JxjTubX0MIRR+G9fmDBBl8=\r\n-----END RSA PRIVATE KEY-----'

exports.hash = data => crypto.createHash('md5').update(data).digest('hex')
exports.hmac = data => crypto.createHmac('sha256', '07-92-75-2C-DB-D3').update(data).digest('hex')

exports.cutOffPoisonNullByte = str => {
  const nullByte = '%00'
  if (utils.contains(str, nullByte)) {
    return str.substring(0, str.indexOf(nullByte))
  }
  return str
}

exports.isAuthorized = () => expressJwt({secret: this.publicKey})
exports.denyAll = () => expressJwt({secret: '' + Math.random()})
exports.authorize = (user) => jwt.sign(user || {}, privateKey, { expiresIn: 3600 * 5, algorithm: 'RS256' })

exports.sanitizeHtml = html => sanitizeHtml(html)

exports.authenticatedUsers = {
  tokenMap: {},
  idMap: {},
  put: function (token, user) {
    this.tokenMap[token] = user
    this.idMap[user.data.id] = token
  },
  get: function (token) {
    if (token) {
      return this.tokenMap[utils.unquote(token)]
    } else {
      return undefined
    }
  },
  tokenOf: function (user) {
    if (user) {
      return this.idMap[user.id]
    } else {
      return undefined
    }
  },
  from: function (req) {
    const token = utils.jwtFrom(req)
    if (token) {
      return this.get(token)
    } else {
      return undefined
    }
  }
}

exports.userEmailFrom = req => {
  if (req.headers && req.headers['x-user-email']) {
    return req.headers['x-user-email']
  }
  return undefined
}

exports.generateCoupon = (date, discount) => {
  const coupon = utils.toMMMYY(date) + '-' + discount
  return z85.encode(coupon)
}

exports.discountFromCoupon = coupon => {
  if (coupon) {
    const decoded = z85.decode(coupon)
    if (decoded && hasValidFormat(decoded.toString())) {
      const parts = decoded.toString().split('-')
      const validity = parts[0]
      if (utils.toMMMYY(new Date()) === validity) {
        const discount = parts[1]
        return parseInt(discount)
      }
    }
  }
  return undefined
}

function hasValidFormat (coupon) {
  return coupon.match(/(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[0-9]{2}-[0-9]{2}/)
}

const redirectWhitelist = [
  'https://github.com/bkimminich/juice-shop',
  'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
  'https://gratipay.com/juice-shop',
  'http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub',
  'http://shop.spreadshirt.com/juiceshop',
  'http://shop.spreadshirt.de/juiceshop',
  'https://www.stickermule.com/user/1070702817/stickers',
  'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW'
]
exports.redirectWhitelist = redirectWhitelist

exports.isRedirectAllowed = url => {
  let allowed = false
  redirectWhitelist.forEach(allowedUrl => {
    allowed = allowed || url.indexOf(allowedUrl) > -1
  })
  return allowed
}