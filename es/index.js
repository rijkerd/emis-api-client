import axios from 'axios';
import { isEmpty, camelCase, toLower, get } from 'lodash';
import { singularize, pluralize } from 'inflection';

// default http client
let client;

// supported content type
const CONTENT_TYPE = 'application/json';

// default http headers
const HEADERS = {
  Accept: CONTENT_TYPE,
  'Content-Type': CONTENT_TYPE,
};

/**
 * @function createHttpClient
 * @name createHttpClient
 * @description create an http client if not exists
 * @param  {String} API_URL base url to use to api calls
 * @return {Axios} A new instance of Axios
 * @since 0.1.0
 * @version 0.1.0
 * @static
 * @public
 * @example
 * import { createHttpClient } from 'emis-api-client';
 * const httpClient = createHttpClient();
 */
const createHttpClient = API_BASE_URL => {
  if (!client) {
    // Dont destructure: Fix:ReferenceError: process is not defined in react
    const env = process.env; // eslint-disable-line
    const { EMIS_API_URL, REACT_APP_EMIS_API_URL } = env;
    const BASE_URL = API_BASE_URL || EMIS_API_URL || REACT_APP_EMIS_API_URL;
    const options = { baseURL: BASE_URL, headers: HEADERS };
    client = axios.create(options);
    client.id = Date.now();
  }
  return client;
};

/**
 * @function disposeHttpClient
 * @name disposeHttpClient
 * @description reset current http client in use.
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { disposeHttpClient } from 'emis-api-client';
 * disposeHttpClient();
 */
const disposeHttpClient = () => {
  client = null;
  return client;
};

/**
 * @function get
 * @name get
 * @description issue http get request to specified url.
 * @param {String} url valid http path.
 * @param {Object} [params] params that will be encoded into url query params.
 * @return {Promise} promise resolve with data on success or error on failure.
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { get } from 'emis-api-client';
 *
 * // list
 * const getUsers = get('/users', { age: { $in: [1, 2] } });
 * getUsers.then(users => { ... }).catch(error => { ... });
 *
 * // single
 * const getUser = get('/users/12');
 * getUser.then(user => { ... }).catch(error => { ... });
 */
const get$1 = (url, params) => {
  const httpClient = createHttpClient();
  return httpClient.get(url, { params });
};

/**
 * @function post
 * @name post
 * @description issue http post request to specified url.
 * @param {String} url valid http path.
 * @param {Object} data request payload to be encoded on http request body
 * @return {Promise} promise resolve with data on success or error on failure.
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { post } from 'emis-api-client';
 *
 * const postUser = post('/users', { age: 14 });
 * postUser.then(user => { ... }).catch(error => { ... });
 */
const post = (url, data) => {
  if (isEmpty(data)) {
    return Promise.reject(new Error('Missing Payload'));
  }
  const httpClient = createHttpClient();
  return httpClient.post(url, data);
};

/**
 * @function put
 * @name put
 * @description issue http put request to specified url.
 * @param {String} url valid http path.
 * @param {Object} data request payload to be encoded on http request body
 * @return {Promise} promise resolve with data on success or error on failure.
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { put } from 'emis-api-client';
 *
 * const putUser = put('/users/5c1766243c9d520004e2b542', { age: 11 });
 * putUser.then(user => { ... }).catch(error => { ... });
 */
const put = (url, data) => {
  if (isEmpty(data)) {
    return Promise.reject(new Error('Missing Payload'));
  }
  const httpClient = createHttpClient();
  return httpClient.put(url, data);
};

/**
 * @function patch
 * @name patch
 * @description issue http patch request to specified url.
 * @param {String} url valid http path.
 * @param {Object} data request payload to be encoded on http request body
 * @return {Promise} promise resolve with data on success or error on failure.
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { patch } from 'emis-api-client';
 *
 * const patchUser = patch('/users/5c1766243c9d520004e2b542', { age: 10 });
 * patchUser.then(user => { ... }).catch(error => { ... });
 */
