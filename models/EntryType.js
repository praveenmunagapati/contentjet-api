const Model = require('objection').Model;
const Project = require('./Project');
const User = require('./User');
const ValidationError = require('../errors/ValidationError');
const _ = require('lodash');
const validate = require('../utils/validate');


const entryTypeConstraints = {
  name: {
    presence: {
      allowEmpty: false
    },
    length: {
      minimum: 4
    }
  },
  description: {
    length: {
      minimum: 0
    }
  },
  metadata: {
    length: {
      minimum: 0
    }
  },
  projectId: {
    presence: true,
    numericality: {
      onlyInteger: true
    }
  },
  userId: {
    presence: true,
    numericality: {
      onlyInteger: true
    }
  },
  fields: {
    presence: {
      allowEmpty: true
    }
  }
};

const commonFieldConstraints = {
  fieldType: {
    presence: {
      allowEmpty: false
    }
  },
  name: {
    presence: true,
    length: {
      minimum: 4,
      maximum: 64
    }
  },
  label: {
    presence: true,
    length: {
      minimum: 4,
      maximum: 64
    }
  },
  description: {
    presence: {
      allowEmpty: true
    }
  },
  required: {
    boolean: true,
    presence: {
      allowEmpty: false
    }
  },
  disabled: {
    boolean: true,
    presence: {
      allowEmpty: false
    }
  }
};

const textFieldConstraints = {
  minLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 999,
      onlyInteger: true
    },
    lessThanAttribute: 'maxLength'
  },
  maxLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 1000,
      onlyInteger: true
    }
  },
  format: {
    presence: true,
    inclusion: {
      within: [
        'plaintext',
        'uri',
        'email'
      ],
      message: 'invalid'
    }
  }
};

const longTextFieldConstraints = {
  minLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 29999,
      onlyInteger: true
    },
    lessThanAttribute: 'maxLength'
  },
  maxLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 50000,
      onlyInteger: true
    }
  },
  format: {
    presence: true,
    inclusion: {
      within: [
        'plaintext',
        'markdown'
      ],
      message: 'invalid'
    }
  }
};

const booleanFieldConstraints = {
  labelTrue: {
    presence: true,
    length: {
      minimum: 1,
      maximum: 32
    }
  },
  labelFalse: {
    presence: true,
    length: {
      minimum: 1,
      maximum: 32
    }
  }
};

const numberFieldConstraints = {
  minValue: {
    numericality: true,
    lessThanAttribute: 'maxValue'
  },
  maxValue: {
    numericality: true
  },
  format: {
    presence: true,
    inclusion: {
      within: [
        'number',
        'integer'
      ],
      message: 'invalid'
    }
  }
};

const dateFieldConstraints = {
  format: {
    presence: true,
    inclusion: {
      within: [
        'datetime',
        'date'
      ],
      message: 'invalid'
    }
  }
};

const choiceFieldConstraints = {
  choices: {
    presence: true,
    arrayLength: {
      minimum: 2,
      maximum: 128
    },
    uniqueArray: true
  },
  format: {
    presence: true,
    inclusion: {
      within: [
        'single',
        'multiple'
      ],
      message: 'invalid'
    }
  }
};

const colorFieldConstraints = {
  format: {
    presence: true,
    inclusion: {
      within: [
        'rgb',
        'rgba'
      ],
      message: 'invalid'
    }
  }
};

const mediaFieldConstraints = {
  minLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 999,
      onlyInteger: true
    },
    lessThanAttribute: 'maxLength'
  },
  maxLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 1000,
      onlyInteger: true
    }
  }
};

const linkFieldConstraints = {
  minLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 999,
      onlyInteger: true
    },
    lessThanAttribute: 'maxLength'
  },
  maxLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 1000,
      onlyInteger: true
    }
  }
};

const listFieldConstraints = {
  minLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 999,
      onlyInteger: true
    },
    lessThanAttribute: 'maxLength'
  },
  maxLength: {
    presence: true,
    numericality: {
      greaterThanOrEqualTo: 1,
      lessThanOrEqualTo: 1000,
      onlyInteger: true
    }
  }
};

