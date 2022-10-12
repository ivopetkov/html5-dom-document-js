/*
 * HTML5 DOM Document JS
 * http://ivopetkov.com/
 * Copyright (c) Ivo Petkov
 * Free to use under the MIT license.
 */

var html5DOMDocument = typeof html5DOMDocument !== 'undefined' ? html5DOMDocument : (function () {

    var executionsCounter = 0;

    var prepare = function (element, counter) {
        var scripts = element.querySelectorAll('script');
        var scriptsCount = scripts.length;
        for (var i = 0; i < scriptsCount; i++) {
            scripts[i].setAttribute('data-html5-dom-document-script-' + counter, '1');
        }
    };

    var execute = function (element, counter) {
        var scriptsToExecute = element.querySelectorAll('[data-html5-dom-document-script-' + counter + ']');
        var scriptsToExecuteCount = scriptsToExecute.length;
        for (var i = 0; i < scriptsToExecuteCount; i++) {
            var breakAfterThisScript = false;
            var scriptToExecute = scriptsToExecute[i];
            scriptToExecute.removeAttribute('data-html5-dom-document-script-' + counter);
            var newScriptTag = document.createElement('script');
            var type = scriptToExecute.getAttribute('type');
            if (type !== null) {
                newScriptTag.setAttribute("type", type);
            }
            var src = scriptToExecute.getAttribute('src');
            if (src !== null) {
                newScriptTag.setAttribute("src", src);
                var asyncValue = scriptToExecute.getAttribute('async');
                if ((asyncValue === null || asyncValue === 'false') && i + 1 < scriptsToExecuteCount) {
                    breakAfterThisScript = true;
                    newScriptTag.addEventListener('load', function () {
                        execute(element, counter);
                    });
                }
            }
            newScriptTag.innerHTML = scriptToExecute.innerHTML;
            scriptToExecute.parentNode.insertBefore(newScriptTag, scriptToExecute);
            scriptToExecute.parentNode.removeChild(scriptToExecute);
            if (breakAfterThisScript) {
                break;
            }
        }
    };

    /**
     * 
     * @param string code
     * @param string target Available values: afterBodyBegin, beforeBodyEnd, [element, innerHTML], [element, outerHTML], [element, beforeBegin], [element, afterBegin], [element, beforeEnd], [element, afterEnd]
     */
    var insert = function (code, target) {
        if (typeof target === 'undefined') {
            target = 'beforeBodyEnd';
        }

        executionsCounter++;

        var doc = (new DOMParser()).parseFromString(code, 'text/html');

        var copyAttributes = function (sourceElement, targetElement) {
            var sourceElementAttributes = sourceElement.attributes;
            var attributesCount = sourceElementAttributes.length;
            for (var i = 0; i < attributesCount; i++) {
                var attribute = sourceElementAttributes[i];
                targetElement.setAttribute(attribute.name, attribute.value);
            }
        };

        prepare(doc, executionsCounter);

        var sourceHtmlElement = doc.querySelector('html');
        var targetHtmlElement = document.querySelector('html');
        if (sourceHtmlElement !== null && targetHtmlElement !== null) {
            copyAttributes(sourceHtmlElement, targetHtmlElement);
        }

        var headElement = doc.querySelector('head');
        if (headElement !== null) {
            copyAttributes(headElement, document.head);
            document.head.insertAdjacentHTML('beforeend', headElement.innerHTML);
        }

        var bodyElement = doc.querySelector('body');
        if (bodyElement !== null) {
            copyAttributes(bodyElement, document.body);
            if (target === 'afterBodyBegin') {
                document.body.insertAdjacentHTML('afterbegin', bodyElement.innerHTML);
            } else if (target === 'beforeBodyEnd') {
                document.body.insertAdjacentHTML('beforeend', bodyElement.innerHTML);
            } else if (typeof target === 'object' && typeof target[0] !== 'undefined') {
                if (typeof target[1] === 'undefined') {
                    target[1] = 'innerHTML';
                }
                if (target[1] === 'innerHTML') {
                    target[0].innerHTML = bodyElement.innerHTML;
                } else if (target[1] === 'outerHTML') {
                    target[0].outerHTML = bodyElement.innerHTML;
                } else if (target[1] === 'beforeBegin') {
                    target[0].insertAdjacentHTML('beforebegin', bodyElement.innerHTML);
                } else if (target[1] === 'afterBegin') {
                    target[0].insertAdjacentHTML('afterend', bodyElement.innerHTML);
                } else if (target[1] === 'beforeEnd') {
                    target[0].insertAdjacentHTML('beforeend', bodyElement.innerHTML);
                } else if (target[1] === 'afterEnd') {
                    target[0].insertAdjacentHTML('afterend', bodyElement.innerHTML);
                }
            }
        }

        execute(document, executionsCounter);
    };

    var evalElement = function (element) {
        executionsCounter++;
        prepare(element, executionsCounter);
        execute(element, executionsCounter);
    };

    return {
        'insert': insert,
        'evalElement': evalElement
    };

}());