const patch = (url, data) => {
  if (isEmpty(data)) {
    return Promise.reject(new Error('Missing Payload'));
  }
  const httpClient = createHttpClient();
  return httpClient.patch(url, data);
};

/**
 * @function del
 * @name del
 * @description issue http delete request to specified url.
 * @param {String} url valid http path.
 * @return {Promise} promise resolve with data on success or error on failure.
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { del } from 'emis-api-client';
 *
 * const deleteUser = del('/users/5c1766243c9d520004e2b542');
 * deleteUser.then(user => { ... }).catch(error => { ... });
 */
const del = url => {
  const httpClient = createHttpClient();
  return httpClient.delete(url);
};

// create dynamic camelized function name
const fn = (...name) => camelCase([...name].join(' '));

// get resource id from payload
const idOf = data => get(data, '_id') || get(data, 'id');

/**
 * @function createHttpActionsFor
 * @name createHttpActionsFor
 * @description generate name http action shortcut to interact with resource
 * @param {String} resource valid http resource.
 * @return {Object} http actions to interact with a resource
 * @since 0.1.0
 * @version 0.1.0
 * @example
 * import { createHttpActionsFor } from 'emis-api-client';
 *
 * const { deleteUser } = createHttpActionsFor('user');
 * const deleteUser = del('/users/5c1766243c9d520004e2b542');
 * deleteUser.then(user => { ... }).catch(error => { ... });
 */
const createHttpActionsFor = resource => {
  const singular = singularize(resource);
  const plural = pluralize(resource);
  const httpActions = {
    [fn('get', singular, 'Schema')]: () =>
      get$1(`/${toLower(plural)}/schema`).then(response => response.data),
    [fn('get', plural)]: params =>
      get$1(`/${toLower(plural)}`, params).then(response => response.data),
    [fn('get', singular)]: id =>
      get$1(`/${toLower(plural)}/${id}`).then(response => response.data),
    [fn('post', singular)]: data =>
      post(`/${toLower(plural)}`, data).then(response => response.data),
    [fn('put', singular)]: data =>
      put(`/${toLower(plural)}/${idOf(data)}`, data).then(
        response => response.data
      ),
    [fn('patch', singular)]: data =>
      patch(`/${toLower(plural)}/${idOf(data)}`, data).then(
        response => response.data
      ),
    [fn('delete', singular)]: id =>
      del(`/${toLower(plural)}/${id}`).then(response => response.data),
  };
  return httpActions;
};

const {
  getActivitySchema,
  getActivities,
  getActivity,
  postActivity,
  putActivity,
  patchActivity,
  deleteActivity,
} = createHttpActionsFor('activity');

const {
  getAdjustmentSchema,
  getAdjustments,
  getAdjustment,
  postAdjustment,
  putAdjustment,
  patchAdjustment,
  deleteAdjustment,
} = createHttpActionsFor('adjustment');

const {
  getAlertSchema,
  getAlerts,
  getAlert,
  postAlert,
  putAlert,
  patchAlert,
  deleteAlert,
} = createHttpActionsFor('alert');

const {
  getAssessmentSchema,
  getAssessments,
  getAssessment,
  postAssessment,
  putAssessment,
  patchAssessment,
  deleteAssessment,
} = createHttpActionsFor('assessment');

const {
  getFeatureSchema,
  getFeatures,
  getFeature,
  postFeature,
  putFeature,
  patchFeature,
  deleteFeature,
} = createHttpActionsFor('feature');

const {
  getIncidentTypeSchema,
  getIncidentTypes,
  getIncidentType,
  postIncidentType,
  putIncidentType,
  patchIncidentType,
  deleteIncidentType,
} = createHttpActionsFor('incidentType');

const {
  getIndicatorSchema,
  getIndicators,
  getIndicator,
  postIndicator,
  putIndicator,
  patchIndicator,
  deleteIndicator,
} = createHttpActionsFor('indicator');