const fieldTypeConstraints = {
  TEXT: Object.assign({}, commonFieldConstraints, textFieldConstraints),
  LONGTEXT: Object.assign({}, commonFieldConstraints, longTextFieldConstraints),
  BOOLEAN: Object.assign({}, commonFieldConstraints, booleanFieldConstraints),
  NUMBER: Object.assign({}, commonFieldConstraints, numberFieldConstraints),
  DATE: Object.assign({}, commonFieldConstraints, dateFieldConstraints),
  CHOICE: Object.assign({}, commonFieldConstraints, choiceFieldConstraints),
  COLOR: Object.assign({}, commonFieldConstraints, colorFieldConstraints),
  MEDIA: Object.assign({}, commonFieldConstraints, mediaFieldConstraints),
  LINK: Object.assign({}, commonFieldConstraints, linkFieldConstraints),
  LIST: Object.assign({}, commonFieldConstraints, listFieldConstraints)
};

const fieldTypes = Object.keys(fieldTypeConstraints);

class EntryType extends Model {

  static get tableName() {
    return 'entryType';
  }

  static get relationMappings() {
    return {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'entryType.projectId',
          to: 'project.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'entryType.userId',
          to: 'user.id'
        }
      }
    };
  }

  $beforeValidate(jsonSchema, json, opt) {
    // Validate top-level fields
    let errors = validate(json, entryTypeConstraints);
    if (errors) {
      let err = new ValidationError();
      err.errors = errors;
      throw err;
    }
    // Validate all fields have unique names
    const fieldNames = json.fields.map(field => field.name);
    if (fieldNames.length !== _.uniq(fieldNames).length) {
      throw new ValidationError('Field names must be unique');
    }
    let fieldErrors = {};
    json.fields.forEach(field => {
      // Validate field type
      let fieldTypeError = validate.single(field.fieldType, {inclusion: fieldTypes});
      if (fieldTypeError) {
        throw new ValidationError(`'${field.fieldType}' is not a valid field type`);
      }
      // Validate each field against it's fieldType constraints
      let constraints = fieldTypeConstraints[field.fieldType];
      let errors = validate(field, constraints);
      if (errors) fieldErrors[field.name] = errors;
    });
    if (!_.isEmpty(fieldErrors)) {
      let err = new ValidationError();
      err.errors = {fields: fieldErrors};
      throw err;
    }
    return jsonSchema;
  }

  static get jsonSchema() {
    const commonFieldAttributes = {
      name: {
        type: 'string',
        minLength: 4,
        maxLength: 64
      },
      label: {
        type: 'string',
        minLength: 4,
        maxLength: 64
      },
      description: {
        type: 'string',
        default: '',
        maxLength: 128
      },
      required: {
        type: 'boolean',
        default: false
      },
      disabled: {
        type: 'boolean',
        default: false
      }
    };
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        id: {
          type: 'integer'
        },
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 64
        },
        description: {
          type: 'string',
          default: '',
          maxLength: 128
        },
        metadata: {
          type: 'string',
          default: '',
          maxLength: 3000
        },
        projectId: {
          type: 'integer'
        },
        userId: {
          type: 'integer'
        },
        fields: {
          type: 'array',
          items: {
            type: 'object',
            oneOf: [
              // TEXT
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^TEXT$'
                    },
                    minLength: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 999
                    },
                    maxLength: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 1000
                    },
                    format: {
                      type: 'string',
                      enum: [
                        'plaintext',
                        'uri',
                        'email'
                      ]
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'minLength',
                  'maxLength',
                  'format'
                ]
              },
              // LONGTEXT
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^LONGTEXT$'
                    },
                    minLength: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 29999
                    },
                    maxLength: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 50000
                    },
                    format: {
                      type: 'string',
                      enum: [
                        'plaintext',
                        'markdown'
                      ]
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'minLength',
                  'maxLength',
                  'format'
                ]
              },
              // BOOLEAN
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^BOOLEAN$'
                    },
                    labelTrue: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 32
                    },
                    labelFalse: {
                      type: 'string',
                      minLength: 1,
                      maxLength: 32
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'labelTrue',
                  'labelFalse'
                ]
              },
              // NUMBER
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^NUMBER$'
                    },
                    minValue: {
                      type: 'number'
                    },
                    maxValue: {
                      type: 'number'
                    },
                    format: {
                      type: 'string',
                      enum: [
                        'number',
                        'integer'
                      ]
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'minValue',
                  'maxValue',
                  'format'
                ]
              },
              // DATE
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^DATE$'
                    },
                    format: {
                      type: 'string',
                      enum: [
                        'datetime',
                        'date'
                      ]
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'format'
                ]
              },
              // CHOICE
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^CHOICE$'
                    },
                    choices: {
                      type: 'array',
                      items: {
                        type: 'string'
                      },
                      minLength: 2,
                      maxLength: 128
                    },
                    format: {
                      type: 'string',
                      enum: [
                        'single',
                        'multiple'
                      ]
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'choices',
                  'format'
                ]
              },
              // COLOR
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^COLOR$'
                    },
                    format: {
                      type: 'string',
                      enum: [
                        'rgb',
                        'rgba'
                      ]
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'format'
                ]
              },
              // MEDIA
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^MEDIA$'
                    },
                    minLength: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 999
                    },
                    maxLength: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 1000
                    }
                  }, commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'minLength',
                  'maxLength'
                ]
              },
              // LINK
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^LINK$'
                    },
                    minLength: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 999
                    },
                    maxLength: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 1000
                    }
                  },
                  commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'minLength',
                  'maxLength'
                ]
              },
              // LIST
              {
                properties: Object.assign(
                  {
                    fieldType: {
                      type: 'string',
                      pattern: '^LIST$'
                    },
                    minLength: {
                      type: 'integer',
                      minimum: 0,
                      maximum: 999
                    },
                    maxLength: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 1000
                    }
                  },
                  commonFieldAttributes
                ),
                additionalProperties: false,
                required: [
                  'fieldType',
                  'name',
                  'label',
                  'description',
                  'required',
                  'disabled',
                  'minLength',
                  'maxLength'
                ]
              }
            ]
          }
        },
        createdAt: {
          type: 'string',
          format: 'date-time'
        },
        modifiedAt: {
          type: 'string',
          format: 'date-time'
        }
      },
      required: [
        'name',
        'projectId',
        'userId'
      ]
    };
  }

  static getById(id, trx) {
    return EntryType.query(trx)
      .where('id', id)
      .first();
  }

  static existsInProject(id, projectId, trx) {
    return EntryType.query(trx)
      .where({id, projectId})
      .count('*')
      .first()
      .then(result => {
        return !!parseInt(result.count);
      });
  }

  async validateEntryFields(fields, projectId) {
    const constraints = {};
    for (let field of this.fields) {
      if (field.disabled) continue;
      let fieldConstraints = {};
      if (field.required) fieldConstraints.presence = true;
      if (field.fieldType === 'TEXT') {
        if (field.format === 'uri') {
          fieldConstraints.url = true;
        } else if (field.format === 'email') {
          fieldConstraints.email = true;
        }
      } else if (field.fieldType === 'TEXT' || field.fieldType === 'LONGTEXT') {
        fieldConstraints.length = {
          minimum: field.minLength,
          maximum: field.maxLength
        };
      } else if (field.fieldType === 'DATE') {
        if (field.format === 'datetime') {
          fieldConstraints.datetime = true;
        } else if (field.format === 'date') {
          fieldConstraints.date = true;
        }
      } else if (field.fieldType === 'BOOLEAN') {
        fieldConstraints.boolean = true;
      } else if (field.fieldType === 'NUMBER') {
        fieldConstraints.numericality = {
          greaterThanOrEqualTo: field.minValue,
          lessThanOrEqualTo: field.maxValue
        };
        if (field.format === 'integer') {
          fieldConstraints.numericality.onlyInteger = true;
        }
      } else if (field.fieldType === 'CHOICE') {
        fieldConstraints.choicesUnion = {choices: field.choices};
        if (field.format === 'single') {
          fieldConstraints.arrayLength = {is: 1};
        } else if (field.format === 'multiple') {
          fieldConstraints.arrayLength = {minimum: 1};
          fieldConstraints.uniqueArray = true;
        }
      } else if (field.fieldType === 'COLOR') {
        if (field.format === 'rgb') {
          fieldConstraints.format = {
            pattern: /^#[0-9a-fA-F]{6}$/,
            message: 'invalid rgb hex value (should be formatted #000000)'
          };
        } else if (field.format === 'rgba') {
          fieldConstraints.format = {
            pattern: /^#[0-9a-fA-F]{8}$/,
            message: 'invalid rgba hex value (should be formatted #00000000)'
          };
        }
      } else if (field.fieldType === 'MEDIA') {
        fieldConstraints.media = { projectId };
        fieldConstraints.arrayLength = {
          minimum: field.minLength,
          maximum: field.maxLength
        };
      } else if (field.fieldType === 'LINK') {
        fieldConstraints.entries = { projectId };
        fieldConstraints.arrayLength = {
          minimum: field.minLength,
          maximum: field.maxLength
        };
      } else if (field.fieldType === 'LIST') {
        fieldConstraints.arrayOfStrings = true;
        fieldConstraints.arrayLength = {
          minimum: field.minLength,
          maximum: field.maxLength
        };
      }
      constraints[field.name] = fieldConstraints;
    }
    return validate.async(fields, constraints);
  }

}

module.exports = EntryType;
