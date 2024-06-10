import { request } from '@/utils/request.js'

/**
 * 规则 API JS
 */

export default {

  /**
   * 获取规则分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/rule/index',
      method: 'get',
      params
    })
  },

  /**
   * 获取规则分页列表
   * @returns
   */
  list (params = {}) {
    return request({
      url: 'baccarat/rule/list',
      method: 'get',
      params
    })
  },

  /**
   * 添加规则
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/rule/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新规则数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/rule/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取规则
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/rule/read/' + id,
      method: 'get',
      data
    })
  },

  /**
   * 将规则删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/rule/delete',
      method: 'delete',
      data
    })
  },

  /**
    * 规则导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/rule/import',
      method: 'post',
      data
    })
  },

  /**
   * 规则下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/rule/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 规则导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/rule/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}