const {
  getItemSchema,
  getItems,
  getItem,
  postItem,
  putItem,
  patchItem,
  deleteItem,
} = createHttpActionsFor('item');

const {
  getPartySchema,
  getParties,
  getParty,
  postParty,
  putParty,
  patchParty,
  deleteParty,
} = createHttpActionsFor('party');

const {
  getPermissionSchema,
  getPermissions,
  getPermission,
  postPermission,
  putPermission,
  patchPermission,
  deletePermission,
} = createHttpActionsFor('permission');

const {
  getPlanSchema,
  getPlans,
  getPlan,
  postPlan,
  putPlan,
  patchPlan,
  deletePlan,
} = createHttpActionsFor('plan');

const {
  getProcedureSchema,
  getProcedures,
  getProcedure,
  postProcedure,
  putProcedure,
  patchProcedure,
  deleteProcedure,
} = createHttpActionsFor('procedure');

const {
  getQuestionSchema,
  getQuestions,
  getQuestion,
  postQuestion,
  putQuestion,
  patchQuestion,
  deleteQuestion,
} = createHttpActionsFor('question');

const {
  getQuestionnaireSchema,
  getQuestionnaires,
  getQuestionnaire,
  postQuestionnaire,
  putQuestionnaire,
  patchQuestionnaire,
  deleteQuestionnaire,
} = createHttpActionsFor('questionnaire');

const {
  getRoleSchema,
  getRoles,
  getRole,
  postRole,
  putRole,
  patchRole,
  deleteRole,
} = createHttpActionsFor('role');

const {
  getStockSchema,
  getStocks,
  getStock,
  postStock,
  putStock,
  patchStock,
  deleteStock,
} = createHttpActionsFor('stock');

const {
  getWarehouseSchema,
  getWarehouses,
  getWarehouse,
  postWarehouse,
  putWarehouse,
  patchWarehouse,
  deleteWarehouse,
} = createHttpActionsFor('warehouse');

export { getActivitySchema, getActivities, getActivity, postActivity, putActivity, patchActivity, deleteActivity, getAdjustmentSchema, getAdjustments, getAdjustment, postAdjustment, putAdjustment, patchAdjustment, deleteAdjustment, getAlertSchema, getAlerts, getAlert, postAlert, putAlert, patchAlert, deleteAlert, getAssessmentSchema, getAssessments, getAssessment, postAssessment, putAssessment, patchAssessment, deleteAssessment, getFeatureSchema, getFeatures, getFeature, postFeature, putFeature, patchFeature, deleteFeature, getIncidentTypeSchema, getIncidentTypes, getIncidentType, postIncidentType, putIncidentType, patchIncidentType, deleteIncidentType, getIndicatorSchema, getIndicators, getIndicator, postIndicator, putIndicator, patchIndicator, deleteIndicator, getItemSchema, getItems, getItem, postItem, putItem, patchItem, deleteItem, getPartySchema, getParties, getParty, postParty, putParty, patchParty, deleteParty, getPermissionSchema, getPermissions, getPermission, postPermission, putPermission, patchPermission, deletePermission, getPlanSchema, getPlans, getPlan, postPlan, putPlan, patchPlan, deletePlan, getProcedureSchema, getProcedures, getProcedure, postProcedure, putProcedure, patchProcedure, deleteProcedure, getQuestionSchema, getQuestions, getQuestion, postQuestion, putQuestion, patchQuestion, deleteQuestion, getQuestionnaireSchema, getQuestionnaires, getQuestionnaire, postQuestionnaire, putQuestionnaire, patchQuestionnaire, deleteQuestionnaire, getRoleSchema, getRoles, getRole, postRole, putRole, patchRole, deleteRole, getStockSchema, getStocks, getStock, postStock, putStock, patchStock, deleteStock, getWarehouseSchema, getWarehouses, getWarehouse, postWarehouse, putWarehouse, patchWarehouse, deleteWarehouse, CONTENT_TYPE, HEADERS, createHttpClient, disposeHttpClient, get$1 as get, post, put, patch, del, createHttpActionsFor };
