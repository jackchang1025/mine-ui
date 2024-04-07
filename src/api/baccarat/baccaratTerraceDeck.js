import { request } from '@/utils/request.js'

/**
 * 牌靴 API JS
 */

export default {

  /**
   * 获取牌靴分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/terraceDeck/index',
      method: 'get',
      params
    })
  },

  /**
   * 读取牌靴
   * @returns
   */
  read (id,data) {
    return request({
      url: 'baccarat/terraceDeck/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 读取牌靴
   * @returns
   */
  show (id) {
    return request({
      url: 'baccarat/terraceDeck/show/' + id,
      method: 'get',
    })
  },

  /**
   * 将牌靴删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/terraceDeck/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 更新牌靴数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/terraceDeck/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 添加牌靴
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/terraceDeck/save',
      method: 'post',
      data
    })
  },

  /**
    * 牌靴导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/terraceDeck/import',
      method: 'post',
      data
    })
  },

  /**
   * 牌靴下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/terraceDeck/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 牌靴导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/terraceDeck/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}