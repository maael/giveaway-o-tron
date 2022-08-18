import allGET from './all/get'
import allPOST from './all/post'
import oneGET from './one/get'
import onePATCH from './one/patch'
import oneDELETE from './one/delete'

export default {
  one: {
    get: oneGET,
    patch: onePATCH,
    delete: oneDELETE,
  },
  all: {
    get: allGET,
    post: allPOST,
  },
}
