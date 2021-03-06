const EntryTag = require('../models/EntryTag');
const BaseViewSet = require('./BaseViewSet');
const {requireAuthentication} = require('../authentication/jwt/middleware');
const _ = require('lodash');

class EntryTagViewSet extends BaseViewSet {

  constructor(options) {
    const clonedOptions = _.cloneDeep(options);
    clonedOptions.disabledActions = ['create', 'retrieve', 'delete', 'update'];
    super(EntryTag, clonedOptions);
  }

  getCommonMiddleware() {
    return [requireAuthentication];
  }

  getPageSize() {
    return 0;
  }

  getListQueryBuilder(ctx) {
    return EntryTag.getInProject(ctx.state.project.id);
  }

  async list(ctx, next) {
    let results = await super.list(ctx, next);
    results = results.map(entryTag => entryTag.name);
    ctx.body = results;
  }

}

module.exports = EntryTagViewSet;
