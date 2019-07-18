/**
 * @fileoverview check the usage of nested objects as classnames
 * @author
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/jsx-no-classname-object');
const RuleTester = require('eslint').RuleTester;


// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------
const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true
  }
};

const ruleTester = new RuleTester({parserOptions});
ruleTester.run('jsx-no-classname-object', rule, {

  valid: [
    '<div className="{}"/>',
    '<div className={"test"}/>',
    '<div className="test"/>',
    '<div className={this.getClassName()}/>'
  ],

  invalid: [
    {
      code: '<div className={{fontSize: \'12px\'}}/>',
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    }
  ]
});
