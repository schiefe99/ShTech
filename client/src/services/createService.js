import { SITE } from '../config'
import { createApiService } from './createApiService'
import { createLocalService } from './createLocalService'

/**
 * Escolhe de ONDE vêm os dados, conforme SITE.dataSource no config.js:
 *   'api'   → servidor Node + SQLite (dados compartilhados, editáveis no admin)
 *   'local' → localStorage do navegador (funciona sem servidor)
 *
 * É aqui que o padrão "service" se paga: trocar a fonte de dados
 * do site inteiro é mudar UMA palavra.
 */
export function createService(options) {
  return SITE.dataSource === 'api' ? createApiService(options) : createLocalService(options)
}
