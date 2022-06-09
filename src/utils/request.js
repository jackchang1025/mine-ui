import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import { get, isEmpty } from 'lodash'
import qs from 'qs'
import { h } from 'vue'
import { IconFaceFrownFill } from '@arco-design/web-vue/es/icon'

function createService () {
  // 创建一个 axios 实例
  const service = axios.create()

  // HTTP request 拦截器
  service.interceptors.request.use(
    config => config, 
    error => {
      // 失败
      return Promise.reject(error);
    }
  );

  // HTTP response 拦截器
  service.interceptors.response.use(
    response => {
      if (response.headers['content-disposition'] && response.status === 200) {
        return response
      } else if (response.data.size) {
        response.data.codo = 500
        response.data.message = '服务器内部错误'
        response.data.success = false
      } else if (response.data.code && response.data.code !== 200) {
        Message.error({
          content: response.data.message,
          icon: () => h( IconFaceFrownFill )
        })
      }
      return response.data;
    },
    error => {
      const err = (text) => { 
        Message.error({
          content: ( error.response && error.response.data && error.response.data.message )
          ? error.response.data.message
          : text,
          icon: () => h( IconFaceFrownFill )
        }) 
      }
      if (error.response && error.response.data) {
        switch (error.response.status) {
          case 404:
            err('服务器资源不存在')
            break
          case 500:
            err('服务器内部错误')
            break
          case 401:
            err('登录状态已过期，需要重新登录')
            tool.data.clear()
            window.location.href = '/'
            break
          case 403:
            err('没有权限访问该资源')
            break
          default: 
            err('未知错误！')
        }
      } else {
        err('请求超时，服务器无响应！')
      }
      return Promise.reject(error.response && error.response.data ? error.response.data : null)
    }
  
  )
  return service
}

function stringify (data) {
  return qs.stringify(data, { allowDots: true, encode: false })
}

/**
 * @description 创建请求方法
 * @param {Object} service axios 实例
 */
function createRequest (service) {
  return function (config) {
    const token = tool.data.get(import.meta.env.VITE_TOKEN_PREFIX)
    const configDefault = {
      headers: {
        Authorization: "Bearer " + token,
        'Content-Type': get(config, 'headers.Content-Type', 'application/json;charset=UTF-8')
      },

      timeout: 10000,
      baseURL: import.meta.env.VITE_PROXY_PREFIX,
      data: {}
    }
    const option = Object.assign(configDefault, config)

    // json
    if (!isEmpty(option.params)) {
      option.url = option.url + '?' + stringify(option.params)
      option.params = {}
    }

    return service(option)
  }
}
  
// 用于真实网络请求的实例和请求方法
export const service = createService()
export const request = createRequest(service)