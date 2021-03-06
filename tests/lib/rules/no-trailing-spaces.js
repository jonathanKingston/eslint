/**
 * @fileoverview Disallow trailing spaces at the end of lines.
 * @author Nodeca Team <https://github.com/nodeca>
 * @copyright 2015 Patrick McElhaney
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-trailing-spaces"),
    RuleTester = require("../../../lib/testers/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("no-trailing-spaces", rule, {

    valid: [
        {
            code: "var a = 5;",
            options: [{}]
        },
        {
            code: "var a = 5,\n    b = 3;",
            options: [{}]
        },
        {
            code: "var a = 5;"
        },
        {
            code: "var a = 5,\n    b = 3;"
        },
        {
            code: "var a = 5,\n    b = 3;",
            options: [{ skipBlankLines: true }]
        },
        {
            code: "     ",
            options: [{ skipBlankLines: true }]
        },
        {
            code: "\t",
            options: [{ skipBlankLines: true }]
        },
        {
            code: "     \n    var c = 1;",
            options: [{ skipBlankLines: true }]
        },
        {
            code: "\t\n\tvar c = 2;",
            options: [{ skipBlankLines: true }]
        },
        {
            code: "\n   var c = 3;",
            options: [{ skipBlankLines: true }]
        },
        {
            code: "\n\tvar c = 4;",
            options: [{ skipBlankLines: true }]
        }
    ],

    invalid: [
        {
            code: "var a = 5;      \n",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            output: "var a = 5;\n"
        },
        {
            code: "var a = 5; \n b = 3; ",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }, {
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            output: "var a = 5;\n b = 3;"
        },
        {
            code: "var a = 5;\t\n  b = 3;",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            output: "var a = 5;\n  b = 3;"
        },
        {
            code: "     \n    var c = 1;",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            output: "\n    var c = 1;"
        },
        {
            code: "\t\n\tvar c = 2;",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            output: "\n\tvar c = 2;"
        },
        {
            code: "var a = 5;      \n",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            options: [{}],
            output: "var a = 5;\n"
        },
        {
            code: "var a = 5; \n b = 3; ",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program",
                line: 1,
                column: 11
            }, {
                message: "Trailing spaces not allowed.",
                type: "Program",
                line: 2,
                column: 8
            }],
            options: [{}],
            output: "var a = 5;\n b = 3;"
        },
        {
            code: "var a = 5;\t\n  b = 3;",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program",
                line: 1,
                column: 11
            }],
            options: [{}],
            output: "var a = 5;\n  b = 3;"
        },
        {
            code: "     \n    var c = 1;",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program",
                line: 1,
                column: 1
            }],
            options: [{}],
            output: "\n    var c = 1;"
        },
        {
            code: "\t\n\tvar c = 2;",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program"
            }],
            options: [{}],
            output: "\n\tvar c = 2;"
        },
        {
            code: "var a = 'bar';  \n \n\t",
            errors: [{
                message: "Trailing spaces not allowed.",
                type: "Program",
                line: 1,
                column: 15 // there are invalid spaces in columns 15 and 16
            }],
            options: [{
                skipBlankLines: true
            }],
            output: "var a = 'bar';\n \n\t"
        }
    ]

});
