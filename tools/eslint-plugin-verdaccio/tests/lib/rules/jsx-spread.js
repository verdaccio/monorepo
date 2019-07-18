/**
 * @fileoverview spread over jsx
 * @author Juan Picado <juanpicado19@gmail.com>
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
const rule = require('../../../lib/rules/jsx-spread');
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
ruleTester.run('jsx-spread', rule, {

  valid: [
    '<div foo="1" bar="1"/>',
    '<div/>',
    '<div foo bar/>',
    {
      code: '<div {...props}/>',
      options: ['never'],
      parser: 'babel-eslint'
    },
    {
      code: '<div {...props} foo={"1"}/>',
      options: ['never']
    }
  ],

  invalid: [
    {
      code: '<div {...props}/>',
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    },
    {
      code: '<div foo {...props}/>',
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    },
    {
      code: '<div foo="1" {...props}/>',
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    },
    {
      code: '<Component foo="1" {...props}>test</Component>',
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    }
  ]
});
