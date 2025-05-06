import { request } from '@/utils/request.js'

export default {
  getOverallStats() {
    return request({
      url: '/baccarat/statistics/overall',
      method: 'get'
    })
  },
  
  getCredibilityStats() {
    return request({
      url: '/baccarat/statistics/credibility',
      method: 'get'
    })
  }
} 