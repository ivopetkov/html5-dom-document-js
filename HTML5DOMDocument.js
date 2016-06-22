/*
 * HTML5 DOM Document JS
 * http://ivopetkov.com/
 * Copyright 2016, Ivo Petkov
 * Free to use under the MIT license.
 */

html5DOMDocument = (function () {

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
                if ((typeof scriptToExecute.async === 'undefined' || scriptToExecute.async === false) && i + 1 < scriptsToExecuteCount) {
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

    var insert = function (code) {
        executionsCounter++;
        var element = document.createElement('html');
        //code = '<html><head><style>*{border:2px solid red}</style><link rel="stylesheet" href="http://all.projects/playground/style.css"></link></head><body>AAAAAAAAAA<script>alert(1);</script><script src="http://all.projects/playground/alert.js"></script></body></html>';
        element.innerHTML = code;

        prepare(element, executionsCounter);

        var headElements = element.querySelectorAll('head');
        var headElementsCount = headElements.length;
        for (var i = 0; i < headElementsCount; i++) {
            document.head.insertAdjacentHTML('beforeend', headElements[i].innerHTML);
        }

        var bodyElements = element.querySelectorAll('body');
        var bodyElementsCount = bodyElements.length;
        for (var i = 0; i < bodyElementsCount; i++) {
            document.body.insertAdjacentHTML('beforeend', bodyElements[i].innerHTML);
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
