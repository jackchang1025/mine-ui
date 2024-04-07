import { request } from '@/utils/request.js'

/**
 * 投注 API JS
 */

export default {

  /**
   * 获取投注分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'baccarat/simulatedBetting/index',
      method: 'get',
      params
    })
  },

  /**
   * 添加投注
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'baccarat/simulatedBetting/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新投注数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'baccarat/simulatedBetting/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取投注
   * @returns
   */
  read (id) {
    return request({
      url: 'baccarat/simulatedBetting/read/' + id,
      method: 'get',
    })
  },

  /**
   * 将投注删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'baccarat/simulatedBetting/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 更改投注数据
   * @returns
   */
  changeStatus (data = {}) {
    return request({
      url: 'baccarat/simulatedBetting/changeStatus',
      method: 'put',
      data
    })
  },

  /**
    * 投注导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'baccarat/simulatedBetting/import',
      method: 'post',
      data
    })
  },

  /**
   * 投注下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'baccarat/simulatedBetting/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 投注导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'baccarat/simulatedBetting/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}