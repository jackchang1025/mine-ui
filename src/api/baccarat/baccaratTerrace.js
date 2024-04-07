import { request } from '@/utils/request.js'

/**
 * 台，桌 API JS
 */

export default {

  /**
   * 获取树
   * @returns
   */
  getListWithTerraceDeck(params = {}) {
    return request({
      url: 'baccarat/terrace/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取台，桌分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/terrace/index',
      method: 'get',
      params
    })
  },

  /**
   * 添加台，桌
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/terrace/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新台，桌数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/terrace/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取台，桌
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/terrace/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 将台，桌删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/terrace/delete',
      method: 'delete',
      data
    })
  },

  /**
    * 台，桌导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/terrace/import',
      method: 'post',
      data
    })
  },

  /**
   * 台，桌下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/terrace/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 台，桌导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/terrace/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}