/**
 * @fileoverview Disallows or enforces spaces inside of object literals.
 * @author Jamund Ferguson
 * @copyright 2014 Brandyn Bennett. All rights reserved.
 * @copyright 2014 Michael Ficarra. No rights reserved.
 * @copyright 2014 Vignesh Anand. All rights reserved.
 * @copyright 2015 Jamund Ferguson. All rights reserved.
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * @copyright 2015 Jonathan Kingston. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

var astUtils = require("../ast-utils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {
    var spaced = isSpaced(context.options[0]);

    /**
     * Decides if an option value should contain spaces or not
     * @param {Object} option - The value to decide if it is spaced
     * @returns {boolean} Whether or not the value is always spaced or not
     */
    function isSpaced(value) {
        return value === "always";
    }

    /**
     * Determines whether an option is set, relative to the spacing option.
     * If spaced is "always", then check whether option is set to false.
     * If spaced is "never", then check whether option is set to true.
     * @param {Object} option - The option to exclude.
     * @returns {boolean} Whether or not the property is excluded.
     */
    function isOptionSet(option) {
        return context.options[1] ? context.options[1][option] === !spaced : false;
    }

    /**
     * Determines whether an option is set, relative to the spacing option.
     * If option isn't set returns the default value of spaced
     * If an option is set then "always" return true otherwise false
     * @param {Object} option - The option to exclude.
     * @returns {boolean} Whether or not the property is excluded.
     */
    function getTypeDefault(option) {
        return context.options[1] && option in context.options[1] ? isSpaced(context.options[1][option]) : spaced;
    }

    var options = {
        spaced: spaced,
        arraysInObjectsException: isOptionSet("arraysInObjects"),
        objectsInObjectsException: isOptionSet("objectsInObjects"),
        ObjectPattern: getTypeDefault("ObjectPattern"),
        ObjectExpression: getTypeDefault("ObjectExpression"),
        ImportDeclaration: getTypeDefault("ImportDeclaration"),
        ExportNamedDeclaration: getTypeDefault("ExportNamedDeclaration")
    };

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Reports that there shouldn't be a space after the first token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportNoBeginningSpace(node, token) {
        context.report(node, token.loc.end,
            "There should be no space after '" + token.value + "'");
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportNoEndingSpace(node, token) {
        context.report(node, token.loc.start,
            "There should be no space before '" + token.value + "'");
    }

    /**
     * Reports that there should be a space after the first token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportRequiredBeginningSpace(node, token) {
        context.report(node, token.loc.end,
            "A space is required after '" + token.value + "'");
    }

    /**
     * Reports that there should be a space before the last token
     * @param {ASTNode} node - The node to report in the event of an error.
     * @param {Token} token - The token to use for the report.
     * @returns {void}
     */
    function reportRequiredEndingSpace(node, token) {
        context.report(node, token.loc.start,
            "A space is required before '" + token.value + "'");
    }

    /**
     * Determines if spacing in curly braces is valid.
     * @param {ASTNode} node The AST node to check.
     * @param {Token} first The first token to check (should be the opening brace)
     * @param {Token} second The second token to check (should be first after the opening brace)
     * @param {Token} penultimate The penultimate token to check (should be last before closing brace)
     * @param {Token} last The last token to check (should be closing brace)
     * @returns {void}
     */
    function validateBraceSpacing(node, first, second, penultimate, last, nodeType) {
        var spaced = options[nodeType],
            closingCurlyBraceMustBeSpaced =
            options.arraysInObjectsException && penultimate.value === "]" ||
            options.objectsInObjectsException && penultimate.value === "}"
                ? !spaced : spaced,
            firstSpaced, lastSpaced;

        if (astUtils.isTokenOnSameLine(first, second)) {
            firstSpaced = astUtils.isTokenSpaced(first, second);
            if (spaced && !firstSpaced) {
                reportRequiredBeginningSpace(node, first);
            }
            if (!spaced && firstSpaced) {
                reportNoBeginningSpace(node, first);
            }
        }

        if (astUtils.isTokenOnSameLine(penultimate, last)) {
            lastSpaced = astUtils.isTokenSpaced(penultimate, last);
            if (closingCurlyBraceMustBeSpaced && !lastSpaced) {
                reportRequiredEndingSpace(node, last);
            }
            if (!closingCurlyBraceMustBeSpaced && lastSpaced) {
                reportNoEndingSpace(node, last);
            }
        }
    }

    /**
     * Proxy method to checkForObject to pass node through as shared accoss two nodes
     * @param {ASTNode} node - An ObjectExpression or ObjectPattern node to check.
     * @returns {void}
     */
    function checkForObjectPattern(node) {
      return checkForObject(node, "ObjectPattern");
    }

    /**
     * Proxy method to checkForObject to pass node through as shared accoss two nodes
     * @param {ASTNode} node - An ObjectExpression or ObjectPattern node to check.
     * @returns {void}
     */
    function checkForObjectExpression(node) {
      return checkForObject(node, "ObjectExpression");
    }

    /**
     * Reports a given object node if spacing in curly braces is invalid.
     * @param {ASTNode} node - An ObjectExpression or ObjectPattern node to check.
     * @param {string} nodeType - A string representing the type "ObjectExpression" or "ObjectPattern".
     * @returns {void}
     */
    function checkForObject(node, nodeType) {
        if (node.properties.length === 0) {
            return;
        }

        var sourceCode = context.getSourceCode(),
            first = sourceCode.getFirstToken(node),
            last = sourceCode.getLastToken(node),
            second = sourceCode.getTokenAfter(first),
            penultimate = sourceCode.getTokenBefore(last);

        validateBraceSpacing(node, first, second, penultimate, last, nodeType);
    }

    /**
     * Reports a given import node if spacing in curly braces is invalid.
     * @param {ASTNode} node - An ImportDeclaration node to check.
     * @returns {void}
     */
    function checkForImport(node) {
        if (node.specifiers.length === 0) {
            return;
        }

        var sourceCode = context.getSourceCode(),
            firstSpecifier = node.specifiers[0],
            lastSpecifier = node.specifiers[node.specifiers.length - 1];

        if (lastSpecifier.type !== "ImportSpecifier") {
            return;
        }
        if (firstSpecifier.type !== "ImportSpecifier") {
            firstSpecifier = node.specifiers[1];
        }

        var first = sourceCode.getTokenBefore(firstSpecifier),
            last = sourceCode.getTokenAfter(lastSpecifier);

        // to support a trailing comma.
        if (last.value === ",") {
            last = sourceCode.getTokenAfter(last);
        }

        var second = sourceCode.getTokenAfter(first),
            penultimate = sourceCode.getTokenBefore(last);

        validateBraceSpacing(node, first, second, penultimate, last, "ImportDeclaration");
    }

    /**
     * Reports a given export node if spacing in curly braces is invalid.
     * @param {ASTNode} node - An ExportNamedDeclaration node to check.
     * @returns {void}
     */
    function checkForExport(node) {
        if (node.specifiers.length === 0) {
            return;
        }

        var sourceCode = context.getSourceCode(),
            firstSpecifier = node.specifiers[0],
            lastSpecifier = node.specifiers[node.specifiers.length - 1],
            first = sourceCode.getTokenBefore(firstSpecifier),
            last = sourceCode.getTokenAfter(lastSpecifier);

        // to support a trailing comma.
        if (last.value === ",") {
            last = sourceCode.getTokenAfter(last);
        }

        var second = sourceCode.getTokenAfter(first),
            penultimate = sourceCode.getTokenBefore(last);

        validateBraceSpacing(node, first, second, penultimate, last, "ExportNamedDeclaration");
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        // var {x} = y;
        ObjectPattern: checkForObjectPattern,

        // var y = {x: 'y'}
        ObjectExpression: checkForObjectExpression,

        // import {y} from 'x';
        ImportDeclaration: checkForImport,

        // export {name} from 'yo';
        ExportNamedDeclaration: checkForExport
    };

};

module.exports.schema = [
    {
        "enum": ["always", "never"]
    },
    {
        "type": "object",
        "properties": {
            "arraysInObjects": {
                "type": "boolean"
            },
            "objectsInObjects": {
                "type": "boolean"
            },
            "ObjectPattern": {
                "enum": ["always", "never"]
            },
            "ObjectExpression": {
                "enum": ["always", "never"]
            },
            "ImportDeclaration": {
                "enum": ["always", "never"]
            },
            "ExportNamedDeclaration": {
                "enum": ["always", "never"]
            }
        },
        "additionalProperties": false
    }
];
