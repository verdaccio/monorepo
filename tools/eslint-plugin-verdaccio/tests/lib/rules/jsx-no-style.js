/**
 * @fileoverview disallow style on jsx components
 * @author
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/jsx-no-style');
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
ruleTester.run('jsx-no-style', rule, {

  valid: [
    '<div/>',
    '<div className="test"/>',
    '<div className={"test"}/>',
    '<div foo/>'
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: '<Link to="/" style={{ marginRight: \'1em\' }}/>',
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    },
    {
      code: `<span key={String(index)} href={suggestion.link} style={{ fontWeight: fontWeight.semiBold }}>
      {part.text}
    </span>`,
      errors: [{
        message: rule.ERROR_MESSAGE,
        type: 'JSXOpeningElement'
      }]
    }
  ]
});
