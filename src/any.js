({

    /**
     * 제이쿼리 시작
     * 
     * @returns {string|null} 문자열 또는 널 값
     */
    tag: function () {
        return this[0] && this[0].tagName != null ? this[0].tagName.toUpperCase() : null;
    },

    control: function () {
        var name = null;

        for (var i = 0, ii = arguments.length; i < ii; i++) {
            var arg = arguments[i];
            if (arg == null) {
                continue;
            }
            if (typeof (arg) === "function") {
                this.on("any-initialize", arg);
            } else if (typeof (arg) === "string" && any.control != null && any.control.controls != null && any.control.controls[arg.toLowerCase()] != null) {
                this.attr(arg, "");
                name = arg;
            }
        }

        this.each(function () {
            var $this = jQuery(this);
            if ($this.hasAttr("any-control-plugins") == true) {
                var controlName = $this.attrControlName();
                if (controlName != null) {
                    var pluginNames = $this.attr("any-control-plugins").split(",");
                    $this.data("any-control-plugin-names", pluginNames);
                    for (var i = 0, ii = pluginNames.length; i < ii; i++) {
                        var pluginName = any.text.trim(pluginNames[i]);
                        var pluginResources = any.control.controls[controlName].pluginResources[pluginName.toLowerCase()];
                        for (var i = 0, ii = pluginResources.length; i < ii; i++) {
                            if (pluginResources[i].resourceAdded === true) {
                                continue;
                            }
                            any.control(controlName).resource(pluginResources[i].src, pluginResources[i].async);
                            pluginResources[i].resourceAdded = true;
                        }
                    }
                }
            }
            if ($this.data("any-control-name") == null) {
                any.control(this).activate(name);
            }
        });

        if (this.length > 0) {
            any.control().initialize(this);
        }

        return this;
    },

    /**
     * 컨트롤즈
     *
     * @param {callback}
     * @returns {jQuery}
     */
    controls: function (callback) {
        if (this.length > 0) {
            if (any.control().initialize(this).length == 0) {
                if (callback != null) {
                    callback.apply(this);
                }
            } else if (callback != null && this.data("any-checkContextControlReady") != true) {
                this.data("any-checkContextControlReady", true);
                checkContextControlReady(this, function () {
                    this.removeData("any-checkContextControlReady");
                    callback.apply(this);
                });
            }
        }

        return this;

        function checkContextControlReady(context, callback) {
            if (any.control().checkActivated(context) != true) {
                window.setTimeout(function () {
                    checkContextControlReady(context, callback);
                }, 50);
                return;
            }

            if (any.control().checkReady(context) != true) {
                window.setTimeout(function () {
                    checkContextControlReady(context, callback);
                }, 50);
                return;
            }

            if (callback != null) {
                callback.apply(context);
            }
        }
    },

    attrControlName: function () {
        for (var item in any.control.controls) {
            if (this.hasAttr(item) == true) {
                return item.toLowerCase();
            }
        }
    },

    controlName: function (inheritLevel) {
        var controlName = this.data("any-control-name");

        if (inheritLevel === true || typeof (inheritLevel) === "number") {
            var loopCount = 0;
            while (any.control.controls[controlName] != null && any.control.controls[controlName].inherit != null) {
                if (inheritLevel !== true && loopCount >= inheritLevel) {
                    break;
                }
                controlName = any.control.controls[controlName].inherit.name;
                loopCount++;
            }
        }

        return controlName;
    },

    element: function () {
        if (this[0] && "element" in this[0]) {
            return this[0].element();
        }
    },

    hasAttr: function (name) {
        return typeof (this.attr(name)) !== "undefined" || (this[0] && typeof (this[0][name]) !== "undefined");
    },

    copyAttr: function (name, targetObject, targetName) {
        if (this.hasAttr(name) == true) {
            targetObject.attr(targetName == null ? name : targetName, this.attr(name));
        }

        return this;
    },

    defineMethod: function (name, func) {
        if (name == null || func == null) {
            return;
        }

        for (var i = 0, ii = this.length; i < ii; i++) {
            this[i][name] = func;
        }

        return this;
    },

    defineProperty: function (name, func) {
        if (name == null || func == null) {
            return;
        }

        for (var i = 0, ii = this.length; i < ii; i++) {
            var attr = this.eq(i).data("any-attr-" + name);

            if (attr == null) {
                this.eq(i).data("any-attr-" + name, attr = this.eq(i).attr(name));
            }

            if (attr == null) {
                attr = this[i][name];
            }

            try {
                Object.defineProperty(this[i], name, func);
            } catch (e) {
                if (func.get != null) {
                    try {
                        this[i].prototype.__defineGetter__(name, func.get);
                    } catch (e) {
                    }
                }
                if (func.set != null) {
                    try {
                        this[i].prototype.__defineSetter__(name, func.set);
                    } catch (e) {
                    }
                }
            }

            if (this.eq(i).data("any-properties") == null) {
                this.eq(i).data("any-properties", {});
            }

            this.eq(i).data("any-properties")[name] = func;

            if (attr != null) {
                this.eq(i).prop(name, attr);
            }
        }

        return this;
    },

    hasProp: function (name) {
        if (this[0] == null) {
            return;
        }
        if (name == null) {
            return;
        }

        var props = this.data("any-properties");

        if (props == null || props[name] == null) {
            return Object.prototype.hasOwnProperty.call(this[0], name);
        }

        return props[name] != null;
    },

    prop: function (name, value) {
        if (this.length == 0) {
            return this;
        }

        if (this[0] == null) {
            return;
        }
        if (name == null) {
            return;
        }

        var props = this.data("any-properties");

        if (props == null || props[name] == null) {
            return this.prop_origin.apply(this, arguments);
        }

        if (arguments.length == 1) {
            return props[name].get.apply(this[0]);
        }

        for (var i = 0, ii = this.length; i < ii; i++) {
            if (this.eq(i).data("any-properties")[name].set != null) {
                this.eq(i).data("any-properties")[name].set.apply(this[i], [value]);
            }
        }

        return this;
    },

    exec: function (name) {
        if (this.length == 0) {
            return this;
        }

        var args = Array.prototype.slice.call(arguments, 1);
        var result = null;

        this.each(function () {
            if (name in this) {
                result = this[name].apply(this, args || []);
            } else {
                throw new Error((this.tagName == null ? "" : this.tagName) + (this.id == null ? "" : "#" + this.id) + " - No such method : " + name);
            }
        });

        if (typeof (result) === "undefined") {
            return this;
        }

        return result;
    },

    val: function (value) {
        if (this[0]) {
            var props = this.data("any-properties");

            if (props != null) {
                if (props["jsonString"] != null && typeof (value) === "string") {
                    if (arguments.length == 0) {
                        return this.prop("jsonString");
                    }
                    return this.prop("jsonString", value);
                }

                if (props["jsonObject"] != null && typeof (value) === "object") {
                    if (arguments.length == 0) {
                        return this.prop("jsonObject");
                    }
                    return this.prop("jsonObject", value);
                }

                if (props["value"] != null) {
                    if (arguments.length == 0) {
                        return this.prop("value");
                    }
                    return this.prop("value", value);
                }
            }
        }

        return this.val_origin.apply(this, arguments);
    },

    enter: function (func) {
        this.keydown(function (event) {
            if (event.keyCode != 13) {
                return;
            }
            any.event(event).preventDefault();
            func.apply(this, arguments);
        });

        return this;
    },

    on: function () {
        if (arguments.length > 1 && arguments[0] === "any-initialize" && this.data("any-initialize.fired") === true) {
            arguments[1].apply(this[0]);
            return this;
        }

        return this.on_origin.apply(this, arguments);
    },

    fire: function (eventType, extraParameters) {
        this.triggerHandler(eventType, extraParameters);

        this.each(function () {
            if (eventType in this && this[eventType] != null) {
                if (extraParameters != null) {
                    extraParameters.splice(0, 0, {});
                }
                if (typeof (this[eventType]) != "function") {
                    new Function(this[eventType]).apply(this, extraParameters || [{}]);
                } else {
                    this[eventType].apply(this, extraParameters || [{}]);
                }
            }
        });

        return this;
    },

    showHide: function (bool) {
        if (bool == true) {
            this.show();
        } else {
            this.hide();
        }

        return this;
    },

    isDisabled: function () {
        if (this[0] == null) {
            return;
        }

        if (this[0].disabled == true) {
            return true;
        }
        if (String(this.attr("disabled")).toLowerCase() == "disabled") {
            return true;
        }
        if (this.prop("disabled") == true) {
            return true;
        }

        try {
            if (this.parent().length == 0 || this.parent().tag() == null) {
                return false;
            }
            return this.parent().isDisabled();
        } catch (e) {
            return false;
        }
    },

    isVisible: function () {
        if (this[0] == null) {
            return;
        }

        if (this[0].style.display == "none") {
            return false;
        }
        if (this[0].style.visibility == "hidden") {
            return false;
        }

        try {
            if (this.parent().length == 0 || this.parent().tag() == null) {
                return true;
            }
            return this.parent().isVisible();
        } catch (e) {
            return true;
        }
    },

    removeCss: function (cssNames) {
        this.each(function () {
            var $this = jQuery(this);
            jQuery.grep(cssNames.split(","), function (cssName) {
                $this.css(cssName, "");
            });
        });

        return this;
    }
});

// ------------------------------------------------------------------------------------------------






















































// ------------------------------------------------------------------------------------------------

function any() {

};

/**
 * 애니 탑 윈도우
 * @param win
 * @returns {Window|*}
 *
 * @example
 * <SS>
 * any.topFrame = function (win) {
 *     if (win == null) win = window;
 *
 *     try {
 *         return win.parent == win ? win : any.topFrame(win.parent);
 *     } catch (e) {
 *         return win;
 *     }
 * };
 */
topWindow = function (win) {
    if (win == null) {
        win = window;
    }

    try {
        return win.parent == win ? win : any.topWindow(win.parent);
    } catch (e) {
        return win;
    }
};

/**
 * 이거 제발 좀
 *
 * @param {win} 되라
 * @returns {Window|*} 플리즈
 *
 * @example
 * <SS>
 * any.rootFrame = function () {
 *     try {
 *         return parent == window ? window : (parent.any == null ? window : parent.any.rootFrame());
 *     } catch (e) {
 *         return window;
 *     }
 * };
 */
rootWindow = function (win) {
    if (win == null) {
        win = window;
    }

    try {
        return parent == win || parent.any == null ? win : parent.any.rootWindow();
    } catch (e) {
        return win;
    }
};

any.containerWidth = function (val) {
    if (typeof (val) === "function") {
        any.containerWidth.calculator = val;
        return;
    }

    if (typeof (any.containerWidth.calculator) !== "function") {
        return;
    }

    jQuery('div[any-container=""]').width(any.containerWidth.calculator());

    jQuery('iframe', val == null ? any.topWindow().document : val).each(function () {
        if (this.contentWindow.any != null && (this.contentWindow.any.pageType() == null || this.contentWindow.any.pageType() == "viewer")) {
            this.contentWindow.any.containerWidth(this.contentWindow.document);
        }
    });
};

any.autoHeight = function () {
    try {
        if (window.frameElement == null) {
            return;
        }
    } catch (e) {
        return;
    }

    if (jQuery('[fullHeight=""],[fullHeight$="px"]').length > 0) {
        return;
    }

    var $frame = jQuery(window.frameElement);

    if ($frame.hasAttr("autoHeight") != true) {
        return;
    }

    var $container = jQuery('div[any-container=""]');

    if ($container.length == 0) {
        return;
    }

    $container.css("margin", "0px").parent().css("overflow", "hidden");

    $container.on("onResizeHeight", function () {
        resetHeight();
    });

    resetHeight();

    function resetHeight() {
        var height = $container.outerHeight(true);

        if ($container[0].offsetTop != null) {
            height += $container[0].offsetTop;
        }

        if (jQuery.browser.msie) {
            height += 1;
        }

        if ($frame.height() != height) {
            $frame.height(height);
        }
    }
};

any.fullHeight2 = function (obj) {
    if (obj == null) {
        jQuery('[fullHeight2=""]').attr("fullHeight", "").each(function () {
            any.fullHeight2(this);
        });
    } else if (obj != document.body && obj != jQuery('div[any-container=""]')[0]) {
        any.fullHeight2(jQuery(obj).attr("fullHeight", "").parent()[0]);
    }
};

any.fullHeight = function () {
    var $target = jQuery('[fullHeight=""],[fullHeight$="px"]').filter(':visible');

    if ($target.length == 0) {
        return;
    }

    jQuery('html, body').height("100%");

    var $container = jQuery('div[any-container=""]');
    var $body = jQuery('body');

    if ($container.data("any-size") == $container.width() + "-" + $container.height() && $body.data("any-size") == $body.width() + "-" + $body.height()) {
        return;
    }

    $container.data("any-size", $container.width() + "-" + $container.height());
    $body.data("any-size", $body.width() + "-" + $body.height());

    $target.each(function () {
        var $this = jQuery(this);

        if ($this.data("any-fullHeightResized") == true) {
            return true;
        }

        var $parent = $this.parent();
        var $containerParent;
        var correction;

        if ($parent.hasAttr("any-container") == true) {
            $containerParent = $parent.parent();
        } else {
            $containerParent = $parent;
        }

        if ($parent[0] == document.body) {
            correction = -3;
        } else {
            correction = 0;
        }

        var objects = [];
        var otherHeight = 0;

        $parent.children().each(function () {
            var $this = jQuery(this);
            if ($this.tag() == "SCRIPT") {
                return;
            }
            if ($this.css("position") == "absolute") {
                return;
            }
            if ($this.css("position") == "fixed") {
                return;
            }
            if ($this.css("display") == "none") {
                return;
            }
            if ($this.css("float") != "none") {
                return;
            }
            if ($this.hasAttr("fullHeight") == true) {
                var marginTop = parseInt($this.css("margin-top"), 10);
                var marginBottom = parseInt($this.css("margin-bottom"), 10);
                if (!isNaN(marginTop)) {
                    otherHeight += marginTop;
                }
                if (!isNaN(marginBottom)) {
                    otherHeight += marginBottom;
                }
                objects.push(this);
            } else {
                otherHeight += $this.outerHeight(true);
                $this.find('textarea').mouseup(function () {
                    any.fullHeight();
                });
            }
        });

        if (objects.length == 0) {
            return true;
        }

        $containerParent.css("overflow-y", "hidden");

        var containerParentHeight;

        if ($containerParent.tag() == "TD") {
            containerParentHeight = $containerParent.closest('table').data("real-height");

            if (containerParentHeight != null) {
                $containerParent.closest('tbody').children('tr').not($containerParent.parent()).each(function () {
                    containerParentHeight -= jQuery(this).outerHeight(true);
                });
            }
        }

        if (containerParentHeight == null) {
            containerParentHeight = $containerParent.height();
            var paddingTop = parseInt($container.css("padding-top"), 10);
            var paddingBottom = parseInt($container.css("padding-bottom"), 10);
            if (!isNaN(paddingTop)) {
                containerParentHeight -= paddingTop;
            }
            if (!isNaN(paddingBottom)) {
                containerParentHeight -= paddingBottom;
            }
        }

        var totHeight = containerParentHeight - otherHeight - ($parent.outerHeight(true) - $parent.innerHeight()) + correction;
        var objHeight = Math.floor(totHeight / objects.length);

        for (var i = 0, ii = objects.length; i < ii; i++) {
            var minHeight = parseInt($this.attr("fullHeight"), 10);
            if (isNaN(minHeight) == true) {
                minHeight = 0;
            }
            var height = objHeight + (i < ii - 1 ? 0 : totHeight - objHeight * objects.length);
            if (height < minHeight) {
                $containerParent.css("overflow-y", "auto");
                height = minHeight;
            } else {
                $containerParent.css("overflow", "hidden");
            }
            var $object = jQuery(objects[i]);
            $object.data("any-fullHeightResized", true).outerHeight(height == 0 ? "" : height).resize().fire("onFullHeight", [height]);
            if ($object.tag() == "TABLE") {
                $object.data("real-height", height == 0 ? "" : height);
            }
        }
    }).removeData("any-fullHeightResized");
};

any.preventDocumentDrop = function () {
    if (any.preventDocumentDrop.attached == true) {
        return;
    }

    any.preventDocumentDrop.attached = true;

    jQuery(document).on("dragover drop", function (event) {
        any.event(event).stopPropagation().preventDefault();
        return false;
    });
};

any.pagingParameterName = function (key) {
    if (any.pagingParameterName.parameterNames == null) {
        any.pagingParameterName.parameterNames = {
            type: null,
            recordCountPerPage: null,
            currentPageNo: null,
            sortingNames: null
        };

        var parameterKey = any.text.empty(any.config["/anyworks/paging/parameter-key"], null);

        if (parameterKey == null) {
            any.pagingParameterName.parameterNames.type = "_PAGING_TYPE_";
            any.pagingParameterName.parameterNames.recordCountPerPage = "_PAGING_SIZE_";
            any.pagingParameterName.parameterNames.currentPageNo = "_PAGING_NO_";
            any.pagingParameterName.parameterNames.sortingNames = "_PAGING_SORT_";
        } else {
            for (var name in any.pagingParameterName.parameterNames) {
                any.pagingParameterName.parameterNames[name] = parameterKey + "." + name;
            }
        }
    }

    return any.pagingParameterName.parameterNames[key];
};

any.reloadList = function () {
    if (any.pageType() == "window" && window.opener != null) {
        var openerAny;
        try {
            openerAny = window.opener.any;
        } catch (e) {
            openerAny = null;
        }
        if (openerAny != null && openerAny.window != null) {
            var win = openerAny.window.openWindows;
            if (win != null && win[window.name] != null && win[window.name].f != null) {
                window.opener.jQuery(win[window.name].f).fire("onReload");
            }
        }
    }

    if (any.opener() != null && any.opener() != window && any.opener().any != null && any.opener().any.reloadList != null) {
        try {
            any.opener().any.reloadList();
        } catch (e) {
        }
    }

    try {
        if (window.frameElement == null || parent == null || parent.jQuery == null) {
            return;
        }
    } catch (e) {
        return;
    }

    var $frame = parent.jQuery(window.frameElement).fire("onReload");

    if ($frame.prop("any-viewer-$div") != null) {
        $frame.prop("any-viewer-$div").data("reloadList", true);
    } else {
        $frame.parent().data("reloadList", true)
    }

    if (parent.any != null && parent.any.reloadList != null) {
        parent.any.reloadList();
    }
};

any.pageType = function () {
    var hierachy = false;

    if (arguments.length > 0) {
        if (typeof (arguments[0]) == "boolean") {
            hierachy = arguments[0];
        } else {
            any.pageType.value = arguments[0];
            return;
        }
    }

    if (any.pageType.value != null) {
        return any.pageType.value;
    }

    try {
        if (window == parent && window.name != null && window.name.indexOf("any_window_") == 0) {
            return "window";
        }
    } catch (e) {
    }

    try {
        if (window.frameElement == null) {
            return window.opener != null && window.opener.any.meta.contextPath == any.meta.contextPath ? "window" : "main";
        }
    } catch (e) {
        return "main";
    }

    var pageType = jQuery(window.frameElement).attr("any-pageType");

    if (hierachy != true || window == parent || pageType == "window" || pageType == "dialog") {
        return pageType;
    }

    try {
        return parent.any.pageType(true);
    } catch (e) {
        return pageType;
    }
};

any.reloadPage = function () {
    window.location.replace(window.location.pathname + window.location.search);
};

any.unloadPage = function (returnValue, replacePath) {
    if (typeof (any.unloadPage.before) === "function" && any.unloadPage.before() != true) {
        return;
    }

    if (window.frameElement != null && window.frameElement["any-unloadPage"] != null) {
        window.setTimeout(function () {
            window.frameElement["any-unloadPage"](returnValue);
        }, 0);
    } else if (parent != null && parent.frameElement != null && parent.frameElement["any-unloadPage"] != null) {
        parent.any.unloadPage.apply(parent.any.unloadPage, arguments);
    } else if (any.pageType(true) == "window") {
        window.setTimeout(function () {
            any.topWindow()["any-unloadPage"](returnValue);
        }, 0);
    } else if (replacePath != null) {
        window.location.replace(any.url.amp(any.url(replacePath)));
    } else if (parent != null && parent.any != null && parent.any != any && typeof (parent.any.unloadPage) == "function") {
        parent.any.unloadPage.apply(parent.any.unloadPage, arguments);
    }

    try {
        if (parent.frameElement != null) {
            parent.document.body.focus();
        }
    } catch (e) {
    }
};

any.dialogTitle = function (title) {
    try {
        if (window.frameElement == null) {
            return;
        }
    } catch (e) {
        return;
    }

    if (any.pageType() == "dialog") {
        jQuery('span.ui-dialog-title', jQuery(window.frameElement).parent().parent()).text(any.text.empty(title, any.rootWindow().document.title));
    }
};

any.loadStyle = function (url, id) {
    jQuery(function () {
        var $link = null;

        if (id != null) {
            $link = jQuery('link#' + id);
        }

        if ($link != null && $link.length > 0 && jQuery.browser.msie && Number(jQuery.browser.version) < 9) {
            $link.remove();
            $link = null;
        }

        if ($link == null || $link.length == 0) {
            $link = jQuery('<link>').attr({rel: "StyleSheet", type: "text/css", charset: "utf-8"}).appendTo('head');
            if (id != null) {
                $link.attr("id", id);
            }
        }

        if ($link != null && $link.length > 0) {
            $link[0].href = any.meta.contextPath + url;
        }
    });
};

any.loadScript = function (src, callback) {
    if (src == null || src == "") {
        if (callback != null) {
            callback.apply();
        }
        return;
    }

    var $script = jQuery('script[src="' + any.meta.contextPath + src + '"]');

    if ($script.length > 0 && $script.data("readyState") == "loaded") {
        if (callback != null) {
            callback.apply();
        }
        return;
    }

    var script = document.createElement("script");

    if (any.text.endsWith(src, ".vbs", true) == true || src.toLowerCase().indexOf(".vbs?") != -1) {
        script.setAttribute("type", "text/vbscript");
    } else {
        script.setAttribute("type", "text/javascript");
    }

    script.setAttribute("src", any.meta.contextPath + src);

    if (callback != null) {
        if (jQuery.browser.msie && Number(jQuery.browser.version) < 9) {
            script.onreadystatechange = function () {
                if (this.readyState == "loaded" || this.readyState == "complete") {
                    jQuery(this).data("readyState", "loaded");
                    callback.apply();
                }
            };
        } else {
            script.onload = function () {
                jQuery(this).data("readyState", "loaded");
                callback.apply();
            };
        }
    }

    jQuery('head')[0].appendChild(script);
};

any.loadScripts = function (srcs, callback, sequential) {
    if (srcs == null || srcs.length == 0) {
        if (callback != null) {
            callback.apply();
        }
        return;
    }

    var scripts = [];

    for (var i = 0, ii = srcs.length; i < ii; i++) {
        scripts.push({src: srcs[i]});
    }

    if (sequential === true) {
        loadScripts1();
    } else {
        loadScripts2();
    }

    function loadScripts1(index) {
        if (index == null) {
            index = 0;
        }

        if (scripts.length <= index) {
            if (callback != null) {
                callback.apply();
            }
            return;
        }

        any.loadScript(scripts[index].src, function () {
            loadScripts1(index + 1);
        });
    }

    function loadScripts2() {
        if (function () {
            for (var i = 0, ii = scripts.length; i < ii; i++) {
                if (scripts[i].state != "loaded") {
                    return false;
                }
            }
            return true;
        }() == true) {
            if (callback != null) {
                callback.apply();
            }
            return;
        }

        for (var i = 0, ii = scripts.length; i < ii; i++) {
            (function (scr) {
                if (scr.state != null) {
                    return;
                }
                scr.state = "loading";
                any.loadScript(scr.src, function () {
                    scr.state = "loaded";
                    loadScripts2();
                });
            })(scripts[i]);
        }
    }
};

any.copyArguments = function (obj, args) {
    if (obj == null || args == null) {
        return;
    }

    if (args.length == 1 && typeof (args[0]) === "object") {
        for (var item in args[0]) {
            obj[item] = args[0][item];
        }
    } else if (args.length == 2) {
        obj[args[0]] = args[1];
    }
};

/**
 * 스크롤바위드
 *
 * @returns {*|number}
 *
 * @example
 * <SS>
 * any.scrollbarWidth = function () {
 *     if (any.scrollbarWidth.value != null) return any.scrollbarWidth.value;
 *
 *     var $textarea1 = jQuery('<textarea>').attr({ cols: 10, rows: 2 }).css({ position: "absolute", top: -1000, left: -1000 }).appendTo('body');
 *     var $textarea2 = jQuery('<textarea>').attr({ cols: 10, rows: 2 }).css({ position: "absolute", top: -1000, left: -1000, overflow: "hidden" }).appendTo('body');
 *     any.scrollbarWidth.value = $textarea1.width() - $textarea2.width();
 *     $textarea1.add($textarea2).remove();
 *
 *     return any.scrollbarWidth.value;
 * };
 */
scrollbarWidth = function () {
    if (any.scrollbarWidth.value != null && any.scrollbarWidth.value != 0) {
        return any.scrollbarWidth.value;
    }

    if (jQuery.browser.msie) {
        var $div = jQuery('<div>').css({height: "100px"}).appendTo(jQuery('<div>').css({
            width: "50px",
            height: "50px",
            overflow: "hidden",
            position: "absolute",
            top: "-200px",
            left: "-200px"
        }).appendTo('body'));
        var width = $div.innerWidth();
        $div.parent().css("overflow-y", "scroll");
        any.scrollbarWidth.value = width - $div.innerWidth();
        $div.parent().remove();
    } else {
        var $div = jQuery('<div>').css({
            width: "100px",
            height: "100px",
            overflow: "auto",
            position: "absolute",
            top: "-1000px",
            left: "-1000px"
        }).prependTo('body').append('<div>').find('div').css({width: "100%", height: "200px"});
        any.scrollbarWidth.value = 100 - $div.width();
        $div.parent().remove();
    }

    return any.scrollbarWidth.value;
};

any.elementWidthGap = function (container, elementSelector) {
    var $container = (container.jquery == jQuery.fn.jquery ? container : jQuery(container));

    if (any.elementWidthGap.values == null) {
        any.elementWidthGap.values = {};
    }

    var $element = $container.find(elementSelector);
    var style = $container.attr("style") + "::" + $element.attr("style");
    var gap = any.elementWidthGap.values[style];

    if (gap == null) {
        if ($container.is(':visible')) {
            gap = $element.outerWidth(true) - $element.width();
        } else {
            var $cloneContainer = $container.clone().css("visibility", "hidden").appendTo('body');
            var $cloneElement = $cloneContainer.find(elementSelector);
            gap = $cloneElement.outerWidth(true) - $cloneElement.width();
            $cloneContainer.remove();
        }

        any.elementWidthGap.values[style] = gap;
    }

    return gap;
};

/**
 * 블록커
 *
 * @constructs blocker
 *
 * @param $div
 * @returns {{}}
 */
blocker = function ($div) {
    var f = {};

    if (any.config.blockActivated != true) {
        f.start = f.stop = f.block = f.unblock = new Function();
        return f;
    }

    /**
     * 블록커 시작 33
     *
     * @memberOf blocker#
     *
     * @see {@link start}
     */
    start = function () {
        any.blocker.startCount = any.object.nvl(any.blocker.startCount, 0) + 1;

        jQuery('object,[blocker-target="true"]').each(function () {
            var $this = jQuery(this);
            if (this.defaultVisibility != null) {
                return true;
            }
            this.defaultVisibility = $this.css("visibility");
            $this.css("visibility", "hidden");
        });

        jQuery('iframe').each(function () {
            try {
                if (this.contentWindow.any == null) {
                    return;
                }
            } catch (e) {
                return;
            }
            this.contentWindow.any.blocker().start();
        });
    };

    /**
     * 스타트
     *
     * @memberOf blocker#
     *
     */
    stop = function () {
        any.blocker.startCount = Math.max(any.object.nvl(any.blocker.startCount, 0) - 1, 0);

        if (any.blocker.startCount > 0) {
            return;
        }

        jQuery('object,[blocker-target="true"]').each(function () {
            var $this = jQuery(this);
            $this.css("visibility", this.defaultVisibility);
            this.defaultVisibility = null;
        });

        jQuery('iframe').each(function () {
            try {
                if (this.contentWindow.any == null) {
                    return;
                }
            } catch (e) {
                return;
            }
            this.contentWindow.any.blocker().stop();
        });
    };

    f.block = function (zIndex) {
        if ($div == null) {
            any.blocker.blockCount = any.object.nvl(any.blocker.blockCount, 0) + 1;
            if (any.blocker.$iframe == null) {
                any.blocker.$iframe = getFrame();
                if (zIndex == true) {
                    any.blocker.$iframe.css("z-index", 2147483647);
                }
                any.blocker.$iframe.appendTo(document.body);
            } else if (zIndex != true) {
                any.blocker.$iframe.css("z-index", 0);
            }
        } else {
            $div.$blockFrame = getFrame();
            $div.$blockFrame.css("z-index", jQuery('div.ui-dialog[role="dialog"]:last').css("z-index"));
            $div.$blockFrame.appendTo(document.body);
        }
    };

    f.unblock = function (zeroCount) {
        if ($div == null) {
            any.blocker.blockCount = (zeroCount == true ? 0 : Math.max(any.object.nvl(any.blocker.blockCount, 0) - 1, 0));
            if (any.blocker.blockCount > 0) {
                return;
            }
            if (any.blocker.$iframe != null) {
                any.blocker.$iframe.remove();
                any.blocker.$iframe = null;
            }
        } else {
            $div.$blockFrame.remove();
            $div.$blockFrame = null;
        }
    };

    return f;

    function getFrame() {
        return jQuery('<iframe>').attr({frameBorder: 0}).css({
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%"
        });
    }
};

any.loading = function (arg0) {
    if (arg0 != null && typeof (arg0) === "function") {
        if (any.loading.functions == null) {
            any.loading.functions = [];
        }
        any.loading.functions.push(arg0);
        return;
    }

    if (any.loading.type == null) {
        any.loading.type = "page";
        any.loading.page = {};
        any.loading.ajax = {};
    }

    if (typeof (arg0) === "string" && any.loading[arg0] != null) {
        any.loading.type = arg0;
    }

    var f = {};
    var o = {};

    o.loading = {page: {}, ajax: {}};

    f.container = function (container) {
        o.container = container;

        return f;
    };

    f.show = function () {
        if (o.container != null) {
            o.loading.ajax.show.apply(this, arguments);
            return;
        }

        if (arg0 === true) {
            any.loading.count = any.object.nvl(any.loading.count, 0) + 1;
        }

        if (o.loading[any.loading.type] != null) {
            o.loading[any.loading.type].show.apply(this, arguments);
        }
    };

    f.hide = function () {
        if (o.container != null) {
            o.loading.ajax.hide.apply(this, arguments);
            return;
        }

        if (arg0 === true) {
            any.loading.count = Math.max(any.object.nvl(any.loading.count, 0) - 1, 0);
            if (any.loading.count > 0) {
                return;
            }
        }

        if (o.loading[any.loading.type] != null) {
            o.loading[any.loading.type].hide.apply(this, arguments.length > 0 ? arguments : [true]);
        }
    };

    f.appendPageProgressBar = function () {
        if (any.loading.page.$progressBarLayer != null || any.home == null) {
            return;
        }

        any.loading.page.$progressBarLayer = jQuery('<div>').addClass("any-page-progressbar").css({
            "position": "absolute",
            "top": "0px",
            "width": "100%",
            "border": "none",
            "z-index": 2147483647
        }).appendTo(document.body);

        any.loading.page.$progressBarLayer.progressbar({value: false});
        any.loading.page.$progressBarLayer.find('.ui-progressbar-value').css({"border": "none"});
    };

    f.removePageProgressBar = function () {
        if (any.loading.page.$progressBarLayer == null) {
            return;
        }

        any.loading.page.$progressBarLayer.remove();
        any.loading.page.$progressBarLayer = null;
    };

    o.loading.page.show = function () {
        any.blocker().block(true);

        if (any.loading.page.$layer != null || any.home == null) {
            return;
        }

        any.loading.page.$layer = jQuery('<div>').css({
            "position": "absolute",
            "background-color": "#ffffff",
            "left": "0px",
            "top": "0px",
            "width": "100%",
            "height": "100%",
            "z-index": 2147483647
        }).appendTo(document.body);

        if (any.config["/anyworks/loading/page/progressbar-mode"] === true) {
            any.rootWindow().any.loading().appendPageProgressBar();

            any.loading.page.$layer.fadeTo(0, 0.25);
        } else {
            if (any.config.loadingImage.page == null) {
                any.config.loadingImage.page = any.home + "/images/loading-page.gif";
            }

            any.loading.page.$layer.html(' \
            <div style="display: table; width: 100%; height: 100%;"> \
                <div style="display: table-cell; width: 100%; height: 100%; text-align: center; vertical-align: middle;"> \
                    <img src="' + any.meta.contextPath + any.config.loadingImage.page + '"> \
                </div> \
            </div> \
        ');
        }

        jQuery('html').removeAttr("style");
    };

    o.loading.page.hide = function () {
        jQuery('html').removeAttr("style");

        if (any.config["/anyworks/loading/page/progressbar-mode"] === true) {
            any.rootWindow().any.loading().removePageProgressBar();
        }

        if (any.loading.page.$layer == null) {
            return;
        }

        any.loading.page.$layer.remove();
        any.loading.page.$layer = null;

        any.blocker().unblock(true);

        window.setTimeout(function () {
            if (any.loading.page.$layer == null) {
                any.loading.type = "ajax";
            }
        }, 500);
    };

    o.loading.ajax.show = function (duration, opacity) {
        any.blocker().block();

        var $container = jQuery(o.container == null ? document.body : o.container);
        var $layer = $container.data("$ajax-loading-layer");

        if ($layer == null) {
            $layer = jQuery('<div>').css({
                "display": "none",
                "background-color": any.text.nvl(any.config.ajaxLoadingBgColor, "#000000"),
                "position": "absolute",
                "left": "0px",
                "top": "0px",
                "width": "100%",
                "height": "100%",
                "z-index": 2147483647
            }).appendTo($container);

            $container.data("$ajax-loading-layer", $layer);

            if (o.container == null) {
                any.loading.ajax.$layer = $layer;
            }

            if (any.config.loadingImage.ajax == null) {
                any.config.loadingImage.ajax = any.home + "/images/loading-ajax.gif";
            }

            $layer.data("$loader", jQuery('<div>').css({
                "display": "none",
                "position": "absolute",
                "left": "0px",
                "top": "0px",
                "width": "100%",
                "height": "100%",
                "z-index": 2147483647
            }).appendTo($container));

            $layer.data("$loader").html(' \
            <div style="display: table; width: 100%; height: 100%;"> \
                <div style="display: table-cell; width: 100%; height: 100%; text-align: center; vertical-align: middle;"> \
                    <img src="' + any.meta.contextPath + any.config.loadingImage.ajax + '"> \
                </div> \
            </div> \
        ');
        }

        if (o.container == null) {
            jQuery('<input>').css({
                "position": "absolute",
                "margin-left": "-1000px",
                "margin-top": "-1000px"
            }).appendTo(document.body).focus().remove();
        } else {
            o.containerPosition = $container.css("position");
            $container.css("position", "relative");
        }

        $layer.fadeTo(duration, opacity);
        $layer.data("$loader").show();
    };

    o.loading.ajax.hide = function (zeroCount) {
        var $container = jQuery(o.container == null ? document.body : o.container);
        var $layer = $container.data("$ajax-loading-layer");

        if ($layer == null) {
            o.loading.page.hide();
        } else {
            $layer.data("$loader").hide();
            $layer.stop().hide();

            any.blocker().unblock(zeroCount && any.loading.page.$layer == null);

            if (o.container != null && o.containerPosition != null) {
                $container.css("position", o.containerPosition);
            }
        }
    };

    return f;
};

any.body = function () {
    var f = {};

    f.begin = function (func) {
        if (func != null) {
            add("begin", func);
        } else {
            exec("begin");
        }

        return f;
    };

    f.end = function (func) {
        if (func != null) {
            add("end", func);
        } else {
            exec("end");
        }

        return f;
    };

    return f;

    function add(type, func) {
        if (any.body.functions == null) {
            any.body.functions = {};
        }

        if (any.body.functions[type] == null) {
            any.body.functions[type] = [];
        }

        any.body.functions[type].push(func);
    }

    function exec(type) {
        if (any.body.functions == null) {
            return;
        }
        if (any.body.functions[type] == null) {
            return;
        }

        for (var i = 0, ii = any.body.functions[type].length; i < ii; i++) {
            any.body.functions[type][0].apply(any.body.functions[type][0]);
            any.body.functions[type].splice(0, 1);
        }
    }
};

any.ready = function (func) {
    if (func != null) {
        if (any.ready.functions == null) {
            any.ready.functions = [];
        }
        any.ready.functions.push(func);
        return;
    }

    var f = {};

    f.check = function (callback) {
        if (any.control().checkActivated() != true) {
            window.setTimeout(function () {
                f.check(callback);
            }, 50);
            return;
        }

        if (any.codedata.initialized != true) {
            any.codedata.initialized = true;
            any.codedata().initialize();
        }

        if (any.control().checkReady() != true) {
            window.setTimeout(function () {
                f.check(callback);
            }, 50);
            return;
        }

        any.autoHeight();
        any.fullHeight();

        if (callback == null) {
            for (var i = 0, ii = any.ready.functions == null ? 0 : any.ready.functions.length; i < ii; i++) {
                any.ready.functions[0].apply(any.ready.functions[0]);
                any.ready.functions.splice(0, 1);
            }
        } else {
            callback.apply(callback);
        }

        jQuery('body').data("any-size", null);

        any.autoHeight();
        any.fullHeight();

        any.loading(true).hide();
    };

    return f;
};

/**
 * any["boolean"]
 *
 * @param value 밸류
 * @param separator 분리 구문자
 * @returns {{}} 리턴
 */
anyBoolean = function (value, separator) {
    if (value == null) {
        value = any.config.booleanValues;
    }

    if (separator == null) {
        if (value.indexOf(",") > 0) {
            separator = ",";
        } else if (value.indexOf(":") > 0) {
            separator = ":";
        } else if (value.indexOf(";") > 0) {
            separator = ";";
        }
    }

    var values = value.split(separator);

    var f = {};

    f.trueValue = function (defaultValue) {
        if (values.length > 0) {
            return values[0];
        }

        return defaultValue;
    };

    f.falseValue = function (defaultValue) {
        if (values.length > 1) {
            return values[1];
        }

        return defaultValue;
    };

    f.value = function (bool) {
        return bool == true ? f.trueValue() : f.falseValue();
    };

    return f;
};

any.object = function (obj) {
    var f = {};

    f.init = function () {
        return exec(any.object.init, arguments);
    };

    f.clone = function () {
        return exec(any.object.clone, arguments);
    };

    f.copyFrom = function () {
        obj = exec(any.object.copyFrom, arguments);

        return f;
    };

    f.copyTo = function () {
        obj = exec(any.object.copyTo, arguments);

        return f;
    };

    f.nvl = function () {
        return exec(any.object.nvl, arguments);
    };

    f.join = function () {
        return exec(any.object.join, arguments);
    };

    f.parse = function () {
        obj = exec(any.object.parse, arguments);

        return f;
    };

    f.size = function () {
        return exec(any.object.size, arguments);
    };

    f.toBoolean = function () {
        return exec(any.object.toBoolean, arguments);
    };

    f.toObject = function () {
        return obj;
    };

    return f;

    function exec(func, args) {
        var a = Array.prototype.slice.call(args);
        a.splice(0, 0, obj);
        return func.apply(f, a);
    }
};

/**
 * any.object.init
 * 
 * @param obj 오브젝트
 * @param path 경로
 * @param last 마지막
 * @returns {*} 리턴
 */
object_init = function (obj, path, last) {
    var paths = path.split(".");
    var newObj = obj;

    for (var i = 0, ii = paths.length; i < ii; i++) {
        if (newObj[paths[i]] == null) {
            newObj[paths[i]] = (i < ii - 1 || arguments.length < 3 ? {} : last);
        }
        newObj = newObj[paths[i]];
    }

    return newObj;
};

any.object.clone = function (obj) {
    if (obj == null) {
        return obj;
    }

    if (typeof (obj) !== "object" || jQuery.type(obj) === "date") {
        return obj;
    }

    var newObj = new obj.constructor();

    for (var prop in obj) {
        if (typeof (obj[prop]) === "object") {
            newObj[prop] = any.object.clone(obj[prop]);
        } else {
            newObj[prop] = obj[prop];
        }
    }

    return newObj;
};

any.object.copyFrom = function (obj, obj2, keepOriginal) {
    if (obj == null || obj2 == null) {
        return obj;
    }

    for (var item in obj2) {
        if (keepOriginal == true && typeof (obj[item]) !== "undefined") {
            continue;
        }
        obj[item] = obj2[item];
    }

    return obj;
};

any.object.copyTo = function (obj, obj2, keepOriginal) {
    any.object.copyFrom(obj2, obj, keepOriginal);

    return obj;
};

any.object.nvl = function (obj, obj2) {
    return obj == null ? obj2 : obj;
};

any.object.join = function (obj, delimiter, separator) {
    var arr = [];

    for (var item in obj) {
        arr.push(item + delimiter + obj[item]);
    }

    return arr.join(separator == null ? "," : separator);
};

any.object.parse = function (obj, string, separator, delimiter) {
    if (obj == null) {
        obj = {};
    }

    if (string == null || string == "") {
        return obj;
    }
    if (separator == null || separator == "") {
        return obj;
    }
    if (delimiter == null || delimiter == "") {
        return obj;
    }

    var str1 = string.split(separator);

    for (var i = 0; i < str1.length; i++) {
        var str2 = str1[i].split(delimiter);
        if (str2.length == 2) {
            obj[any.text.trim(str2[0])] = any.text.trim(str2[1]);
        }
    }

    return obj;
};

any.object.size = function (obj, total) {
    var size = 0;

    for (var item in obj) {
        if (total == true || item != null) {
            size++;
        }
    }

    return size;
};

any.object.toBoolean = function (obj, defaultValue) {
    if (obj == null || obj === "") {
        return defaultValue;
    }

    return String(obj).toLowerCase() == "true";
};

/**
 * 텍스트(문자열(스트링))
 *
 * @constructs text
 *
 * @param {String}
 * @returns {{}}
 *
 */
text = function (txt) {
    var f = {};

    /**
     * 문자열 양 옆 빈 공란 없애기
     *
     * @returns {{}} " Abc 123 abc " -> "Abc 123 abc" 44
     * @memberOf text#
     * @example
     * any.text.trim = function (txt) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     return String(txt).replace(/(^\s*)|(\s*$)/g, "");
     * };
     *
     * <구 버전>
     * any.trim = function (sString) {
     *     if (sString == null) return null;
     *
     *     return sString.replace(/(^\s*)|(\s*$)/g, "");
     * }
     *
     * String.prototype.trim = function () {
     *     return any.trim(this);
     * }
     */
    trim = function () {
        txt = exec(any.text.trim, arguments);

        return txt;
    };

    /**
     * 문자열에 해당하는 글자 일괄 변경
     *
     * @returns {{}} "AaBbAa123" -> "aaBbaa123"
     * @memberOf text#
     * @example
     * any.text.replaceAll = function (txt, sFindText, sReplaceText, bIgnoreCase) {
     *     if (txt == null || sFindText == null) {
     *         return txt;
     *     }
     *
     *     return String(txt).replace(new RegExp(sFindText, "g" + (bIgnoreCase == true ? "i" : "")), sReplaceText);
     * };
     *
     * <구 바전>
     * any.replaceAll = function (sExpression, sFindText, sReplaceText, bIgnoreCase) {
     *     if (sExpression == null) return null;
     *
     *     return sExpression.replace(new RegExp(sFindText, "g" + (bIgnoreCase == true ? "i" : "")), sReplaceText);
     * }
     *
     * String.prototype.replaceAll = function (sFindText, sReplaceText, bIgnoreCase) {
     *     return any.replaceAll(this, sFindText, sReplaceText, bIgnoreCase);
     * }
     */
    replaceAll = function () {
        txt = exec(any.text.replaceAll, arguments);

        return txt;
    };

    /**
     * 텍스트 스트링
     *
     * @returns {{}}
     * @memberOf text#
     *
     * @example
     * any.text.string = function (txt, len) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     var str = txt;
     *
     *     while (txt.length < len) {
     *         txt = txt + str;
     *     }
     *
     *     return txt;
     * };
     */
    string = function () {
        txt = exec(any.text.string, arguments);

        return f;
    };

    /**
     * 엘 패드
     *
     * @returns {{}}
     * @memberOf text#
     *
     * @example
     * any.text.lpad = function (txt, len, pad, truncate) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     if (truncate === true && txt.length > len) {
     *         return txt.substr(0, len);
     *     }
     *
     *     while (txt.length < len) {
     *         txt = pad + txt;
     *     }
     *
     *     return txt;
     * };
     *
     * <구 버전>
     * any.lpad = function (sText, iLen, sPad) {
     *     var sResult = String(sText);
     *
     *     while (sResult.length < iLen) {
     *         sResult = sPad + sResult;
     *     }
     *
     *     return sResult;
     * }
     *
     * String.prototype.lpad = function (iLen, sPad) {
     *     return any.lpad(this, iLen, sPad);
     * }
     */
    lpad = function () {
        txt = exec(any.text.lpad, arguments);

        return f;
    };

    /**
     * 알 패드
     *
     * @returns {{}}
     * @memberOf text#
     *
     * @example
     * any.text.rpad = function (txt, len, pad, truncate) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     if (truncate === true && txt.length > len) {
     *         return txt.substr(0, len);
     *     }
     *
     *     while (txt.length < len) {
     *         txt = txt + pad;
     *     }
     *
     *     return txt;
     * };
     *
     * <구 버전>
     *
     */
    rpad = function () {
        txt = exec(any.text.rpad, arguments);

        return f;
    };

    /**
     * 텍스트 스타츠위드
     * 
     * @returns {*}
     *
     * @memberOf text#
     *
     * @example
     * any.text.startsWith = function (txt, sPrefix, bIgnoreCase) {
     *     if (txt == null || sPrefix == null) {
     *         return false;
     *     }
     *
     *     txt = String(txt);
     *
     *     if (txt.length < sPrefix.length) {
     *         return false;
     *     }
     *
     *     if (bIgnoreCase == true) {
     *         return txt.substr(0, sPrefix.length).toUpperCase() == sPrefix.toUpperCase();
     *     }
     *
     *     return txt.substr(0, sPrefix.length) == sPrefix;
     * };
     */
    startsWith = function () {
        return exec(any.text.startsWith, arguments);
    };

    /**
     * 엔즈 위드
     * 
     * @returns {*}
     * @memberOf text#
     *
     * @example
     * any.text.endsWith = function (txt, sSuffix, bIgnoreCase) {
     *     if (txt == null || sSuffix == null) {
     *         return false;
     *     }
     *
     *     txt = String(txt);
     *
     *     if (txt.length < sSuffix.length) {
     *         return false;
     *     }
     *
     *     if (bIgnoreCase == true) {
     *         return txt.substr(txt.length - sSuffix.length).toUpperCase() == sSuffix.toUpperCase();
     *     }
     *
     *     return txt.substr(txt.length - sSuffix.length) == sSuffix;
     * };
     */
    endsWith = function () {
        return exec(any.text.endsWith, arguments);
    };

    /**
     * 텍스트 엔브이엘
     *
     * @returns {{}}
     * @memberOf text#
     *
     * @example
     * any.text.nvl = function (txt, nullValue) {
     *     return txt == null ? nullValue : txt;
     * };
     */
    nvl = function () {
        txt = exec(any.text.nvl, arguments);

        return f;
    };

    /**
     * 텍스트 엔브이엘2
     *
     * @returns {{}}
     * @memberOf text#
     *
     * @example
     * any.text.nvl2 = function (txt, notNullValue, nullValue) {
     *     return txt == null ? nullValue : notNullValue;
     * };
     */
    nvl2 = function () {
        txt = exec(any.text.nvl2, arguments);

        return f;
    };

    f.isEmpty = function () {
        return exec(any.text.isEmpty, arguments);
    };

    f.isBlank = function () {
        return exec(any.text.isBlank, arguments);
    };

    f.empty = function () {
        txt = exec(any.text.empty, arguments);

        return f;
    };

    f.empty2 = function () {
        txt = exec(any.text.empty2, arguments);

        return f;
    };

    f.blank = function () {
        txt = exec(any.text.blank, arguments);

        return f;
    };

    f.blank2 = function () {
        txt = exec(any.text.blank2, arguments);

        return f;
    };

    f.format = function () {
        txt = exec(any.text.format, arguments);

        return f;
    };

    f.unformat = function () {
        txt = exec(any.text.unformat, arguments);

        return f;
    };

    f.formatNumber = function () {
        txt = exec(any.text.formatNumber, arguments);

        return f;
    };

    f.unformatNumber = function () {
        txt = exec(any.text.unformatNumber, arguments);

        return f;
    };

    f.crop = function () {
        return exec(any.text.crop, arguments);
    };

    f.cropIgnoreCase = function () {
        return exec(any.text.cropIgnoreCase, arguments);
    };

    f.bytes = function () {
        return exec(any.text.bytes, arguments);
    };

    /**
     * 투 에이치티엠엘
     *
     * @returns {*}
     * @memberOf text#
     *
     * @example
     * any.text.toHTML = function (txt, isPre) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     var result = [];
     *
     *     for (var i = 0, ii = txt.length; i < ii; i++) {
     *         var c = txt.charAt(i);
     *         switch (c) {
     *             case "<":
     *                 result.push("&lt;");
     *                 break;
     *             case ">":
     *                 result.push("&gt;");
     *                 break;
     *             case '"':
     *                 result.push("&quot;");
     *                 break;
     *             case "&":
     *                 result.push("&amp;");
     *                 break;
     *             case '+':
     *                 result.push("&#43;");
     *                 break;
     *             default:
     *                 if (isPre == true) {
     *                     result.push(c);
     *                     break;
     *                 }
     *                 switch (c) {
     *                     case " ":
     *                         result.push("&nbsp;");
     *                         break;
     *                     case "\r":
     *                         if (i + 1 < ii && txt.charAt(i + 1) == '\n') {
     *                             result.push("<br>\r\n");
     *                         } else {
     *                             result.push("<br>\r");
     *                         }
     *                         break;
     *                     case "\n":
     *                         if ((i > 0 && txt.charAt(i - 1) == '\r') != true) {
     *                             result.push("<br>\n");
     *                         }
     *                         break;
     *                     default:
     *                         result.push(c);
     *                         break;
     *                 }
     *         }
     *     }
     *
     *     return result.join("");
     * };
     */
    toHTML = function () {
        return exec(any.text.toHTML, arguments);
    };

    f.toJSON = function () {
        return exec(any.text.toJSON, arguments);
    };

    f.toJS = function () {
        return exec(any.text.toJS, arguments);
    };

    f.toBoolean = function () {
        return exec(any.text.toBoolean, arguments);
    };

    f.toNumber = function () {
        return exec(any.text.toNumber, arguments);
    };

    /**
     * 투 카멜케이스
     *
     * @returns {*}
     *
     * @memberOf text#
     *
     * @example
     * any.text.toCamelCase = function (txt) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     if (txt == "") {
     *         return txt;
     *     }
     *
     *     var str = txt.toLowerCase();
     *     var isUpperCase = false;
     *     var result = [];
     *
     *     for (var i = 0; i < str.length; i++) {
     *         var chr = str.charAt(i);
     *         if (chr == '_') {
     *             isUpperCase = true;
     *         } else if (chr >= '0' && chr <= '9') {
     *             result.push(chr);
     *             isUpperCase = false;
     *         } else if (chr < 'a' || chr > 'z') {
     *             result.push(chr);
     *             isUpperCase = true;
     *         } else if (isUpperCase) {
     *             result.push(chr.toUpperCase());
     *             isUpperCase = false;
     *         } else {
     *             result.push(chr);
     *         }
     *     }
     *
     *     return result.join("");
     * };
     */
    toCamelCase = function () {
        return exec(any.text.toCamelCase, arguments);
    };

    /**
     * 투 언더스코어
     * 
     * @returns {*}
     *
     * @memberOf text#
     *
     * @example
     * any.text.toUnderscores = function (txt) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     if (txt == "") {
     *         return txt;
     *     }
     *
     *     var result = [];
     *
     *     for (var i = 0; i < txt.length; i++) {
     *         if (txt.charAt(i) == txt.charAt(i).toUpperCase()) {
     *             result.push('_');
     *         }
     *         result.push(txt.charAt(i));
     *     }
     *
     *     return result.join("").substring(result[0] == '_' ? 1 : 0);
     * };
     */
    toUnderscores = function () {
        return exec(any.text.toUnderscores, arguments);
    };

    f.toString = function () {
        return txt;
    };

    return f;

    function exec(func, args) {
        var a = Array.prototype.slice.call(args);
        a.splice(0, 0, txt);
        return func.apply(f, a);
    }
};



















any.text.isEmpty = function (txt) {
    return txt == null || txt == "";
};

any.text.isBlank = function (txt) {
    return any.text.isEmpty(txt) || any.text.trim(txt) == "";
};

any.text.empty = function (txt, emptyValue) {
    return any.text.isEmpty(txt) ? emptyValue : txt;
};

any.text.empty2 = function (txt, notEmptyValue, emptyValue) {
    return any.text.isEmpty(txt) ? emptyValue : notEmptyValue;
};

any.text.blank = function (txt, blankValue) {
    return any.text.isBlank(txt) ? blankValue : txt;
};

any.text.blank2 = function (txt, notBlankValue, blankValue) {
    return any.text.isBlank(txt) ? blankValue : notBlankValue;
};

any.text.format = function (txt, fmt, symbol, exactly) {
    if (txt == null) {
        return txt;
    }

    txt = String(txt);

    if (txt == "") {
        return txt;
    }

    if (fmt == null || fmt == "") {
        return txt;
    }

    if (symbol == null) {
        symbol = "#";
    }

    var result = [];
    var txtIdx = 0;

    for (var i = 0, ii = fmt.length; i < ii; i++) {
        if (fmt.charAt(i) == symbol) {
            result.push(txt.charAt(txtIdx++));
        } else if (txt.charAt(i) == fmt.charAt(i)) {
            result.push(txt.charAt(i));
            txtIdx++;
        } else {
            result.push(fmt.charAt(i));
        }
    }

    if (exactly != true) {
        result.push(txt.substr(txtIdx));
    }

    return result.join("");
};

any.text.unformat = function (txt, fmt, symbol, exactly) {
    if (txt == null) {
        return txt;
    }

    txt = String(txt);

    if (txt == "") {
        return txt;
    }

    if (fmt == null || fmt == "") {
        return txt;
    }

    if (symbol == null) {
        symbol = "#";
    }

    var result = [];
    var txtIdx = 0;

    for (var i = 0, ii = fmt.length; i < ii; i++) {
        if (fmt.charAt(i) == symbol) {
            result.push(txt.charAt(txtIdx++));
        } else if (txt.charAt(i) == fmt.charAt(i)) {
            txtIdx++;
        }
    }

    if (exactly != true) {
        result.push(txt.substr(txtIdx));
    }

    return result.join("");
};

any.text.formatNumber = function (txt, digits, thousandsSeparator) {
    if (txt == null) {
        return txt;
    }

    txt = String(txt);

    if (txt == "") {
        return txt;
    }

    if (arguments.length < 3) {
        thousandsSeparator = ",";
    }

    if (thousandsSeparator == null) {
        thousandsSeparator = "";
    }

    if (thousandsSeparator != "") {
        txt = any.text.replaceAll(txt, thousandsSeparator, "");
    }

    if (!isNaN(digits)) {
        txt = String(Math.round(parseFloat(txt, 10) * Math.pow(10, digits)) / Math.pow(10, digits));
    }

    var minus = any.text.startsWith(txt, "-");
    var txts = (minus == true ? txt.substr(1) : txt).split(".");
    var fixed = any.text.blank(txts[0], "0").replace(new RegExp(thousandsSeparator, "g"), "").split("").reverse().join("").match(/.{1,3}/g).join(thousandsSeparator).split("").reverse().join("");
    var decimal = any.text.rpad(txts[1] == null ? "" : txts[1], digits, "0");

    return (minus == true ? "-" : "") + fixed + (decimal == "" ? "" : ".") + decimal;
};

any.text.unformatNumber = function (txt, thousandsSeparator) {
    if (txt == null) {
        return txt;
    }

    txt = String(txt);

    if (txt == "") {
        return txt;
    }

    if (thousandsSeparator == null) {
        thousandsSeparator = ",";
    }

    return txt.replace(new RegExp(thousandsSeparator, "g"), "");
};

any.text.crop = function (txt, prefix, suffix) {
    if (txt == null) {
        return null;
    }

    var result;

    if (prefix == null) {
        result = txt;
    } else {
        var prefixIndex = txt.indexOf(prefix);
        if (prefixIndex == -1) {
            return null;
        }
        result = txt.substring(prefixIndex + prefix.length);
    }

    if (suffix != null) {
        var suffixIndex = result.indexOf(suffix);
        if (suffixIndex == -1) {
            return null;
        }
        return result.substring(0, suffixIndex);
    }

    return result;
};

any.text.cropIgnoreCase = function (txt, prefix, suffix) {
    if (txt == null) {
        return null;
    }

    var result;

    if (prefix == null) {
        result = txt;
    } else {
        var prefixIndex = txt.toUpperCase().indexOf(prefix.toUpperCase());
        if (prefixIndex == -1) {
            return null;
        }
        result = txt.substring(prefixIndex + prefix.length);
    }

    if (suffix != null) {
        var suffixIndex = result.toUpperCase().indexOf(suffix.toUpperCase());
        if (suffixIndex == -1) {
            return null;
        }
        return result.substring(0, suffixIndex);
    }

    return result;
};

any.text.bytes = function (txt) {
    if (typeof (txt) === "number") {
        return txt <= 128 ? 1 : 3;
    }

    var str = String(txt);
    var bytes = 0;

    for (var i = 0, ii = str.length; i < ii; i++) {
        bytes += any.text.bytes(str.charCodeAt(i));
    }

    return bytes;
};



any.text.toJSON = function (txt) {
    if (txt == null) {
        return txt;
    }

    txt = String(txt);

    var result = [];

    for (var i = 0, ii = txt.length; i < ii; i++) {
        var c = txt.charAt(i);
        switch (c) {
            case "\\":
                result.push("\\\\");
                break;
            case "\r":
                result.push("\\r");
                break;
            case "\n":
                result.push("\\n");
                break;
            case "\"":
                result.push("\\\"");
                break;
            default:
                result.push(c);
                break;
        }
    }

    return result.join("");
};

any.text.toJS = function (txt) {
    if (txt == null) {
        return txt;
    }

    txt = String(txt);

    var result = [];

    for (var i = 0, ii = txt.length; i < ii; i++) {
        var c = txt.charAt(i);
        switch (c) {
            case "\\":
                result.push("\\\\");
                break;
            case "\r":
                result.push("\\r");
                break;
            case "\n":
                result.push("\\n");
                break;
            case "\"":
                result.push("\\042");
                break;
            case "\'":
                result.push("\\047");
                break;
            case "<":
                result.push("\\074");
                break;
            case ">":
                result.push("\\076");
                break;
            default:
                result.push(c);
                break;
        }
    }

    return result.join("");
};

any.text.toBoolean = function (txt, defaultValue) {
    if (txt == null || txt === "") {
        return defaultValue;
    }

    return String(txt).toLowerCase() == "true";
};

any.text.toNumber = function (txt) {
    if (txt == null) {
        return txt;
    }

    var str = String(txt);
    var num = [];

    for (var i = 0, ii = str.length; i < ii; i++) {
        if (str.charAt(i) >= '0' && str.charAt(i) <= '9') {
            num.push(str.charAt(i));
        }
        if (str.charAt(i) == '-' || str.charAt(i) == '.') {
            num.push(str.charAt(i));
        }
    }

    return Number(num.join(""));
};


/**
 * 데이트
 * @returns {{}}
 *
 * @constructs date
 */
date = function () {
    var f = {};
    var o = {};

    o.date = function (val, fmt) {
        if (arguments.length == 0) {
            return new Date();
        }

        if (val == null || any.text.trim(val) == "") {
            return null;
        }

        var valType = jQuery.type(val);

        if (valType == "number") {
            return new Date(val);
        }

        if (valType == "date") {
            return val;
        }

        val = String(val);

        if (fmt == null) {
            fmt = (val.length == 8 ? "yyyymmdd" : any.meta.dateFormat);
        }

        if (val.length != fmt.length) {
            return null;
        }

        var obj = {y: [], m: [], d: [], h: [], i: [], s: [], l: []};

        for (var i = 0, ii = fmt.length; i < ii; i++) {
            if (obj[fmt.charAt(i).toLowerCase()] != null) {
                obj[fmt.charAt(i).toLowerCase()].push(val.charAt(i));
            }
        }

        for (var item in obj) {
            if (obj[item] != null && isNaN(obj[item].join(""))) {
                return null;
            }
        }

        return new Date(
            Number(obj.y.join(""))
            , Number(obj.m.join("")) - 1
            , Number(obj.d.join(""))
            , Number(obj.h.join(""))
            , Number(obj.i.join(""))
            , Number(obj.s.join(""))
            , Number(obj.l.join(""))
        );
    }.apply(null, arguments);

    /**
     * 데이트 애드
     * 
     * @param num
     * @param part
     * @returns {{}}
     *
     * @memberOf date#
     */
    add = function (num, part) {
        if (o.date == null || num == null) {
            return f;
        }

        var add = {year: 0, month: 0, week: 0, date: 0, hour: 0, minute: 0, second: 0, millisecond: 0};

        add[part == null ? "date" : part] = parseInt(num, 10);

        o.date = new Date(
            o.date.getFullYear() + add.year
            , o.date.getMonth() + add.month
            , o.date.getDate() + add.week * 7 + add.date
            , o.date.getHours() + add.hour
            , o.date.getMinutes() + add.minute
            , o.date.getSeconds() + add.second
            , o.date.getMilliseconds() + add.millisecond
        );

        return f;
    };

    f.toDate = function () {
        return o.date;
    };

    f.toDisplay = function () {
        return f.toString(any.meta.dateFormat);
    };

    f.toString = function (fmt) {
        if (o.date == null) {
            return "";
        }

        if (fmt == null) {
            fmt = "yyyymmdd";
        }

        var str = fmt.toLowerCase();

        str = str.replace("yyyy", o.date.getFullYear());
        str = str.replace("mm", any.text.lpad(o.date.getMonth() + 1, 2, "0"));
        str = str.replace("dd", any.text.lpad(o.date.getDate(), 2, "0"));
        str = str.replace("hh", any.text.lpad(o.date.getHours(), 2, "0"));
        str = str.replace("ii", any.text.lpad(o.date.getMinutes(), 2, "0"));
        str = str.replace("ss", any.text.lpad(o.date.getSeconds(), 2, "0"));
        str = str.replace("lll", any.text.lpad(o.date.getMilliseconds(), 3, "0"));

        return str;
    };

    f.timestamp = function (withSymbol) {
        if (withSymbol == true) {
            return f.toString("yyyy-mm-dd hh:ii:ss.lll");
        }

        return f.toString("yyyymmddhhiisslll");
    };

    return f;
};


/**
 * 이벤트
 *
 * @param event
 * @returns {{}}
 *
 * @constructs event
 *
 * @example
 * any.event =
 * {
 *     attach: function (obj, name, catcher) {
 *         if (obj == null || typeof (obj) != "object") return;
 *
 *         name = name.toLowerCase();
 *
 *         if (obj.eventHandler == null) {
 *             obj.eventHandler = {};
 *         }
 *
 *         if (obj.eventHandler[name] == null) {
 *             obj.eventHandler[name] = new any.event.handler(obj);
 *         }
 *
 *         return name + ":" + obj.eventHandler[name].addEvent(catcher);
 *     },
 *
 *     detach: function (obj, name, catcher) {
 *         if (obj == null || typeof (obj) != "object") return;
 *
 *         if (name == null) obj.eventHandler = null;
 *
 *         if (obj.eventHandler == null) return;
 *
 *         name = name.toLowerCase();
 *
 *         if (obj.eventHandler[name] == null) return;
 *
 *         if (catcher == null) {
 *             obj.eventHandler[name] = null;
 *         } else {
 *             obj.eventHandler[name].removeEvent(catcher);
 *         }
 *     },
 *
 *     check: function (obj, name) {
 *         if (obj == null || typeof (obj) != "object") return;
 *
 *         try {
 *             if (obj[name] != null || obj[name.toLowerCase()] != null) {
 *                 any.event.attach(obj, name, obj[name] || obj[name.toLowerCase()]);
 *             }
 *         } catch (ex) {
 *         }
 *
 *         if (obj.eventHandler == null) return false;
 *         if (obj.eventHandler[name.toLowerCase()] == null) return false;
 *
 *         return true;
 *     },
 *
 *     call: function (obj, name, args) {
 *         if (obj == null || typeof (obj) != "object") return;
 *
 *         if (any.event.check(obj, name) != true) return true;
 *
 *         return obj.eventHandler[name.toLowerCase()].apply(obj, args || []);
 *     },
 *
 *     handler: function (obj) {
 *         var catchers = {};
 *
 *         var handler = function () {
 *             var result = true;
 *
 *             for (var catcher in catchers) {
 *                 if (catchers[catcher] != null) {
 *                     var res = catchers[catcher].apply(obj, arguments);
 *                     result = result && res;
 *                 }
 *             }
 *
 *             return result;
 *         }
 *
 *         handler.addEvent = function (catcher) {
 *             catchers[catcher] = (typeof (catcher) == "function" ? catcher : eval(catcher));
 *         }
 *
 *         handler.removeEvent = function (name, catcher) {
 *             catchers[name] = null;
 *         }
 *
 *         return handler;
 *     }
 * }
 */
event = function (event) {
    var f = {};

    if (event == null) {
        event = window.event;
    }

    /**
     * 기본 이벤트 버블링 방지
     * 
     * @returns {{}}
     * 
     * @memberOf event#
     */
    preventDefault = function () {
        if (typeof (event.preventDefault) === "function") {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }

        return f;
    };

    f.stopPropagation = function () {
        if (typeof (event.stopPropagation) === "function") {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }

        return f;
    };

    return f;
};

/**
 * 에러
 *
 * @param error
 * @returns {{}}
 *
 * @constructs error
 *
 * @example
 * <구 버전>
 * this.error = function () {
 *         var req = this.req;
 *
 *         for (var item in this.error) {
 *             this.error[item] = null;
 *         }
 *
 *         this.error.show = function () {
 *             if (this.type == null) return;
 *
 *             switch (this.type) {
 *                 case "access":
 *                     alert("정상적인 접근경로가 아닙니다.");
 *                     return true;
 *                 case "session":
 *                     any.replaceLoginPage();
 *                     return true;
 *                 case "biz":
 *                     alert(this.description);
 *                     break;
 *                 default:
 *                     if (this.description == null) {
 *                         alert('[ERROR] 시스템 에러가 발생했습니다.');
 *                     } else {
 *                         if ((top.any != null || any != null) && any.debugMode == true) {
 *                             if (!confirm('시스템에서 다음과 같은 에러가 발생했습니다.\n\n[ERROR:' + this.number + '] ' + this.description + "\n\n위 메세지를 복사하시겠습니까?")) return;
 *                             window.clipboardData.setData("Text", this.description);
 *                         } else {
 *                             alert('시스템에서 다음과 같은 에러가 발생했습니다.\n\n[ERROR:' + this.number + '] ' + this.description);
 *                         }
 *                     }
 *                     break;
 *             }
 *         }
 *
 *         switch (req.status) {
 *             case 0:
 *             case 200:
 *                 var loginErrorString = "<!-- LOGIN ERROR -->";
 *                 if (req.responseText.substr(0, loginErrorString.length) == loginErrorString) {
 *                     any.replaceLoginPage();
 *                     return true;
 *                 } else {
 *                     try {
 *                         var temp = eval("(" + req.responseText + ")");
 *                         for (var item in temp) {
 *                             this.error[item] = temp[item];
 *                         }
 *                         temp = null;
 *                     } catch (ex) {
 *                     }
 *                 }
 *                 break;
 *             case 404:
 *                 this.error.type = "sys";
 *                 this.error.number = req.status;
 *                 this.error.description = '다음 페이지를 찾을 수 없습니다. => ' + this.path;
 *                 break;
 *             default:
 *                 this.error.type = "sys";
 *                 this.error.number = req.status;
 *                 this.error.description = req.statusText + ' => ' + this.path;
 *                 break;
 *         }
 *
 *         return (this.error.type != null);
 *     }
 */
error = function (error) {
    var f = {};

    f.initialize = function () {
        if (any.error.handler != null) {
            return;
        }

        any.error.handler = {};

        any.error.handler["default"] = function (error, callback, proxy) {
            any.dialog(true).alert(getMessage(error, "System Error!")).ok(function () {
                if (callback != null) {
                    callback.apply(error);
                }
            });
        };

        any.error.handler["access"] = function (error, callback, proxy) {
            any.dialog(true).alert(getMessage(error, "Invalid Access!")).ok(function () {
                if (callback != null) {
                    callback.apply(error);
                }
            });
        };

        any.error.handler["session"] = function (error, callback, proxy) {
            any.dialog(true).alert(getMessage(error, "Invalid Session!")).ok(function () {
                if (callback != null) {
                    callback.apply(error);
                }
            });
        };

        any.error.handler["biz"] = function (error, callback, proxy) {
            any.dialog(true).alert(error.message + (error.code == null ? "" : "\n\n[" + error.code + "]")).ok(function () {
                if (callback != null) {
                    callback.apply(error);
                }
            });
        };

        function getMessage(error, deaultMessage) {
            var msg = [];

            msg.push("[ERROR");

            if (error.status == null) {
                msg.push(error.number == null || error.number == 0 ? "" : ":" + error.number);
                msg.push(error.code == null ? "" : ":" + error.code);
            } else {
                msg.push(":" + error.status);
            }

            msg.push("] ");

            if (error.error === true || error.error === "true") {
                msg.push(any.text.nvl(error.message, deaultMessage));
            } else {
                msg.push(error.error + " - " + any.text.nvl(error.message, deaultMessage));
            }

            if (error.path != null && error.path != "") {
                msg.push("\n\n" + error.path);
            }

            return msg.join("");
        }
    };

    f.parse = function (jqXHR, errorThrown, errorSuffix) {
        var error = {};

        try {
            any.object.copyTo(eval("(" + jqXHR.responseText + ")"), error);
            if (error.error == null && errorThrown != null) {
                setError(jqXHR, errorThrown);
            }
        } catch (e) {
            if (jqXHR.status != 200) {
                setError(jqXHR, jqXHR.statusText);
            }
        }

        return error;

        function setError(jqXHR, messageText) {
            error.error = true;
            error.status = jqXHR.status;
            error.number = jqXHR.status;
            error.type = "sys";
            error.message = messageText + errorSuffix;
            error.description = error.message;
        }
    };

    f.handler = function (func) {
        f.initialize();

        any.error.handler[error] = func;

        return f;
    };

    /**
     * 에러 쇼
     *
     * @param callback
     * @param proxy
     * @returns {boolean}
     *
     * @memberOf error#
     *
     * @example
     * <SS>
     * any.showError = function (error) {
     *     if (error.type == null) return;
     *
     *     switch (error.type) {
     *         case "access":
     *             alert("Not accessable.");
     *             return true;
     *         case "session":
     *             any.replaceLoginPage();
     *             return true;
     *         case "biz":
     *             alert(error.description);
     *             break;
     *         default:
     *             if (error.description == null) {
     *                 if (error.errorCode == null) {
     *                     alert('[ERROR] ' + Message.defaultErrorMsg1);
     *                 } else {
     *                     alert(Message.defaultErrorMsg1 + '\n\nMessage Code : ' + error.errorCode);
     *                 }
     *             } else {
     *                 alert(Message.defaultErrorMsg2 + '\n\n[ERROR:' + error.number + '] ' + error.description);
     *             }
     *             break;
     *     }
     * };
     */
    show = function (callback, proxy) {
        if (typeof (error) !== "object" && typeof (error) !== "function") {
            return false;
        }
        if (error.error == null) {
            return false;
        }

        f.initialize();

        if (any.error.handler[error.type] == null) {
            any.error.handler["default"](error, callback, proxy);
        } else {
            any.error.handler[error.type](error, callback, proxy);
        }

        return true;
    };

    return f;
};

/**
 * 쿠키
 *
 * @param name
 * @returns {{}}
 *
 * @constructs cookie
 */
cookie = function (name) {
    var cookie = {};

    var f = {};

    f.expires = function (val) {
        var now = new Date();
        var expiresDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        expiresDate.setDate(expiresDate.getDate() + val);
        cookie.expires = expiresDate.toGMTString();

        return f;
    };

    f.path = function (val) {
        cookie.path = val;

        return f;
    };

    f.domain = function (val) {
        cookie.domain = val;

        return f;
    };

    f.secure = function (val) {
        cookie.secure = val;

        return f;
    };

    /**
     * 쿠키 겟
     *
     * @param defaultValue
     * @returns {string|null|*}
     *
     * @memberOf cookie#
     *
     * @example
     * <구 버전>
     * any.getCookie = function (name) {
     *     var cookieObject = new Object();
     *     var cookieArray = document.cookie.split(";");
     *     var cookieData;
     *
     *     for (var i = 0; i < cookieArray.length; i++) {
     *         cookieData = any.trim(cookieArray[i]);
     *         if (cookieData.indexOf("=") == -1 && cookieData == name) {
     *             return "";
     *         } else if (cookieData.split("=")[0] == name) {
     *             return any.trim(cookieData.split("=")[1]);
     *         }
     *     }
     * }
     */
    get = function (defaultValue) {
        var arr = document.cookie.split(";");

        for (var i = 0, ii = arr.length; i < ii; i++) {
            var val = any.text.trim(arr[i]);
            if (val.indexOf("=") == -1 && val == name) {
                return "";
            } else if (val.split("=")[0] == name) {
                return any.text.trim(val.split("=")[1]);
            }
        }

        if (arguments.length < 1) {
            return null;
        }

        return defaultValue;
    };

    /**
     * 쿠키 셋
     *
     * @param value
     *
     * @memberOf cookie#
     *
     * @example
     * <구 버전>
     * any.setCookie = function (name, value) {
     *     var argv = arguments;
     *     var argc = arguments.length;
     *     var cookieObject = new Object();
     *     var cookieArray = new Array();
     *
     *     if (argc > 2) {
     *         var now = new Date();
     *         var expiresDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
     *         expiresDate.setDate(expiresDate.getDate() + argv[2]);
     *         cookieObject["expires"] = expiresDate.toGMTString();
     *     }
     *
     *     if (argc > 3) cookieObject["path"] = argv[3];
     *     if (argc > 4) cookieObject["domain"] = argv[4];
     *     if (argc > 5) cookieObject["secure"] = argv[5];
     *
     *     if (cookieObject["path"] == null) {
     *         cookieObject["path"] = "/";
     *     }
     *
     *     cookieArray.push(name + "=" + (value == null ? "" : value));
     *     for (var item in cookieObject) {
     *         cookieArray.push(item + "=" + cookieObject[item]);
     *     }
     *
     *     document.cookie = cookieArray.join("; ");
     * }
     */
    set = function (value) {
        var arr = [];

        if (cookie.path == null) {
            cookie.path = any.meta.contextPath + "/";
        }

        arr.push(name + "=" + (value == null ? "" : value));

        for (var item in cookie) {
            arr.push(item + "=" + cookie[item]);
        }

        document.cookie = arr.join("; ");
    };

    f.remove = function () {
        this.expires(-1).set();
    };

    return f;
};

/**
 * 세션
 *
 * @returns {{}}
 *
 * @constructs session
 *
 * @example
 * <구 버전>
 * any.sessionId = function () {
 *     var a = document.cookie.split(";");
 *
 *     for (var i = 0; i < a.length; i++) {
 *         if (any.trim(a[i]).indexOf("JSESSIONID") == 0) return a[i].split("=")[1];
 *     }
 * }();
 */
session = function () {
    var f = {};

    /**
     * 세션 킵
     *
     * @param path
     * @param interval
     *
     * @memberOf session#
     */
    keep = function (path, interval) {
        try {
            if (parent.any != any) {
                return;
            }
        } catch (e) {
        }

        if (path == null || path == "") {
            return;
        }

        if (interval == null) {
            return;
        }
        if (interval.value == null || interval.value == "") {
            return;
        }
        if (interval.unit == null || interval.unit == "") {
            return;
        }

        var delay = Number(interval.value) * {hour: 1440, minute: 60, second: 1}[interval.unit] * 1000;

        var prx = any.proxy().url(path).option({method: "GET", loadingbar: false});

        prx.on("onStart", function () {
            window.setTimeout(prx.execute, delay);
        });

        window.setTimeout(prx.execute, delay);
    };

    return f;
};

/**
 * 유알엘
 *
 * @param fullPath
 * @param params
 * @param contextPath
 * @returns {string|*}
 *
 * @constructs url
 *
 * @example
 * <구 버전>
 * any.getServletPath = function (path) {
 *     if (path == null || path == "") return path;
 *
 *     if (path.substr(0, 1) != "/") {
 *         return top.getRoot() + "/anyfive/framework/servlet/AnyServlet.jsp?" + path.replace("?", "&");
 *     }
 *
 *     if (path.substr(0, top.getRoot().length) != top.getRoot()) {
 *         return top.getRoot() + path;
 *     }
 *
 *     return path;
 * }
 *
 * <SS>
 * any.getServletPath = function (path) {
 *     if (path == null || path == "") return path;
 *
 *     if (path.substr(0, 4).toLowerCase() == "http") return path;
 *     if (path == "about:blank") return path;
 *     if (path == "none:blank") return path;
 *
 *     if (path.substr(0, 1) != "/") {
 *         if (path.substr(path.toLowerCase().lastIndexOf(".jsp"), 4).toLowerCase() == ".jsp") {
 *             var jspPath = (any.servletPath == null ? window.location.pathname : any.servletPath);
 *             return any.getServletPath(jspPath.substr(0, jspPath.lastIndexOf("/") + 1) + path);
 *         }
 *         return addEncNo(any.meta.contextPath + "/" + path.split("?")[0] + ".any" + (path.indexOf("?") == -1 ? "" : path.substr(path.indexOf("?"))));
 *     }
 *
 *     if (path.substr(0, any.meta.contextPath.length + 1) != any.meta.contextPath + "/") {
 *         return addEncNo(any.meta.contextPath + path);
 *     }
 *
 *     return addEncNo(path);
 *
 *     function addEncNo(p) {
 *         if (p.indexOf("Ajax.any") == -1 && (p.indexOf("Ajax::") == -1 || p.indexOf(".any") == -1)) {
 *             return p + (p.indexOf("?") == -1 ? "?" : "&") + "encNo=" + GLOBAL_ENC_NO;
 *         }
 *
 *         return p;
 *     }
 * };
 */
url = function (fullPath, params, contextPath) {
    if (contextPath == null) {
        contextPath = any.meta.contextPath;
    }

    if (arguments.length == 0) {
        return contextPath;
    }

    if (fullPath == null || fullPath == "") {
        return fullPath;
    }

    if (any.text.endsWith(fullPath, ":blank", true)) {
        return fullPath;
    }

    if (fullPath == "." || any.text.startsWith(fullPath, "..") == true) {
        var path = window.location.pathname.replace(contextPath, "");

        if (any.text.startsWith(fullPath, "...") == true && path.indexOf("/") != path.lastIndexOf("/")) {
            var tmp = path.substr(0, path.lastIndexOf("/"));
            if (any.text.endsWith(tmp, "Act") == true) {
                tmp = tmp.substr(0, tmp.length - 3) + "Ajax";
            }
            fullPath = tmp + fullPath.substr(3);
        } else if (any.text.startsWith(fullPath, "..") == true && path.indexOf("/") != path.lastIndexOf("/")) {
            fullPath = path.substr(0, path.lastIndexOf("/")) + fullPath.substr(2);
        } else {
            fullPath = path;
        }
    }

    var pathName;
    var paramStr;

    if (fullPath.indexOf("?") == -1) {
        pathName = fullPath;
        paramStr = "";
    } else {
        pathName = fullPath.substr(0, fullPath.indexOf("?"));
        paramStr = encodeParamStr(fullPath.substr(fullPath.indexOf("?")));
    }

    if (any.url.servletPattern == null) {
        any.url.servletPattern = {};
    }

    var urlPatterns = any.text.nvl(any.url.servletPattern.pattern, "").split("*");
    var urlPrefix;
    var urlSuffix;
    var realPath;

    if (fullPath.indexOf("?") != -1) {
        realPath = fullPath.substr(0, fullPath.indexOf("?"));
    } else {
        realPath = fullPath;
    }

    if (any.text.endsWith(realPath, ".jsp") || realPath.indexOf(".jsp?") != -1) {
        urlPrefix = urlPatterns[0];
        urlSuffix = "";
    } else if (urlPatterns.length != 2) {
        urlPrefix = any.text.blank(any.url.servletPattern.prefix, "");
        urlSuffix = any.text.blank(any.url.servletPattern.suffix, ".any");
    } else {
        urlPrefix = urlPatterns[0];
        urlSuffix = urlPatterns[1];
    }

    if (any.text.endsWith(pathName, urlSuffix) == true) {
    } else if (pathName == "" || pathName == "/" || pathName == contextPath || pathName == contextPath + "/") {
    } else if (pathName.substr(pathName.lastIndexOf("/")).indexOf(".") == -1) {
        pathName = pathName + urlSuffix;
    } else if (pathName.indexOf("::") != -1 && pathName.substr(pathName.lastIndexOf("::")).indexOf(".") == -1) {
        pathName = pathName + urlSuffix;
    } else if (pathName.lastIndexOf(".") != -1 && /[A-Z]/.test(pathName.substr(pathName.lastIndexOf(".") + 1, 1))) {
        pathName = pathName + urlSuffix;
    }

    if (any.text.startsWith(fullPath, "http", true) != true) {
        if (pathName.substr(0, 1) != "/") {
            if (pathName.indexOf("/") == -1 && pathName.indexOf("::") == -1) {
                var pathname = window.location.pathname;
                var lastIndex = pathname.lastIndexOf("/");
                if (lastIndex != -1) {
                    pathName = pathname.substring(0, lastIndex) + "/" + pathName;
                } else {
                    pathName = "/" + pathName;
                }
            } else {
                pathName = "/" + pathName;
            }
        }
        if (contextPath == "" || any.text.startsWith(pathName, contextPath) != true) {
            if (any.text.startsWith(pathName, urlPrefix) != true) {
                pathName = urlPrefix + pathName;
            }
            if (contextPath != "") {
                pathName = contextPath + pathName;
            }
        }
    }

    if (params == null) {
        return pathName + paramStr;
    }

    var prefix = (paramStr == "" ? "?" : "&");

    if (jQuery.type(params) == "string") {
        if (params.substr(0, 1) == "?" || params.substr(0, 1) == "&") {
            params = params.substr(1);
        }
        return pathName + paramStr + (params == "" ? "" : prefix + params);
    }

    var paramArr = [];

    if (jQuery.type(params) == "array") {
        for (var i = 0, ii = params.length; i < ii; i++) {
            var param = params[i];
            if (jQuery.type(param) == "object") {
                if (param.name != null && param.value != null) {
                    paramArr.push(param.name + "=" + encodeURIComponent(param.value));
                }
            } else {
                paramArr.push(param);
            }
        }
    } else if (jQuery.type(params) == "object") {
        for (var item in params) {
            var val = params[item];
            if (val != null) {
                paramArr.push(item + "=" + encodeURIComponent(val));
            }
        }
    }

    return pathName + paramStr + (paramArr == null || paramArr.length == 0 ? "" : prefix + paramArr.join("&"));

    function encodeParamStr(paramStr) {
        if (paramStr == null || paramStr == "") {
            return paramStr;
        }

        var paramStrs = paramStr.split("&");
        var result = [];

        for (var i = 0, ii = paramStrs.length; i < ii; i++) {
            var paramsStrs2 = paramStrs[i].split("=");

            if (paramsStrs2.length == 1) {
                result.push(paramsStrs2[0]);
            } else if (paramsStrs2.length == 2) {
                result.push(paramsStrs2[0] + "=" + encodeURIComponent(decodeURIComponent(paramsStrs2[1])));
            }
        }

        return result.join("&");
    }
};

any.url.amp = function (uri) {
    if (navigator.userAgent.indexOf("Trident/") == -1) {
        return uri;
    }

    var idx = uri.indexOf("?");

    if (idx != -1) {
        return uri.substr(0, idx) + "?" + any.text.replaceAll(uri.substr(idx + 1), "&", "&amp;");
    }

    return uri;
};

any.param = function (arg1, arg2, arg3) {
    if (any.param.values == null) {
        any.param.values = [];

        var $meta = jQuery('meta[name="X-Any-Parameter"]');

        if ($meta.length > 0) {
            for (var i = 0; i < $meta.length; i++) {
                var contents = $meta.eq(i).attr("content").split("=");
                any.param.values.push({name: contents[0], value: contents[1]});
            }
        } else if (window.location.search != null && window.location.search != "") {
            var searches = window.location.search.substr(1).split("&");
            for (var i = 0, ii = searches.length; i < ii; i++) {
                var param = searches[i].split("=");
                any.param.values.push({name: param[0], value: decodeURIComponent(param[1])});
            }
        }
    }

    var f = {};
    var o = {};

    if (arguments.length == 0 || jQuery.type(arg1) != "array") {
        o.params = any.param.values;
    } else {
        o.params = arg1;
    }

    f.get = function (name) {
        var result = [];

        for (var i = 0, ii = o.params.length; i < ii; i++) {
            if (o.params[i].name == name) {
                result.push(o.params[i].value);
            }
        }

        if (result.length == 0) {
            return null;
        }

        if (result.length == 1) {
            return result[0];
        }

        return result;
    };

    f.set = function (name, value, multi) {
        if (name == null) {
            return f;
        }

        if (value == null) {
            for (var i = o.params.length - 1; i >= 0; i--) {
                if (o.params[i].name == name) {
                    o.params.splice(i, 1);
                }
            }
            return f;
        }

        var idx = -1;

        if (multi != true) {
            for (var i = 0, ii = o.params.length; i < ii; i++) {
                if (o.params[i].name == name) {
                    idx = i;
                    break;
                }
            }
        }

        if (idx == -1) {
            o.params.push({name: name, value: value});
        } else {
            o.params[idx].value = value;
        }

        return f;
    };

    f.all = function () {
        return o.params;
    };

    f.count = function (name) {
        var cnt = 0;

        for (var i = 0, ii = o.params.length; i < ii; i++) {
            if (o.params[i].name == name) {
                cnt++;
            }
        }

        return cnt;
    };

    f.toString = function () {
        var result = [];

        for (var i = 0, ii = o.params.length; i < ii; i++) {
            result.push(o.params[i].name + "=" + o.params[i].value);
        }

        return result.join("&");
    };

    if (arguments.length < 1 || jQuery.type(arg1) == "array") {
        return f;
    }

    if (arguments.length < 2) {
        return f.get(arg1);
    }

    return f.set(arg1, arg2, arg3);
};

any.arg = function (name, value) {
    if (any.arg.values == null) {
        if (any.pageType() == "window") {
            try {
                any.arg.values = window.opener.any.window.openWindows[window.name].arguments;
            } catch (e) {
            }
        }
        if (any.arg.values == null) {
            try {
                if (window.frameElement != null && window.frameElement["any-arguments"] != null) {
                    any.arg.values = window.frameElement["any-arguments"];
                }
            } catch (e) {
            }
        }
        if (any.arg.values == null) {
            try {
                if (any.pageType() != "dialog" && parent != window && parent.any != null && parent.any.arg != null) {
                    if (parent.any.arg.values == null) {
                        parent.any.arg.values = {};
                    }
                    any.arg.values = parent.any.arg.values;
                }
            } catch (e) {
            }
        }
        if (any.arg.values == null) {
            any.arg.values = {};
        }
    }

    var f = {};

    f.get = function (name) {
        if (name in any.arg.values) {
            return any.arg.values[name];
        }

        try {
            if (any.pageType() != "dialog" && parent != window && parent.any != null && parent.any.arg != null) {
                return parent.any.arg(name);
            }
        } catch (e) {
        }
    };

    f.set = function (name, value) {
        any.arg.values[name] = value;

        return f;
    };

    f.all = function () {
        return any.arg.values;
    };

    if (arguments.length < 1) {
        return f;
    }

    if (arguments.length < 2) {
        return f.get(name);
    }

    return f.set(name, value);
};

/**
 * 프록시
 *
 * @param {scope}
 * @returns {{}}
 *
 * @constructs proxy
 *
 * @example
 * <구 버전>
 * any.proxy = function () {
 *     var xhr;
 *     var params = new Array();
 *     var datas = new Array();
 *
 *     this.path = null;
 *     this.checkData = null;
 *     this.result = null;
 *     this.onStart = null;
 *     this.onSuccess = null;
 *     this.onFail = null;
 *     this.hideMessage = false;
 *
 *     this.error = new Object();
 *
 *     this.error.show = function () {
 *         xhr.error.show();
 *     }
 *
 *     this.initParam = function () {
 *         params = new Array();
 *     }
 *
 *     this.addParam = function (sName, sValue) {
 *         if (sValue == null) return;
 *
 *         params.push({ name: sName, value: sValue });
 *     }
 *
 *     this.addData = function (vData, sId) {
 *         var data;
 *
 *         if (typeof (vData) == "object") {
 *             data = vData;
 *         } else {
 *             data = document.getElementById(vData);
 *             if (data == null) data = vData;
 *         }
 *
 *         datas.push({ data: data, id: sId });
 *     }
 *
 *     this.addAllData = function () {
 *         var datas = document.getElementsByTagName("DS");
 *
 *         for (var i = 0; i < datas.length; i++) {
 *             if (datas[i].scopeName == "ANY") this.addData(datas[i], datas[i].id);
 *         }
 *     }
 *
 *     this.execute = function (async) {
 *         try {
 *             event.srcElement.blur();
 *         } catch (ex) {
 *         }
 *
 *         if (this.path == null) {
 *             alert("[ERROR] Proxy path is not defined!");
 *             return;
 *         }
 *
 *         if (this.onStart != null) {
 *             this.onStart();
 *         }
 *
 *         if (this.checkData != null && typeof (this.checkData) == "string") {
 *             this.checkData = document.getElementById(this.checkData);
 *         }
 *
 *         for (var item in this.error) {
 *             if (typeof (this.error[item]) != "function") this.error[item] = null;
 *         }
 *
 *         if (async == null) async = true;
 *
 *         if (this.hideMessage != true) {
 *             bfShowBodyMessage();
 *         }
 *
 *         xhr = new any.xmlHttp();
 *
 *         xhr.proxy = this;
 *         xhr.path = this.path;
 *
 *         for (var i = 0; i < params.length; i++) {
 *             xhr.addParam(params[i].name, params[i].value);
 *         }
 *
 *         for (var i = 0; i < datas.length; i++) {
 *             if (xhr.addData(datas[i].data, datas[i].id) != true) {
 *                 if (this.hideMessage != true) {
 *                     bfHideBodyMessage();
 *                 }
 *                 return;
 *             }
 *         }
 *
 *         xhr.send(async);
 *
 *         if (async == true) {
 *             xhr.req.onreadystatechange = function () {
 *                 if (xhr.req.readyState == 4) {
 *                     executeResult();
 *                 }
 *             }
 *         } else {
 *             executeResult();
 *         }
 *     }
 *
 *     this.getText = function () {
 *         return xhr.req.responseText;
 *     }
 *
 *     function executeResult() {
 *         if (xhr.proxy.hideMessage != true) {
 *             bfHideBodyMessage();
 *         }
 *
 *         if (xhr.error() == true) {
 *             for (var item in xhr.error) {
 *                 if (typeof (xhr.error[item]) != "function") xhr.proxy.error[item] = xhr.error[item];
 *             }
 *             if (xhr.proxy.onFail != null) {
 *                 xhr.proxy.onFail();
 *             }
 *         } else {
 *             xhr.proxy.result = any.trim(xhr.req.responseText);
 *             for (var i = 0; i < datas.length; i++) {
 *                 datas[i].data.clearJobType();
 *             }
 *             if (executeData() == true) {
 *                 if (xhr.proxy.checkData != null && xhr.proxy.checkData.rowCount == 0) {
 *                     document.body.style.display = "none";
 *                     alert("요청하신 데이터가 존재하지 않습니다.");
 *                     if (parent.reloadList != null) parent.reloadList();
 *                     if (parent.goList != null) parent.goList();
 *                 } else {
 *                     if (parent.reloadList != null && xhr.path.indexOf("::retrieve") == -1 && xhr.path.indexOf(".Retrieve") == -1) {
 *                         parent.reloadList();
 *                     }
 *                     if (xhr.proxy.onSuccess != null) {
 *                         xhr.proxy.onSuccess();
 *                     }
 *                 }
 *             }
 *         }
 *
 *         xhr.req = null;
 *         xhr = null;
 *     }
 *
 *     function executeData() {
 *         if (xhr.proxy.result == "") return true;
 *
 *         var dsArray
 *
 *         try {
 *             dsArray = eval("([" + xhr.proxy.result + "])");
 *         } catch (ex) {
 *             return true;
 *         }
 *
 *         var ds;
 *
 *         for (var i = 0; i < dsArray.length; i++) {
 *             if (dsArray[i].id == null) continue;
 *             if (dsArray[i].header == null) continue;
 *             if (dsArray[i].data == null) continue;
 *             ds = document.getElementById(dsArray[i].id);
 *             if (ds == null) {
 *                 alert("데이타셋이 존재하지 않습니다.\n\n" + dsArray[i].id);
 *                 continue;
 *             }
 *             ds.load(dsArray[i]);
 *         }
 *
 *         return true;
 *     }
 * }
 *
 * <SS>
 * any.proxy = function () {
 *     var xhr = null;
 *     var params = new Array();
 *     var datas = new Array();
 *
 *     this.path = null;
 *     this.checkData = null;
 *     this.result = null;
 *     this.hideMessage = false;
 *     this.error = new Object();
 *
 *     this.error.show = function () {
 *         xhr.error.show();
 *     };
 *
 *     this.initParam = function () {
 *         params = new Array();
 *     };
 *
 *     this.addParam = function (sName, sValue) {
 *         if (sValue == null) return;
 *
 *         params.push({ name: sName, value: sValue });
 *     };
 *
 *     this.setParam = function (sName, sValue) {
 *         for (var i = 0; i < params.length; i++) {
 *             if (params[i].name != sName) continue;
 *             params[i].value = sValue;
 *             return;
 *         }
 *
 *         this.addParam(sName, sValue);
 *     };
 *
 *     this.getParam = function (sName) {
 *         if (params == null) return null;
 *
 *         var values = [];
 *
 *         for (var i = 0; i < params.length; i++) {
 *             if (params[i].name == sName) values.push(params[i].value);
 *         }
 *
 *         return values;
 *     };
 *
 *     this.addData = function (vData, sId) {
 *         var data;
 *
 *         if (typeof (vData) == "object") {
 *             data = vData;
 *         } else {
 *             data = document.getElementById(vData);
 *             if (data == null) data = vData;
 *         }
 *
 *         datas.push({ data: data, id: sId });
 *     };
 *
 *     this.addAllData = function () {
 *         var datas = document.getElementsByTagName("DS");
 *
 *         for (var i = 0; i < datas.length; i++) {
 *             if (datas[i].scopeName.toUpperCase() == "ANY") this.addData(datas[i], datas[i].id);
 *         }
 *     };
 *
 *     this.execute = function (async) {
 *         try {
 *             event.srcElement.blur();
 *         } catch (ex) {
 *         }
 *
 *         if (this.path == null || this.path == "") {
 *             alert("[ERROR] Proxy path is not defined!");
 *             return;
 *         }
 *
 *         any.tabFrameHeightResizeDisable = true;
 *
 *         any.event.call(this, "onStart");
 *
 *         if (this.checkData != null && typeof (this.checkData) == "string") {
 *             this.checkData = document.getElementById(this.checkData);
 *         }
 *
 *         for (var item in this.error) {
 *             if (typeof (this.error[item]) != "function") this.error[item] = null;
 *         }
 *
 *         if (async == null) async = true;
 *
 *         if (this.hideMessage != true) {
 *             bfShowBodyMessage();
 *         }
 *
 *         xhr = new any.xmlHttp();
 *
 *         xhr.proxy = this;
 *         xhr.path = this.path;
 *
 *         for (var i = 0; i < params.length; i++) {
 *             xhr.addParam(params[i].name, params[i].value);
 *         }
 *
 *         for (var i = 0; i < datas.length; i++) {
 *             if (xhr.addData(datas[i].data, datas[i].id) != true) {
 *                 if (this.hideMessage != true) {
 *                     bfHideBodyMessage();
 *                 }
 *                 return;
 *             }
 *         }
 *
 *         xhr.send(async);
 *
 *         if (async == true) {
 *             xhr.req.onreadystatechange = function () {
 *                 if (xhr.req.readyState == 4) {
 *                     executeResult();
 *                 }
 *             };
 *         } else {
 *             executeResult();
 *         }
 *     };
 *
 *     this.getText = function () {
 *         return xhr.req.responseText;
 *     };
 *
 *     function executeResult() {
 *         if (xhr.error() == true) {
 *             for (var item in xhr.error) {
 *                 if (typeof (xhr.error[item]) != "function") xhr.proxy.error[item] = xhr.error[item];
 *             }
 *             if (xhr.proxy.hideMessage != true) {
 *                 bfHideBodyMessage();
 *             }
 *             any.event.call(xhr.proxy, "onFail");
 *         } else {
 *             xhr.proxy.result = any.trim(xhr.req.responseText);
 *             for (var i = 0; i < datas.length; i++) {
 *                 datas[i].data.clearJobType();
 *             }
 *             executeData();
 *             if (any.event.call(xhr.proxy, "onSuccessBefore", null, true) != true) return;
 *             if (xhr.proxy.hideMessage != true) {
 *                 bfHideBodyMessage();
 *             }
 *             if (xhr.proxy.checkData != null && xhr.proxy.checkData.rowCount == 0) {
 *                 document.body.style.display = "none";
 *                 alert("No data found.");
 *                 try {
 *                     if (parent.reloadList != null) parent.reloadList();
 *                     if (parent.unloadPage != null) parent.unloadPage();
 *                 } catch (ex) {
 *                 }
 *             } else {
 *                 try {
 *                     if (String(xhr.req.getResponseHeader("X-AnyWorks-Data-Updated")).toLowerCase() == "true") {
 *                         parent.reloadList();
 *                     }
 *                 } catch (ex) {
 *                 }
 *                 any.event.call(xhr.proxy, "onSuccess");
 *             }
 *         }
 *
 *         any.event.call(xhr.proxy, "onComplete");
 *
 *         any.tabFrameHeightResizeDisable = false;
 *
 *         bfSetTabFrameHeight(xhr.proxy.disableTabFrameResize != true);
 *
 *         xhr.req = null;
 *         xhr = null;
 *     }
 *
 *     function executeData() {
 *         if (xhr.proxy.result == "") return;
 *
 *         var dsArray;
 *
 *         try {
 *             dsArray = eval("([" + xhr.proxy.result + "])");
 *         } catch (ex) {
 *             return;
 *         }
 *
 *         var ds;
 *
 *         for (var i = 0; i < dsArray.length; i++) {
 *             if (dsArray[i].id == null) continue;
 *             if (dsArray[i].header == null) continue;
 *             if (dsArray[i].data == null) continue;
 *             ds = document.getElementById(dsArray[i].id);
 *             if (ds == null) {
 *                 alert("Dataset is not found.\n\n" + dsArray[i].id);
 *                 continue;
 *             }
 *             ds.load(dsArray[i]);
 *         }
 *     }
 * };
 */
proxy = function (scope) {
    var f = {};
    var o = {$f: jQuery(f), type: any.config.proxyType, params: [], datas: [], grids: [], files: []};

    o.options = {async: true, cache: false, loadingbar: true, reloadList: true};

    /**
     * 유알엘
     *
     * @param url
     * @returns {*|{}}
     *
     * @memberOf proxy#
     */
    url = function (url) {
        if (arguments.length == 0) {
            return any.url(o.url);
        }

        o.url = url;

        return f;
    };

    /**
     * 타입
     *
     * @param type
     * @returns {{}|*}
     *
     * @memberOf proxy#
     */
    type = function (type) {
        if (arguments.length == 0) {
            return o.type;
        }

        o.type = type;

        return f;
    };

    /**
     * 헤더
     * 
     * @param name
     * @param value
     * @returns {null|*|{}}
     *
     * @memberOf proxy#
     */
    header = function (name, value) {
        if (name == "") {
            return;
        }

        if (arguments.length == 0) {
            return;
        }

        if (arguments.length == 1) {
            return o.headers == null ? null : o.headers[name];
        }

        if (value == null) {
            return f;
        }

        if (o.headers == null) {
            o.headers = {};
        }

        o.headers[name] = value;

        return f;
    };

    /**
     * 파람
     * 
     * @param name
     * @param value
     * @param multi
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    param = function (name, value, multi) {
        if (arguments.length == 0) {
            return o.params;
        }

        if (arguments.length == 1) {
            return any.param(o.params).get(name);
        }

        any.param(o.params).set(name, value, multi);

        return f;
    };

    /**
     * 파람스
     *
     * @param params
     * @param multi
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    params = function (params, multi) {
        for (var i = 0; i < params.length; i++) {
            f.param(params[i].name, params[i].value, multi);
        }

        return f;
    };

    /**
     * 아웃풋
     *
     * @param ds
     * @returns {{}|boolean|*}
     *
     * @memberOf proxy#
     */
    output = function (ds) {
        if (ds === false) {
            o.output = false;
            return f;
        }

        if (arguments.length == 0) {
            return o.output;
        }

        if (typeof (ds) === "object") {
            o.output = ds;
        } else {
            o.output = any.ds(ds, scope);
        }

        return f;
    };

    /**
     * 데이터
     *
     * @param ds
     * @param id
     * @param output
     * @param withoutBind
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    data = function (ds, id, output, withoutBind) {
        if (arguments.length == 0) {
            return o.datas;
        }

        if (ds == null) {
            return f;
        }

        if (typeof (ds) === "object") {
            if (ds.id == null) {
                return f;
            }
        } else {
            ds = any.ds(ds, scope);
        }

        for (var i = 0, ii = o.datas.length; i < ii; i++) {
            if (o.datas[i].ds == ds && o.datas[i].id == id) {
                return f;
            }
        }

        o.datas.push({ds: ds, id: id, output: output, withoutBind: withoutBind});

        if (o.type != null && o.type.toLowerCase() === "json") {
            var selectors;

            selectors = [];
            selectors.push('[any--proxy--file="true"][bind^="' + ds.id + ':"]');
            selectors.push('[any--proxy--file="true"][bind="' + ds.id + '"]');
            selectors.push('[any--proxy--file="true"][name^="' + ds.id + '."]');
            selectors.push('[any--proxy--file="true"][id^="' + ds.id + '."]');

            jQuery(selectors.join(",")).each(function () {
                f.file(this, true);
            });

            selectors = [];
            selectors.push('[any--proxy--grid="true"][bind^="' + ds.id + ':"]');
            selectors.push('[any--proxy--grid="true"][bind="' + ds.id + '"]');
            selectors.push('[any--proxy--grid="true"][name^="' + ds.id + '."]');
            selectors.push('[any--proxy--grid="true"][id^="' + ds.id + '."]');

            jQuery(selectors.join(",")).each(function () {
                jQuery(this).find('[any--proxy--file="true"]').each(function () {
                    f.file(this, true);
                });
            });
        }

        return f;
    };

    /**
     * 그리드
     *
     * @param grid
     * @param id
     * @returns {}
     *
     * @memberOf proxy#
     */
    grid = function (grid, id) {
        if (arguments.length == 0) {
            return o.grids;
        }

        if (grid == null) {
            return f;
        }

        if (typeof (grid) !== "object") {
            grid = document.getElementById(grid);
        }

        if (grid == null) {
            return f;
        }

        for (var i = 0, ii = o.grids.length; i < ii; i++) {
            if (o.grids[i].grid == grid) {
                return f;
            }
        }

        var $grid = jQuery(grid);
        var ds = $grid.prop("ds");

        f.data(ds, id == null ? ds.id : id);

        $grid.find('[any--proxy--file="true"]').each(function () {
            f.file(this);
        });

        return f;
    };

    /**
     * 파일
     *
     * @param file
     * @param id
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    file = function (file, id) {
        if (arguments.length == 0) {
            return o.files;
        }

        if (file == null) {
            return f;
        }

        if (typeof (file) !== "object") {
            file = document.getElementById(file);
        }

        if (file == null) {
            return f;
        }

        for (var i = 0, ii = o.files.length; i < ii; i++) {
            if (o.files[i] == file) {
                return f;
            }
        }

        var row = -1;

        for (var i = 0, ii = o.files.length; i < ii; i++) {
            var pos1 = jQuery(o.files[i]).position();
            var pos2 = jQuery(file).position();
            if (pos1.top > pos2.top || (pos1.top == pos2.top && pos1.left > pos2.left)) {
                row = i;
                break;
            }
        }

        if (row == -1) {
            o.files.push(file);
        } else {
            o.files.splice(row, 0, file);
        }

        if (id !== true) {
            var ds = jQuery(file).prop("ds");
            f.data(ds, id == null ? ds.id : id, false, true);
        }

        return f;
    };

    /**
     * 파일즈
     *
     * @param context
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    files = function (context) {
        jQuery('[any--proxy--file="true"]', context).each(function () {
            f.file(this);
        });

        return f;
    };

    /**
     * 제이슨
     *
     * @param key
     * @param json
     * @returns {*}
     *
     * @memberOf proxy#
     */
    json = function (key, json) {
        if (o.jsons == null) {
            o.jsons = {};
        }

        if (arguments.length < 2) {
            return o.jsons[key];
        }

        o.jsons[key] = json;
    };

    /**
     * 제이슨즈
     *
     * @param withoutBind
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    jsons = function (withoutBind) {
        var jsons = [];

        if (o.datas.length == 0) {
            return jsons;
        }

        for (var i = 0, ii = o.datas.length; i < ii; i++) {
            if (o.datas[i].output == true) {
                continue;
            }

            if (withoutBind == true || o.datas[i].withoutBind == true) {
                jsons.push(o.datas[i].ds.jsonStringWithoutBind(o.datas[i].id));
            } else {
                jsons.push(o.datas[i].ds.jsonString(o.datas[i].id));
            }
        }

        return jsons;
    };

    /**
     * 폼
     *
     * @param selector
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    form = function (selector) {
        if (selector == null) {
            return f;
        }

        if (o.$forms == null) {
            o.$forms = (selector.jquery == jQuery.fn.jquery ? selector : jQuery(selector));
        } else {
            o.$forms = o.$forms.add(selector);
        }

        return f;
    };

    /**
     * 바디
     *
     * @param body
     *
     * @memberOf proxy#
     */
    body = function (body) {
        o.body = body;
    }

    /**
     * 옵션
     *
     * @returns {{}|*}
     *
     * @memberOf proxy#
     */
    option = function () {
        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.options[arguments[0]];
        }

        any.copyArguments(o.options, arguments);

        return f;
    };

    /**
     * 에러
     *
     * @param jqXHR
     * @param errorThrown
     * @returns {boolean}
     *
     * @memberOf proxy#
     */
    error = function (jqXHR, errorThrown) {
        for (var item in f.error) {
            delete (f.error[item]);
        }

        if (jqXHR.readyState == 0 && jqXHR.status == 0) {
            f.error.show = new Function();
        } else {
            f.error.show = function (callback) {
                any.error(this).show(callback, f);
            };
        }

        any.object.copyTo(any.error().parse(jqXHR, errorThrown, "\n\n" + f.url()), f.error);

        return f.error.error != null;
    };

    /**
     * 에이치티엠엘
     *
     * @param container
     * @param callback
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    html = function (container, callback) {
        var $container;

        if (jQuery.type(container) == "object" && container.constructor == jQuery) {
            $container = container;
        } else {
            $container = jQuery(container);
        }

        f.on("onSuccess", function () {
            $container.html(this.result).controls(function () {
                var self = this;

                jQuery(this).find('script[type="text/any-initialize"]').each(function () {
                    if (jQuery(this).prev().controlName() == null) {
                        new Function(jQuery(this).text()).apply(self);
                    }
                });

                if (callback != null) {
                    callback.apply(this);
                }
            });
        });

        f.on("onError", function () {
            $container.empty().append(jQuery('<pre>').text(this.error.message));
        });

        o.options.loadingbar = false;

        return f;
    };

    /**
     * 프로그레스 바
     *
     * @param options
     * @returns {{}|*|{options: *, progress: {}}}
     *
     * @memberOf proxy#
     */
    progressbar = function (options) {
        if (arguments.length < 1) {
            return o.progressbar;
        }

        if (options === false) {
            return f;
        }

        o.progressbar = {options: options === true ? {} : options, progress: any.progress(f)};

        if (o.progressbar.options.defaultLabel == null) {
            o.progressbar.options.defaultLabel = any.message("any.com.progressbar.defaultLabel", "Please Wait...");
        }

        if (o.progressbar.options.completeLabel == null) {
            o.progressbar.options.completeLabel = any.message("any.com.progressbar.completeLabel", "Completed!");
        }

        if (o.progressbar.options.progressLabel == null) {
            o.progressbar.options.progressLabel = function (data) {
                return any.text.formatNumber(data.progress * 100, 2) + "%";
            };
        }

        return f;
    };

    /**
     * 온
     *
     * @param name
     * @param func
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    on = function (name, func) {
        o.$f.on(name, func);

        return f;
    };

    /**
     * 프리벤트
     *
     * @param targetObject
     * @param releaseEvent
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    prevent = function (targetObject, releaseEvent) {
        o.prevent = {targetObject: targetObject, releaseEvent: any.text.empty(releaseEvent, "complete")};

        return f;
    };

    /**
     * 익젝큐트
     *
     * @param withoutBind
     *
     * @memberOf proxy#
     */
    execute = function (withoutBind) {
        if (o.url == null) {
            return;
        }

        if (o.prevent != null && o.prevent.targetObject != null) {
            if (o.prevent.targetObject["any-proxy-executing"] === true) {
                return;
            }
            o.prevent.targetObject["any-proxy-executing"] = true;
        }

        var $focusButton = jQuery('button:focus');

        if ($focusButton.length > 0) {
            jQuery('<button>').css({"width": "1px", "height": "1px"}).insertAfter($focusButton).focus().remove();
        }

        o.$f.fire("onStart");

        any.autoHeight();
        any.fullHeight();

        uploadForms();

        function uploadForms() {
            if (o.$forms == null || o.$forms.find('input:file').length == 0) {
                uploadFiles();
                return;
            }

            any.loading().container(o.options["loading-container"]).show(0, 0.25);

            for (var i = 0, ii = o.$forms.length; i < ii; i++) {
                o.$forms.eq(i).data("next-form", o.$forms[i + 1]);
            }

            uploadNext();

            function uploadNext(obj) {
                var form = (o.$forms.length == 0 ? null : (obj == null ? o.$forms[0] : jQuery(obj).data("next-form")));

                if (form == null) {
                    any.loading().container(o.options["loading-container"]).hide();
                    uploadFiles();
                } else {
                    any.file().url(any.control("any-file").config("url.upload")).event("onUploadSuccess", function () {
                        jQuery(form).fire("onUploadSuccess", arguments);
                        uploadNext(form);
                    }).event("onUploadError", function (error) {
                        any.loading().container(o.options["loading-container"]).hide();
                        any.error(error).show();
                    }).upload(form);
                }
            }
        }

        function uploadFiles() {
            if (o.files.length == 0) {
                executeAjax(withoutBind);
                return;
            }

            any.loading().container(o.options["loading-container"]).show(0, 0.25);

            for (var i = 0, ii = o.files.length; i < ii; i++) {
                var $file = jQuery(o.files[i]);

                $file.data("next-file", o.files[i + 1]);

                o.files[i].onUploadSuccessHandler = function () {
                    var $file = jQuery(this);
                    var grid = $file.data("grid");
                    var colInfo = $file.data("grid-column");
                    var rowId = $file.data("grid-row-id");
                    if (grid != null && colInfo != null) {
                        var gridDsId = null;
                        for (var i = 0, ii = o.datas.length; i < ii; i++) {
                            if (o.datas[i].ds == jQuery(grid).prop("ds")) {
                                gridDsId = o.datas[i].id;
                                break;
                            }
                        }
                        if (gridDsId != null) {
                            for (var i = 0, ii = o.datas.length; i < ii; i++) {
                                if (o.datas[i].ds != $file.prop("ds")) {
                                    continue;
                                }
                                if (colInfo.controlds == null) {
                                    o.datas[i].id = gridDsId + "_" + $file.val();
                                } else {
                                    grid.setValue(grid.getRowIndex(rowId), colInfo.controlds, $file.prop("ds").jsonString());
                                    o.datas.splice(i, 1);
                                }
                                break;
                            }
                        }
                    }
                    uploadNext(this);
                };

                o.files[i].onUploadErrorHandler = function () {
                    any.loading().container(o.options["loading-container"]).hide();
                };

                if ($file.data("upload-event-binded") == true) {
                    continue;
                }

                $file.data("upload-event-binded", true);

                $file.on("onUploadComplete", function (event, isSuccess) {
                    if (isSuccess == true) {
                        this.onUploadSuccessHandler();
                    } else {
                        this.onUploadErrorHandler();
                    }
                });
            }

            uploadNext();

            function uploadNext(obj) {
                var file = (o.files.length == 0 ? null : (obj == null ? o.files[0] : jQuery(obj).data("next-file")));

                if (file == null) {
                    any.loading().container(o.options["loading-container"]).hide();
                    executeAjax(withoutBind);
                } else if (jQuery(file).isDisabled() == true) {
                    uploadNext(file);
                } else {
                    file.upload();
                }
            }
        }

        function executeAjax(withoutBind) {
            var metaToken = jQuery('meta[name="X-Any-Servlet-Token"]').attr("content");
            var rootWin = any.rootWindow();

            if (any.text.isEmpty(rootWin.any.meta.servletToken) == true) {
                rootWin.any.meta.servletToken = metaToken;
            }

            var options = {
                url: f.url(),
                method: any.text.blank(o.options.method, "POST"),
                headers: o.headers,
                async: o.options.async,
                cache: o.options.cache
            };

            if (any.text.isEmpty(rootWin.any.meta.servletToken) != true) {
                if (options.headers == null) {
                    options.headers = {};
                }
                options.headers["X-AnyWorks-Servlet-Token"] = rootWin.any.meta.servletToken;
            }

            if (o.servletTokenRetry == true) {
                delete (o.servletTokenRetry);
                if (options.headers == null) {
                    options.headers = {};
                }
                options.headers["X-AnyWorks-Servlet-Token-Retry"] = "true";
            }

            if (o.type != null && o.type.toLowerCase() === "json") {
                options.contentType = "application/json";

                options.data = function () {
                    if ("body" in o) {
                        if (o.body == null || typeof (o.body) === "string") {
                            return o.body;
                        }
                        return JSON.stringify(o.body);
                    }
                    if (o.ajaxData == null || o.reload != true) {
                        o.ajaxData = {};
                        for (var i = 0, ii = o.params.length; i < ii; i++) {
                            o.ajaxData[o.params[i].name] = o.params[i].value;
                        }
                        for (var i = 0, ii = o.datas.length; i < ii; i++) {
                            o.ajaxData[any.text.empty(o.datas[i].id, o.datas[i].ds.id)] = o.datas[i].ds.toJSON();
                        }
                        if (o.jsons != null) {
                            for (var key in o.jsons) {
                                o.ajaxData[key] = o.jsons[key];
                            }
                        }
                    }
                    return JSON.stringify(o.ajaxData);
                }();
            } else {
                options.data = function () {
                    if (o.ajaxData == null || o.reload != true) {
                        o.ajaxData = [];
                        for (var i = 0, ii = o.params.length; i < ii; i++) {
                            o.ajaxData.push(o.params[i].name + "=" + encodeURIComponent(o.params[i].value));
                        }
                        var jsons = f.jsons(withoutBind);
                        if (jsons.length > 0) {
                            o.ajaxData.push('_DATA_SET_JSON_=' + encodeURIComponent('[' + jsons.join(",") + ']'));
                        }
                    }
                    if (o.$forms != null) {
                        if (o.ajaxData == null) {
                            o.ajaxData = [];
                        }
                        for (var i = 0, ii = o.$forms.length; i < ii; i++) {
                            o.ajaxData.push(o.$forms.eq(i).serialize());
                        }
                    }
                    return o.ajaxData.join("&");
                }();
            }

            delete (f.xhr);

            options.beforeSend = function (jqXHR, settings) {
                f.xhr = jqXHR;
                ajaxStart();
            };

            options.success = function (data, textStatus, jqXHR) {
                f.xhr = jqXHR;
                ajaxComplete();
                if (String(jqXHR.getResponseHeader("X-AnyWorks-Servlet-Token-Invalid")).toLowerCase() == "true") {
                    o.servletTokenRetry = true;
                    resetToken(jqXHR);
                    executeAjax(true);
                    return;
                }
                try {
                    f.response = {data: data, textStatus: textStatus, jqXHR: jqXHR};
                    f.result = any.text.trim(jqXHR.responseText);
                } catch (e) {
                    return;
                }
                if (f.error(jqXHR) == true) {
                    o.$f.fire("onError");
                    return;
                }
                for (var i = 0, ii = o.datas.length; i < ii; i++) {
                    o.datas[i].ds.clearJobType();
                }
                if (o.output !== false) {
                    if (jqXHR.getResponseHeader("X-AnyWorks-Json-Type") == "MODEL_JSON2") {
                        parseModelDataset(data);
                    } else if (jQuery.type(data) === "array") {
                        f.response.model = data;
                        parseModelDataset(data);
                    } else if (jqXHR.getResponseHeader("X-AnyWorks-Json-Type") == "MODEL_JSON") {
                        for (var item in data) {
                            f.response.model = data[item];
                            parseModelDataset(data[item]);
                            break;
                        }
                    } else {
                        parseDataset(f.result);
                    }
                }
                try {
                    if (o.options.reloadList == true && String(jqXHR.getResponseHeader("X-AnyWorks-Data-Updated")).toLowerCase() == "true") {
                        any.reloadList();
                    }
                } catch (e) {
                    throw e;
                } finally {
                    resetToken(jqXHR);
                    o.$f.fire("onSuccess");
                }
                if (o.prevent != null && o.prevent.releaseEvent == "success") {
                    delete (o.prevent.targetObject["any-proxy-executing"]);
                }
            };

            options.error = function (jqXHR, textStatus, errorThrown) {
                f.xhr = jqXHR;
                ajaxComplete();
                resetToken(jqXHR);
                if (String(jqXHR.getResponseHeader("X-AnyWorks-Servlet-Token-Invalid")).toLowerCase() == "true") {
                    o.servletTokenRetry = true;
                    executeAjax(true);
                    return;
                }
                f.error(jqXHR, errorThrown);
                o.$f.fire("onError");
                if (o.prevent != null && o.prevent.releaseEvent == "error") {
                    delete (o.prevent.targetObject["any-proxy-executing"]);
                }
            };

            options.complete = function (jqXHR, textStatus) {
                f.xhr = jqXHR;
                resetToken(jqXHR);
                o.$f.fire("onComplete");
                any.autoHeight();
                any.fullHeight();
                delete (o.reload);
                if (o.prevent != null && o.prevent.releaseEvent == "complete") {
                    delete (o.prevent.targetObject["any-proxy-executing"]);
                }
            };

            f.ajax = jQuery.ajax(options);

            function resetToken(jqXHR) {
                var responseToken = jqXHR.getResponseHeader("X-AnyWorks-Servlet-Token");

                if (any.text.isEmpty(responseToken) != true) {
                    rootWin.any.meta.servletToken = String(responseToken);
                } else if (metaToken != null) {
                    rootWin.any.meta.servletToken = metaToken;
                }
            }
        }
    };

    /**
     * 이즈 리로드
     *
     * @returns {boolean}
     *
     * @memberOf proxy#
     */
    isReload = function () {
        return o.reload === true;
    };

    /**
     * 리로드
     *
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    reload = function () {
        o.reload = true;
        f.execute();

        return f;
    };

    /**
     * 어보트
     *
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    abort = function () {
        if (f.ajax != null) {
            f.ajax.abort();
        }

        return f;
    };

    /**
     * 클론
     *
     * @returns {*}
     *
     * @memberOf proxy#
     */
    clone = function () {
        return any.proxy(scope).copy(o);
    };

    /**
     * 카피
     *
     * @param obj
     * @returns {{}}
     *
     * @memberOf proxy#
     */
    copy = function (obj) {
        o.url = obj.url;

        o.params = any.object.clone(obj.params);
        o.datas = any.object.clone(obj.datas);
        o.grids = any.object.clone(obj.grids);
        o.files = any.object.clone(obj.files);

        return f;
    };

    return f;

    function ajaxStart() {
        if (o.options.loadingbar == true) {
            any.loading(true).container(o.options["loading-container"]).show(o.progressbar == null ? 3000 : 0, 0.8);

            if (o.progressbar != null) {
                if (any.loading.ajax.$layer == null) {
                    return;
                }

                if (o.$progressbar != null && o.$progressbar.length > 0) {
                    o.$progressbar.remove();
                }

                o.$progressbar = jQuery('<div>').attr({"defaultLabel": o.progressbar.options.defaultLabel}).css({
                    "position": "absolute",
                    "z-index": any.loading.ajax.$layer.css("z-index")
                });

                o.$progressbar.insertAfter(any.loading.ajax.$layer).on("onCreate", function () {
                    resetProgressbarPosition();
                }).control("any-progressbar", function () {
                    this.setOption({value: false});
                });

                if (o.progressbar.progress != null) {
                    o.progressbar.progress.callback(function (data) {
                        resetProgressbarPosition();
                        if (o.$progressbar == null || (data.completed != true && data.totalValue == 0)) {
                            return;
                        }
                        o.$progressbar.val(data.progress);
                        if (data.completed == true || data.progress == 1) {
                            o.$progressbar.prop("label", o.progressbar.options.completeLabel);
                            this.stop();
                        } else if (typeof (o.progressbar.options.progressLabel) === "function") {
                            o.$progressbar.prop("label", o.progressbar.options.progressLabel.apply(o.progressbar, [data]));
                        } else {
                            o.$progressbar.prop("label", o.progressbar.options.progressLabel);
                        }
                    }).start();
                }
            }
        }

        function resetProgressbarPosition() {
            if (o.$progressbar != null && any.loading.ajax.$layer != null) {
                o.$progressbar.width(Math.min(Math.max(parseInt(any.loading.ajax.$layer.width() / 1.5, 10), 100), 400));
                o.$progressbar.css({
                    "top": (any.loading.ajax.$layer.height() - o.$progressbar.height()) / 2,
                    "left": (any.loading.ajax.$layer.width() - o.$progressbar.width()) / 2
                });
            }
        }
    }

    function ajaxComplete() {
        if (o.options.loadingbar == true) {
            any.loading(true).container(o.options["loading-container"]).hide();

            if (o.progressbar != null) {
                if (o.progressbar.progress != null) {
                    o.progressbar.progress.stop();
                }

                if (o.$progressbar != null) {
                    o.$progressbar.prop("label", o.progressbar.options.completeLabel).prop("value", 1);
                    o.$progressbar.remove();
                    o.$progressbar = null;
                }
            }
        }

        for (var i = 0, ii = o.files.length; i < ii; i++) {
            if (typeof (o.files[i].hideProgressBar) === "function") {
                o.files[i].hideProgressBar();
            }
        }
    }

    function parseModelDataset(model) {
        if (model == null) {
            return;
        }

        if (o.output != null) {
            parse(o.output, model);
            return;
        }

        for (var id in model) {
            parse(any.ds(id, scope), model[id]);
        }

        function parse(ds, model) {
            if (ds.dataLoader() != null) {
                ds.dataLoader().apply(ds, [model]);
            } else if (jQuery.type(model) === "object") {
                ds.loadData([model], true, model["_META_MAP"]);
            } else if (jQuery.type(model) === "array") {
                ds.loadData(model, true);
            }
        }
    }

    function parseDataset(str) {
        if (str == null || str == "") {
            return;
        }

        var result;

        try {
            result = eval("([" + str + "])");
        } catch (e) {
            return;
        }

        var jsons;

        if (result != null && result.length > 0 && result[0]["_DATA_SET_JSON_"] != null) {
            jsons = result[0]["_DATA_SET_JSON_"];
        } else {
            jsons = result;
        }

        for (var i = 0; i < jsons.length; i++) {
            if (jsons[i].data == null) {
                continue;
            }
            for (var j = 0; j < jsons[i].data.length; j++) {
                var data = jsons[i].data[j].data;
                for (var key in data) {
                    var val = data[key];
                    if (typeof (val) === "string" && any.text.startsWith(val, "new Date(") && any.text.endsWith(val, ")")) {
                        data[key] = eval(val);
                    }
                }
            }
        }

        if (o.output != null) {
            var json = (jsons.length > 0 ? jsons[0] : null);
            if (json == null || json.header == null || json.data == null) {
                o.output.load(null);
            } else {
                o.output.load(json);
            }
            return;
        }

        for (var i = 0, ii = jsons.length; i < ii; i++) {
            var json = jsons[i];
            if (json.id == null || json.header == null || json.data == null) {
                continue;
            }
            var loaded = false;
            for (var j = 0, jj = o.datas.length; j < jj; j++) {
                if (o.datas[j].id != json.id) {
                    continue;
                }
                o.datas[j].ds.load(json);
                loaded = true;
            }
            if (loaded != true) {
                any.ds(json.id, scope).load(json);
            }
        }
    }
};

any.form = function (selector) {
    var f = {};
    var o = {};

    if (selector == null) {
        o.$form = jQuery('<form>').attr({"method": "POST"}).appendTo(document.body);
    } else {
        o.$form = jQuery(selector);
    }

    f.attr = function () {
        o.$form.attr.apply(o.$form, Array.prototype.slice.call(arguments));

        return f;
    };

    f.param = function (name, value, multi) {
        var $elem = o.$form.find('input:hidden[name="' + name + '"]');

        if ($elem.length == 0 || multi == true) {
            $elem = jQuery('<input>').attr({type: "hidden", name: name}).appendTo(o.$form);
        }

        $elem.val(value);

        return f;
    };

    f.params = function (params, multi) {
        for (var i = 0; i < params.length; i++) {
            f.param(params[i].name, params[i].value, multi);
        }

        return f;
    };

    f.data = function (ds, id, scope, withoutBind) {
        if (arguments.length == 0) {
            return o.datas;
        }

        if (ds == null) {
            return f;
        }

        if (o.datas == null) {
            o.datas = [];
        }

        if (typeof (ds) === "object") {
            if (ds.id == null) {
                return f;
            }
        } else {
            ds = any.ds(ds, scope);
        }

        for (var i = 0, ii = o.datas.length; i < ii; i++) {
            if (o.datas[i].ds == ds && o.datas[i].id == id) {
                return f;
            }
        }

        o.datas.push({ds: ds, id: id, withoutBind: withoutBind});

        return f;
    };

    f.submit = function () {
        if (o.datas != null && o.datas.length > 0) {
            var jsons = [];
            for (var i = 0, ii = o.datas.length; i < ii; i++) {
                if (o.datas[i].withoutBind == true) {
                    jsons.push(o.datas[i].ds.jsonStringWithoutBind(o.datas[i].id));
                } else {
                    jsons.push(o.datas[i].ds.jsonString(o.datas[i].id));
                }
            }
            f.param('_DATA_SET_JSON_', '[' + jsons.join(",") + ']');
        }

        o.$form.submit();

        if (selector == null) {
            o.$form.remove();
        }
    };

    return f;
};

any.opener = function () {
    try {
        if (window.frameElement != null && window.frameElement["any-opener"] != null) {
            return window.frameElement["any-opener"];
        }
    } catch (e) {
    }

    try {
        if (window.opener != null && window.opener.any != null && window.opener.any.window != null && window.opener.any.window.openWindows != null) {
            var f = window.opener.any.window.openWindows[window.name].f;
            if (f != null && f.opener() != null) {
                return f.opener();
            }
        }
    } catch (e) {
    }

    try {
        if (window.opener != window && window.opener.any != null) {
            return window.opener;
        }
    } catch (e) {
    }

    return window;
};

any.history = function () {
    var f = {};
    var o = {};

    if (any.meta != null && any.meta.contextPath != null && any.home != null) {
        o.url = any.meta.contextPath + any.home + "/anyworks-history.htm";
    }

    (function initialize() {
        if (o.url == null || any.history.initialized == true) {
            return;
        }

        any.history.initialized = true;

        if (any.history.$iframe != null) {
            any.history.$iframe.remove();
        }

        any.history.functions = {};
        any.history.$iframe = jQuery('<iframe>').hide().attr("src", o.url).appendTo(document.body);
        any.history.index = 0;
    })();

    f.start = function (func) {
        if (o.url == null) {
            return f;
        }

        any.history.functions["#0"] = func;

        return f;
    };

    f.add = function (func) {
        if (o.url == null) {
            return f;
        }

        any.history.index++;
        any.history.functions["#" + any.history.index] = func;
        any.history.$iframe.attr("src", o.url + "?" + any.history.index + "#" + any.history.index);

        return f;
    };

    f.go = function (hash) {
        if (o.url == null || any.history.functions == null) {
            return f;
        }

        if (hash == null || hash == "") {
            hash = "#0";
        }

        var func = any.history.functions[hash];

        if (func != null) {
            (typeof (func) === "function" ? func : new Function(func)).apply();
        }

        return f;
    };

    return f;
};

/**
 * 로케이션
 *
 * @param win
 * @returns {{}}
 *
 * @constructs location
 *
 * @example
 * <SS>
 * any.location = function (win) {
 *     if (win == null) win = window;
 *
 *     var params = new Array();
 *
 *     this.path;
 *
 *     this.addParam = function (sName, sValue) {
 *         params.push(sName + "=" + encodeURIComponent(sValue));
 *
 *         if (win == null || win.parent == null) return;
 *
 *         if (win.parent.arg == null) {
 *             win.parent.arg = {};
 *         }
 *
 *         win.parent.arg[sName] = sValue;
 *     };
 *
 *     this.replace = function () {
 *         any.location.replace(getURI(this.path), win);
 *     };
 *
 *     this.href = function () {
 *         any.location.href(getURI(this.path), win);
 *     };
 *
 *     function getURI(path) {
 *         if (path != null && params.length > 0) {
 *             return path + (path.indexOf("?") == -1 ? "?" : "&") + params.join("&");
 *         }
 *
 *         return path;
 *     }
 * };
 *
 * any.location.replace = function (path, win) {
 *     if (win == null) win = window;
 *
 *     try {
 *         win.bfShowBodyMessage();
 *     } catch (ex) {
 *     }
 *
 *     if (path != null && path != "") {
 *         win.location.replace(any.getServletPath(path));
 *     }
 * };
 *
 * any.location.href = function (path, win) {
 *     if (win == null) win = window;
 *
 *     try {
 *         win.bfShowBodyMessage();
 *     } catch (ex) {
 *     }
 *
 *     if (path != null && path != "") {
 *         win.location.href = any.getServletPath(path);
 *     }
 * };
 *
 * any.location.reload = function (win) {
 *     if (win == null) win = window;
 *
 *     try {
 *         win.bfShowBodyMessage();
 *     } catch (ex) {
 *     }
 *
 *     if (win.parent.$reload == null) {
 *         window.location.reload();
 *     } else {
 *         win.parent.$reload();
 *     }
 * };
 *
 * any.location.unload = function (returnValue, replacePath) {
 *     if (parent != null && parent.unloadPage != null) {
 *         parent.unloadPage(returnValue);
 *         return true;
 *     }
 *
 *     if (replacePath != null) {
 *         any.location.replace(replacePath);
 *         return true;
 *     }
 *
 *     return false;
 * };
 */
location = function (win) {
    if (win == null) {
        win = window;
    }

    var f = {};
    var o = {$f: jQuery(f)};

    /**
     * 로케이션 유알엘
     *
     * @param url
     * @returns {string|*|{}}
     *
     * @memberOf location#
     */
    url = function (url) {
        if (arguments.length == 0) {
            return any.url(o.url, o.params);
        }

        o.url = url;

        return f;
    };

    f.param = function (name, value, multi) {
        if (arguments.length == 0) {
            return;
        }

        if (o.params == null) {
            o.params = [];
        }

        if (arguments.length == 1) {
            return any.param(o.params).get(name);
        }

        any.param(o.params).set(name, value, multi);

        return f;
    };

    f.params = function (params, multi) {
        for (var i = 0; i < params.length; i++) {
            f.param(params[i].name, params[i].value, multi);
        }

        return f;
    };

    f.arg = function () {
        if (o.args == null) {
            o.args = {};
        }

        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.args[arguments[0]];
        }

        any.copyArguments(o.args, arguments);

        return f;
    };

    f.window = function (w) {
        win = w;

        return f;
    };

    f.on = function (name, func) {
        o.$f.on(name, func);

        return f;
    };

    f.replace = function () {
        if (o.url == null) {
            return;
        }

        setFrameElement();

        win.location.replace(any.url.amp(any.url(o.url, o.params)));
    };

    f.href = function () {
        if (o.url == null) {
            return;
        }

        setFrameElement();

        win.location.href = any.url.amp(any.url(o.url, o.params));
    };

    f.reload = function (replace) {
        setFrameElement();

        if (replace === true) {
            win.location.replace(win.location.href);
        } else {
            win.location.reload();
        }
    };

    function setFrameElement() {
        try {
            if (win.frameElement == null) {
                return f;
            }
        } catch (e) {
            return f;
        }

        if (o.args != null) {
            win.frameElement["any-arguments"] = o.args;
        }

        if (o.frameElementEventAttached === true) {
            return;
        }

        o.frameElementEventAttached = true;

        jQuery(win.frameElement).on("onReload", function () {
            o.$f.fire("onReload");
        });
    }

    return f;
};

any.dialog = function (isRootWindow) {
    var f = {};
    var o = {};

    f.init = function () {
        o.title = null;
        o.options = {autoOpen: false, resizable: false, width: 350};
        o.functions = {};

        if (isRootWindow != null) {
            f.option("rootWindow", isRootWindow);
        }

        return f;
    };

    f.title = function (title) {
        o.title = title;

        return f;
    };

    f.option = function () {
        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.options[arguments[0]];
        }

        any.copyArguments(o.options, arguments);

        return f;
    };

    f.alert = function (message) {
        o.functionName = "ok";

        if (any.config.jQueryDialog == true) {
            o.options.modal = true;
            o.options.buttons = {};
            o.options.buttons[any.message("any.btn.ok", "OK")] = function () {
                f.$div.dialog("close");
            };
            showDialog(message);
        } else {
            alert(message);
        }

        return f;
    };

    f.confirm = function (message) {
        o.functionName = "cancel";

        if (any.config.jQueryDialog == true) {
            o.options.modal = true;
            o.options.buttons = {};
            o.options.buttons[any.message("any.btn.ok", "OK")] = function () {
                o.functionName = "ok";
                f.$div.dialog("close");
            };
            o.options.buttons[any.message("any.btn.cancel", "Cancel")] = function () {
                f.$div.dialog("close");
            };
            showDialog(message);
        } else {
            if (confirm(message) == true) {
                o.functionName = "ok";
            }
        }

        return f;
    };

    f.ask = function (message) {
        o.functionName = "no";

        o.options.modal = true;
        o.options.buttons = {};
        o.options.buttons[any.message("any.btn.yes", "Yes")] = function () {
            o.functionName = "yes";
            f.$div.dialog("close");
        };
        o.options.buttons[any.message("any.btn.no", "No")] = function () {
            f.$div.dialog("close");
        };
        showDialog(message);

        return f;
    };

    f.ask2 = function (message) {
        o.functionName = "cancel";

        o.options.modal = true;
        o.options.buttons = {};
        o.options.buttons[any.message("any.btn.yes", "Yes")] = function () {
            o.functionName = "yes";
            f.$div.dialog("close");
        };
        o.options.buttons[any.message("any.btn.no", "No")] = function () {
            o.functionName = "no";
            f.$div.dialog("close");
        };
        o.options.buttons[any.message("any.btn.cancel", "Cancel")] = function () {
            f.$div.dialog("close");
        };
        showDialog(message);

        return f;
    };

    f.ok = function (func) {
        o.functions.ok = func;

        if (any.config.jQueryDialog != true && o.functionName == "ok") {
            func();
        }

        return f;
    };

    f.cancel = function (func) {
        o.functions.cancel = func;

        if (any.config.jQueryDialog != true && o.functionName == "cancel") {
            func();
        }

        return f;
    };

    f.yes = function (func) {
        o.functions.yes = func;

        if (any.config.jQueryDialog != true && o.functionName == "yes") {
            func();
        }

        return f;
    };

    f.no = function (func) {
        o.functions.no = func;

        if (any.config.jQueryDialog != true && o.functionName == "no") {
            func();
        }

        return f;
    };

    f.init();

    return f;

    function showDialog(message) {
        if (o.options.rootWindow == true && any.rootWindow().any != any) {
            o.jQuery = any.rootWindow().jQuery;
            o.blocker = any.rootWindow().any.blocker(f.$div);
            jQuery(window).unload(function () {
                if (f.$div != null) {
                    f.$div.dialog("option", "hide", null).dialog("close");
                }
            });
        } else {
            o.jQuery = jQuery;
            o.blocker = any.blocker(f.$div);
        }

        f.$div = o.jQuery('<div>').css({"white-space": "pre-wrap", "word-break": "break-all"});

        f.$div.attr("title", any.text.nvl(o.title, any.topWindow().document.title)).text(String(message));

        o.options.close = function (event, ui) {
            o.blocker.unblock();

            if (f.$div != null) {
                f.$div.remove();
                f.$div = null;
            }

            if (o.functions[o.functionName] != null) {
                o.functions[o.functionName]();
            }
        };

        o.blocker.block();

        f.$div.dialog(o.options).dialog("open");

        jQuery(o.jQuery.window).resize(function () {
            setPosition();
        });

        setPosition();
    }

    function setPosition() {
        if (f.$div == null) {
            return;
        }

        var $dlg = f.$div.parent();

        $dlg.css("left", ($dlg.parent().innerWidth() - $dlg.outerWidth()) / 2);
        $dlg.css("top", ($dlg.parent().height() - $dlg.innerHeight()) / 2 + $dlg.parent().scrollTop());
    }
};

any.popup = function (selector) {
    var f = {};
    var o = {};

    f.init = function () {
        o.$div = (selector.jquery == jQuery.fn.jquery ? selector : jQuery(selector));

        f.title(any.text.blank(o.$div.attr("title"), any.topWindow().document.title));

        o.cancelText = any.message("any.btn.cancel", "Cancel").toString();

        o.options = {autoOpen: false, modal: true, resizable: false, hide: "clip"};

        if (o.$div.attr("resizable") == "" || o.$div.attr("resizable") == "resizable") {
            o.options.resizable = true;
        }

        if (o.$div.data("any-popup-opened") != true) {
            var width = Number(o.$div.attr("width"));
            var height = Number(o.$div.attr("height"));

            if (isNaN(width) != true) {
                o.options.width = Math.min(width, jQuery(document.body).width() - 20);
            }

            if (isNaN(height) != true) {
                o.options.height = Math.min(height, jQuery(document.body).height() - 20);
            }
        }

        o.$div.data("any-popup-opened", true);
    };

    f.title = function (title) {
        o.$div.attr("title", title);

        return f;
    };

    f.button = function (text, func) {
        if (o.options.buttons == null) {
            o.options.buttons = {};
        }

        o.options.buttons[text] = func;

        return f;
    };

    f.cancel = function (val) {
        if (typeof (val) === "string") {
            o.cancelText = val;
        } else if (val !== true) {
            o.cancelText = null;
        }

        return f;
    };

    f.option = function () {
        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.options[arguments[0]];
        }

        any.copyArguments(o.options, arguments);

        return f;
    };

    f.show = function () {
        if (o.cancelText != null) {
            f.button(o.cancelText, function () {
                o.$div.dialog("close");
            });
        }

        o.$div.dialog(o.options).dialog("open");

        return f;
    };

    f.close = function () {
        o.$div.dialog("close");

        return f;
    };

    f.init();

    return f;
};

/**
 * 윈도우
 *
 * @param isRootWindow
 * @returns {{}}
 *
 * @constructs window
 * @example
 * <구 버전>
 * any.window = function (iType, bReGet) {
 *     var windowId;
 *     var windowPath;
 *     var params = new Array();
 *
 *     if (iType == null) iType = 0;
 *
 *     if (bReGet == true) {
 *         return new any.window(iType);
 *     }
 *
 *     if (iType == 2 && any.topPageType == "popup" && top.window.dialogArguments != null && top.opener != null) {
 *         return top.opener.any.window(iType, true);
 *     }
 *
 *     this.path;
 *     this.onReload;
 *     this.arg = new Object();
 *     this.opt = new Object();
 *     this.rtn;
 *
 *     this.addParam = function (sName, sValue) {
 *         params.push({ name: sName, value: sValue });
 *     }
 *
 *     this.setWindowId = function (winId) {
 *         if (winId != null) {
 *             windowId = winId;
 *             return;
 *         }
 *
 *         if (this.path == null || this.path == "") return;
 *
 *         var sPath = (this.path.indexOf("?") == -1 ? this.path : this.path.substr(0, this.path.indexOf("?")));
 *         var aTemp = new Array();
 *         var charCode;
 *
 *         aTemp.push(window.location.host);
 *         aTemp.push(any.sessionId);
 *         aTemp.push((window["_POPUP_FRAME_"] == true ? document.frames[0] : window).document.location.pathname);
 *         aTemp.push(sPath.substr(sPath.indexOf("//") + 1));
 *
 *         windowId = aTemp.join("_");
 *
 *         for (var i = windowId.length - 1; i >= 0; i--) {
 *             charCode = windowId.charCodeAt(i);
 *             if (charCode >= 48 && charCode <= 57) continue;
 *             if (charCode >= 65 && charCode <= 90) continue;
 *             if (charCode >= 97 && charCode <= 122) continue;
 *             if (charCode == 95) continue;
 *             windowId = windowId.replace(windowId.charAt(i), "");
 *         }
 *     }
 *
 *     this.show = function (useFrame) {
 *         if (this.path == null || this.path == "") return;
 *
 *         if (this.path.indexOf("/") == -1) {
 *             this.path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") + 1) + this.path;
 *         }
 *
 *         var oArg = new Object();
 *
 *         oArg.opener = self;
 *         oArg.messageData = any.messageData;
 *         oArg.onReload = this.onReload;
 *         oArg.arg = this.arg;
 *
 *         if (useFrame == null || useFrame == true) {
 *             windowPath = top.getRoot() + "/anyfive/framework/util/popup.jsp";
 *             oArg.windowInfo = { type: iType, path: any.getServletPath(this.path), params: params };
 *         } else {
 *             windowPath = this.path;
 *             for (var i = 0; i < params.length; i++) {
 *                 windowPath += (i == 0 ? "?" : "&") + params[i].name + "=" + params[i].value;
 *             }
 *         }
 *
 *         if (windowId == null) this.setWindowId();
 *
 *         if (this.opt.width == null) this.opt.width = 850;
 *         if (this.opt.height == null) this.opt.height = 600;
 *
 *         this.opt.width = parseInt(this.opt.width, 10);
 *         this.opt.height = parseInt(this.opt.height, 10);
 *
 *         try {
 *             switch (iType) {
 *                 case 0: //showModalDialog
 *                     this.rtn = showDialog(this, oArg);
 *                     return this.rtn;
 *                     break;
 *                 case 1: //showModelessDialog
 *                     showDialog(this, oArg);
 *                     break;
 *                 case 2: //open window
 *                     openWindow(this, oArg);
 *                     break;
 *             }
 *         } catch (ex) {
 *             alert("팝업창을 열 수 없습니다.\n\n현재 사이트의 팝업을 항상 허용으로 설정해 주시기 바랍니다.");
 *         }
 *     }
 *
 *     this.close = function (path) {
 *         try {
 *             for (var item in window["_CHILD_WINDOWS_"]) {
 *                 if (window["_WINDOW_ARGUMENTS_"][item].windowInfo.path == path) {
 *                     closeWindow(item);
 *                     break;
 *                 }
 *             }
 *         } catch (ex) {
 *         }
 *     }
 *
 *     function showDialog(pop, oArg) {
 *         var oOpt = new Object();
 *
 *         var winWidth = pop.opt.width;
 *         var winHeight = pop.opt.height;
 *
 *         if (navigator.appVersion.indexOf("MSIE 6") != -1) {
 *             winWidth += 6;
 *             winHeight += 52;
 *         }
 *
 *         if (pop.opt.edge != "raised") {
 *             winWidth += 4;
 *             winHeight += 4;
 *         }
 *
 *         oOpt.dialogWidth = String(winWidth) + "px";
 *         oOpt.dialogHeight = String(winHeight) + "px";
 *         oOpt.dialogLeft = String(pop.opt.left == null ? "" : pop.opt.left) + "px";
 *         oOpt.dialogTop = String(pop.opt.top == null ? "" : pop.opt.top) + "px";
 *         if (pop.opt.left != null || pop.opt.top != null) {
 *             oOpt.center = "no";
 *         } else {
 *             oOpt.center = (pop.opt.center == null ? "yes" : pop.opt.center);
 *         }
 *         oOpt.dialogHide = (pop.opt.dialogHide == null ? "no" : pop.opt.dialogHide);
 *         oOpt.edge = (pop.opt.edge == null ? "sunken" : pop.opt.edge);
 *         oOpt.help = (pop.opt.help == null ? "no" : pop.opt.help);
 *         oOpt.resizable = (pop.opt.resizable == null ? "no" : pop.opt.resizable);
 *         oOpt.scroll = "no";
 *         oOpt.status = (pop.opt.status == null ? "no" : pop.opt.status);
 *         oOpt.unadorned = (pop.opt.unadorned == null ? "yes" : pop.opt.unadorned);
 *
 *         if (iType == 0) {
 *             return window.showModalDialog(windowPath, oArg, getOptionString(oOpt, ":", ";"));
 *         } else {
 *             if (window["_CHILD_DIALOGS_"] == null) {
 *                 window["_CHILD_DIALOGS_"] = new Object();
 *             }
 *
 *             try {
 *                 window["_CHILD_DIALOGS_"][windowId].$go(oArg);
 *             } catch (ex) {
 *                 window["_CHILD_DIALOGS_"][windowId] = window.showModelessDialog(windowPath, oArg, getOptionString(oOpt, ":", ";"));
 *             }
 *         }
 *     }
 *
 *     function openWindow(pop, oArg) {
 *         var oOpt = new Object();
 *
 *         if (pop.opt.left == null) pop.opt.left = Math.max(window.screen.availWidth - pop.opt.width - 10, 0) / 2;
 *         if (pop.opt.top == null) pop.opt.top = Math.max(window.screen.availHeight - pop.opt.height - 58, 0) / 2;
 *
 *         oOpt.width = String(pop.opt.width) + "px";
 *         oOpt.height = String(pop.opt.height) + "px";
 *         oOpt.left = String(pop.opt.left) + "px";
 *         oOpt.top = String(pop.opt.top) + "px";
 *         oOpt.channelmode = (pop.opt.channelmode == null ? "no" : pop.opt.channelmode);
 *         oOpt.directories = (pop.opt.directories == null ? "no" : pop.opt.directories);
 *         oOpt.fullscreen = (pop.opt.fullscreen == null ? "no" : pop.opt.fullscreen);
 *         oOpt.location = (pop.opt.location == null ? "no" : pop.opt.location);
 *         oOpt.menubar = (pop.opt.menubar == null ? "no" : pop.opt.menubar);
 *         oOpt.resizable = (pop.opt.resizable == null ? "no" : pop.opt.resizable);
 *         oOpt.scrollbars = "no";
 *         oOpt.status = (pop.opt.status == null ? "yes" : pop.opt.status);
 *         oOpt.titlebar = (pop.opt.titlebar == null ? "no" : pop.opt.titlebar);
 *         oOpt.toolbar = (pop.opt.toolbar == null ? "no" : pop.opt.toolbar);
 *
 *         if (window["_WINDOW_ARGUMENTS_"] == null) {
 *             window["_WINDOW_ARGUMENTS_"] = new Object();
 *         }
 *
 *         window["_WINDOW_ARGUMENTS_"][windowId] = oArg;
 *
 *         if (window["_CHILD_WINDOWS_"] == null) {
 *             window["_CHILD_WINDOWS_"] = new Object();
 *         }
 *
 *         window["_CHILD_WINDOWS_"][windowId] = window.open(windowPath, windowId, getOptionString(oOpt, "=", ","), true);
 *
 *         if (window["_CLOSE_ALL_CHILD_WINDOWS_ATTACHED_"] != true) {
 *             window.attachEvent("onunload", closeAllChildWindows);
 *             window["_CLOSE_ALL_CHILD_WINDOWS_ATTACHED_"] = true;
 *         }
 *     }
 *
 *     function getOptionString(obj, delimiter, separator) {
 *         var arr = new Array();
 *         for (var item in obj) {
 *             arr.push(item + delimiter + obj[item]);
 *         }
 *         return arr.join(separator);
 *     }
 *
 *     function closeAllChildWindows() {
 *         try {
 *             for (var item in window["_CHILD_WINDOWS_"]) {
 *                 closeWindow(item);
 *             }
 *         } catch (ex) {
 *         }
 *     }
 *
 *     function closeWindow(item) {
 *         try {
 *             window["_CHILD_WINDOWS_"][item].close();
 *             window["_CHILD_WINDOWS_"][item] = null;
 *         } catch (ex) {
 *         }
 *     }
 * }
 */
window = function (isRootWindow) {
    var f = {};
    var o = {$f: jQuery(f)};

    f.init = function () {
        o.title = null;
        o.url = null;
        o.params = null;
        o.args = null;
        o.options = {autoOpen: false, modal: true, resizable: false, hide: "clip"};
        o.functions = {};

        if (jQuery.browser.msie && Number(jQuery.browser.version) < 11) {
            o.options.hide = false;
        }

        if (isRootWindow != null) {
            f.option("rootWindow", isRootWindow);
        }

        return f;
    };

    /**
     * 오프너
     * 
     * @param win
     * @returns {{}|Window|*}
     *
     * @memberOf window#
     */
    opener = function (win) {
        if (arguments.length == 0) {
            return o.opener == null ? window : o.opener;
        }

        o.opener = win;

        return f;
    };

    f.title = function (title) {
        o.title = title;

        return f;
    };

    f.url = function (url) {
        if (arguments.length == 0) {
            return any.url(o.url, o.params);
        }

        o.url = url;

        return f;
    };

    f.param = function (name, value, multi) {
        if (arguments.length == 0) {
            return;
        }

        if (o.params == null) {
            o.params = [];
        }

        if (arguments.length == 1) {
            return any.param(o.params).get(name);
        }

        any.param(o.params).set(name, value, multi);

        return f;
    };

    f.params = function (params, multi) {
        for (var i = 0; i < params.length; i++) {
            f.param(params[i].name, params[i].value, multi);
        }

        return f;
    };

    f.arg = function () {
        if (o.args == null) {
            o.args = {};
        }

        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.args[arguments[0]];
        }

        any.copyArguments(o.args, arguments);

        return f;
    };

    f.option = function () {
        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.options[arguments[0]];
        }

        any.copyArguments(o.options, arguments);

        return f;
    };

    f.ok = function (func) {
        o.functions.ok = func;

        return f;
    };

    f.on = function (name, func) {
        o.$f.on(name, func);

        return f;
    };

    f.type = function (type) {
        if (arguments.length == 0) {
            return o.type;
        }

        o.type = type;

        return f;
    };

    f.show = function (name) {
        if (o.type == "open") {
            return f.open.apply(f, arguments);
        }

        if (o.url == null) {
            return;
        }

        if (o.options.rootWindow == true && any.rootWindow().any != any) {
            o.jQuery = any.rootWindow().jQuery;
            o.blocker = any.rootWindow().any.blocker(f.$div);
            jQuery(window).unload(function () {
                if (f.$div != null) {
                    f.$div.dialog("option", "hide", null).dialog("close");
                }
            });
        } else {
            o.jQuery = jQuery;
            o.blocker = any.blocker(f.$div);
        }

        if (name != null && o.jQuery('div#any_dialog_' + name).length > 0) {
            return;
        }

        f.$div = o.jQuery('<div>');

        if (name != null) {
            f.$div.attr("id", "any_dialog_" + name);
        }

        f.$div.attr("title", any.text.nvl(o.title, "Loading..."));

        o.options.beforeClose = function (event, ui) {
            if (f.$div == null) {
                return;
            }

            if (!jQuery.browser.msie || Number(jQuery.browser.version) >= 9) {
                f.$div.children('iframe').attr("src", "").remove();
            }
        };

        o.options.close = function (event, ui) {
            if (o.blockerUnblocked !== true) {
                o.blocker.unblock();
            }

            var reloadList;

            if (f.$div != null) {
                reloadList = f.$div.data("reloadList");

                if (reloadList == true) {
                    f.$div.fire("onReload");
                }

                f.$div.fire("onUnload", [o.returnValue]);

                f.$div.children('iframe').attr("src", "").remove();
                f.$div.remove();
                f.$div = null;
            }

            if (reloadList == true) {
                o.$f.fire("onReload");
            }

            o.$f.fire("onUnload", [o.returnValue]);
        };

        o.blocker.block();
        o.blockerUnblocked = false;

        f.$div.dialog(o.options).dialog("open");

        var $dlg = f.$div.parent();

        $dlg.css("left", ($dlg.parent().innerWidth() - $dlg.outerWidth()) / 2);
        $dlg.css("top", ($dlg.parent().height() - $dlg.innerHeight()) / 2 + $dlg.parent().scrollTop());

        var $iframe = o.jQuery('<iframe>').attr({frameborder: "0", scrolling: "no", "any-pageType": "dialog"})
            .prop({
                "any-opener": o.opener == null ? window : o.opener,
                "any-arguments": o.args == null ? {} : o.args
            })
            .css({position: "absolute", left: "0", top: "0", width: "100%", height: "100%"})
            .appendTo(f.$div);

        $iframe[0]["any-unloadPage"] = function (returnValue) {
            o.returnValue = returnValue;

            if (o.functions.ok != null && returnValue != null) {
                if (o.functions.ok(returnValue) === false) {
                    return;
                }
            }

            o.blocker.unblock();

            o.blockerUnblocked = true;

            f.$div.dialog("close");
        };

        $iframe.attr("src", any.url(o.url, o.params));

        return f;
    };

    f.open = function (name) {
        if (o.type == "show") {
            return f.show.apply(f, arguments);
        }

        if (o.url == null) {
            return;
        }

        var specs = {width: "400px", height: "300px"};

        for (var item in o.options) {
            if (o.options[item] === true) {
                o.options[item] = "yes";
            } else if (o.options[item] === false) {
                o.options[item] = "no";
            }
        }

        if (o.options.width != null) {
            specs.width = o.options.width + "px";
        }
        if (o.options.height != null) {
            specs.height = o.options.height + "px";
        }
        if (o.options.left != null) {
            specs.left = o.options.left + "px";
        }
        if (o.options.top != null) {
            specs.top = o.options.top + "px";
        }
        if (o.options.fullscreen != null) {
            specs.fullscreen = o.options.fullscreen;
        }

        specs.channelmode = any.text.nvl(o.options.channelmode, "no");
        specs.directories = any.text.nvl(o.options.directories, "no");
        specs.location = any.text.nvl(o.options.location, "no");
        specs.menubar = any.text.nvl(o.options.menubar, "no");
        specs.resizable = any.text.nvl(o.options.resizable, "no");
        specs.scrollbars = any.text.nvl(o.options.scrollbars, "no");
        specs.status = any.text.nvl(o.options.status, "yes");
        specs.titlebar = any.text.nvl(o.options.titlebar, "no");
        specs.toolbar = any.text.nvl(o.options.toolbar, "no");

        if (name == null) {
            if (any.window.openCount == null) {
                any.window.openCount = 1;
            }
            name = "any_window_" + any.date().timestamp() + "_" + (any.window.openCount++);
        }

        if (any.window.openWindows == null) {
            any.window.openWindows = {};
        }

        any.window.openWindows[name] = {};
        any.window.openWindows[name].arguments = (o.args == null ? {} : o.args);
        any.window.openWindows[name].functions = o.functions;
        any.window.openWindows[name].f = f;
        any.window.openWindows[name].$f = o.$f;

        if (arguments.length == 0 || arguments[0] != name) {
            any.window.openWindows[name]["any-window-resize-enable"] = true;
            o.window = window.open(any.meta.contextPath + any.home + "/anyworks-window.htm", name, any.object.join(specs, "=", ","), true);
            return f;
        }

        if (any.window.openedWindows == null) {
            any.window.openedWindows = {};
        }

        o.window = any.window.openedWindows[name];

        if (o.window != null) {
            try {
                o.window.document.location.href;
            } catch (e) {
                delete (o.window);
            }
        }

        any.window.openWindows[name]["any-window-resize-enable"] = (o.window == null);

        if (o.window == null) {
            o.window = window.open("", name, any.object.join(specs, "=", ","), true);
            any.window.openedWindows[name] = o.window;
        }

        o.window.document.location.replace(any.meta.contextPath + any.home + "/anyworks-window.htm");

        return f;
    };

    f.window = function (name) {
        if (name == null) {
            return o.window;
        }

        if (any.window.openedWindows == null) {
            return null;
        }

        var win = any.window.openedWindows[name];

        try {
            win.document.location.href;
            return win;
        } catch (e) {
            return null;
        }
    };

    f.focus = function (name) {
        var win = f.window(name);

        if (win != null) {
            try {
                win.focus();
            } catch (e) {
            }
        }

        return f;
    };

    f.close = function (name) {
        var win = f.window(name);

        if (win != null) {
            try {
                win.close();
            } catch (e) {
            }
        }

        return f;
    };

    f.resize = function (width, height) {
        if (any.pageType() != "window" && any.pageType() != "dialog") {
            return f;
        }

        var resizeWindow = true;

        if (any.pageType() == "window") {
            try {
                resizeWindow = window.opener.any.window.openWindows[window.name]["any-window-resize-enable"];
                window.opener.any.window.openWindows[window.name]["any-window-resize-enable"] = false;
            } catch (e) {
            }
        }

        if (resizeWindow != true) {
            return f;
        }

        var $dlg = jQuery(window.frameElement).parent().parent();

        if (width == null) {
            width = Number(jQuery(document.body).attr("width"));
        }

        if (height == null) {
            height = Number(jQuery(document.body).attr("height"));
        }

        if (any.pageType() == "window" && isNaN(width) != true && isNaN(height) != true) {
            window.resizeTo(width, height);
            return f;
        }

        if (isNaN(width) != true) {
            width = Math.min(width, jQuery(parent.document.body).width() - 20);

            $dlg.width(width);
            $dlg.css("left", ($dlg.parent().innerWidth() - $dlg.outerWidth()) / 2);
        }

        if (isNaN(height) != true) {
            height = Math.min(height, jQuery(parent.document.body).height() - 20);

            $dlg.height(height);
            $dlg.css("top", ($dlg.parent().height() - $dlg.innerHeight()) / 2 + $dlg.parent().scrollTop());
            $dlg.children('div.ui-dialog-content').outerHeight(height - $dlg.children('div.ui-dialog-titlebar').outerHeight());
        }

        return f;
    };

    f.init();

    return f;
};

/**
 * 애니 뷰어
 *
 * @returns {{}}
 *
 * @constructs viewer
 * @example
 * <구 버전>
 * any.viewer = function () {
 *     var divId = "__VIEWER_FRAME_DIV__";
 *     var ifrId = "__VIEWER_FRAME_IFR__";
 *     var params = new Array();
 *
 *     this.path;
 *     this.onReload;
 *     this.arg = new Object();
 *
 *     this.initialize = function (viewer) {
 *         var div = document.getElementById(divId);
 *
 *         if (div == null) {
 *             div = document.createElement('<DIV id="' + divId + '" style="position:absolute; left:0px; top:0px; width:100%; height:100%; display:none;">');
 *             document.body.appendChild(div);
 *         }
 *
 *         div.viewer = viewer;
 *
 *         div.innerHTML = '<IFRAME id="' + ifrId + '" name="' + ifrId + '" src="' + top.getRoot() + '/anyfive/framework/body/ViewHistory.htm" frameBorder="no" scrolling="no" width="100%" height="100%"></IFRAME>';
 *     }
 *
 *     this.addParam = function (sName, sValue) {
 *         params.push({ name: sName, value: sValue });
 *     }
 *
 *     this.show = function () {
 *         if (this.path == null || this.path == "") return;
 *
 *         this.initialize(this);
 *     }
 *
 *     this.view = function () {
 *         if (this.path.indexOf("/") == -1) {
 *             this.path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf("/") + 1) + this.path;
 *         }
 *
 *         var oArg = new Object();
 *
 *         oArg.opener = self;
 *         oArg.messageData = any.messageData;
 *         oArg.onReload = this.onReload;
 *         oArg.arg = this.arg;
 *         oArg.windowInfo = { type: -1, path: any.getServletPath(this.path), params: params };
 *
 *         var div = document.getElementById(divId);
 *         var ifr = document.getElementById(ifrId);
 *
 *         div.style.display = "block";
 *         div.arg = oArg;
 *
 *         ifr.contentWindow.location.href = top.getRoot() + "/anyfive/framework/util/popup.jsp";
 *     }
 * }
 */
viewer = function () {
    var f = {};
    var o = {$f: jQuery(f)};

    f.init = function () {
        o.url = null;
        o.params = null;
        o.args = null;

        return f;
    };

    /**
     * 유알엘
     *
     * @param url
     * @returns {*|{}}
     *
     * @memberOf viewer#
     */
    url = function (url) {
        if (arguments.length == 0) {
            return any.url(o.url, o.params);
        }

        o.url = url;

        return f;
    };

    f.param = function (name, value, multi) {
        if (arguments.length == 0) {
            return;
        }

        if (o.params == null) {
            o.params = [];
        }

        if (arguments.length == 1) {
            return any.param(o.params).get(name);
        }

        any.param(o.params).set(name, value, multi);

        return f;
    };

    f.params = function (params, multi) {
        for (var i = 0; i < params.length; i++) {
            f.param(params[i].name, params[i].value, multi);
        }

        return f;
    };

    f.arg = function () {
        if (o.args == null) {
            o.args = {};
        }

        if (arguments.length == 1 && typeof (arguments[0]) === "string") {
            return o.args[arguments[0]];
        }

        any.copyArguments(o.args, arguments);

        return f;
    };

    f.on = function (name, func) {
        o.$f.on(name, func);

        return f;
    };

    f.show = function () {
        if (o.url == null) {
            return;
        }

        if (any.viewer.$div != null) {
            return;
        }

        any.viewer.$div = jQuery('<div>').addClass("any-viewer").css({width: "100%", height: "100%", "z-index": 1});

        var $frame;
        var autoHeight;

        try {
            $frame = jQuery(window.frameElement).prop("any-viewer-$div", any.viewer.$div);
            autoHeight = $frame.hasAttr("autoHeight");
        } catch (e) {
            $frame = null;
            autoHeight = false;
        }

        if (autoHeight == true) {
            any.viewer.$div.appendTo($frame.parent());
            $frame.hide();
        } else {
            any.viewer.$div.css({position: "absolute", left: "0", top: "0"});
            any.viewer.$div.appendTo(document.body);
        }

        var $iframe = jQuery('<iframe>').attr({
            frameborder: "0",
            scrolling: "no",
            "any-pageType": "viewer",
            src: jQuery.browser.webkit ? "about:dummy" : null
        })
            .prop({
                "any-opener": window,
                "any-arguments": o.args == null ? {} : o.args,
                "any-url": any.url.amp(any.url(o.url, o.params))
            })
            .css({width: "100%", height: "100%", "background-color": "#ffffff"})
            .appendTo(any.viewer.$div);

        if (autoHeight == true) {
            $iframe.attr("autoHeight", "");
        }

        $iframe[0]["any-unloadPage"] = function (returnValue) {
            if (any.viewer.$div == null) {
                return;
            }

            jQuery('<iframe>').hide().appendTo(document.body).remove();

            any.viewer.$div.children('iframe').each(function () {
                this.contentWindow.location.replace("about:blank");
            });

            any.viewer.$div.empty().hide();

            if (any.viewer.$div.data("reloadList") == true) {
                o.$f.fire("onReload");
            }

            o.$f.fire("onUnload", [returnValue]);

            any.viewer.$div.remove();

            any.viewer.$div = null;

            if (autoHeight == true) {
                $frame.show();
            }
        };

        $iframe.attr("src", any.meta.contextPath + any.home + "/anyworks-viewer.htm");

        return f;
    };

    f.init();

    return f;
};

/**
 * 메시지
 *
 * @param messageCode
 * @param defaultText
 * @returns {{}}
 *
 * @constructs message
 * @example
 * <구 버전>
 * any.message =
 * {
 *     init: function () {
 *         if (any.messageData != null) return;
 *
 *         var xhr;
 *
 *         try {
 *
 *             xhr = new any.xmlHttp();
 *             xhr.path = "/anyfive.framework.message.act.RetrieveMessage.do";
 *             xhr.send(false);
 *
 *             if (xhr.error() == true) {
 *                 xhr.error.show();
 *                 return;
 *             }
 *
 *             any.messageData = eval("(" + xhr.req.responseText + ")");
 *
 *         } catch (ex) {
 *             alert("Error in any.message.init\n\n" + ex.description);
 *             xhr.req = null;
 *             xhr = null;
 *         } finally {
 *             xhr.req = null;
 *             xhr = null;
 *         }
 *     },
 *
 *     exist: function (msgId) {
 *         if (any.messageData == null) any.message.init();
 *
 *         return (any.messageData[msgId] != null);
 *     },
 *
 *     get: function (msgId) {
 *         if (any.messageData == null) any.message.init();
 *
 *         if (any.messageData == null) return null;
 *
 *         var msg = any.messageData[msgId];
 *
 *         if (msg == null) return msgId;
 *
 *         for (var i = 1; i < arguments.length; i++) {
 *             msg = msg.replaceAll("{#" + i + "}", arguments[i]);
 *         }
 *
 *         return msg;
 *     }
 * }
 */
message = function (messageCode, defaultText) {
    if (any.message.data == null) {
        any.message.data = {};
    }

    if (any.message.invalidText == null) {
        any.message.invalidText = {prefix: "", suffix: ""};
    }

    var f = {};
    var o = {};

    /**
     * 이니셜라이즈
     *
     * @returns {*}
     * @memberOf message#
     */
    initialize = function () {
        var prx = any.proxy().output(false);
        prx.url(any.config.messageLoader);
        prx.param("MESSAGE_CODE", messageCode);
        prx.option({loadingbar: messageCode == null, async: false});
        prx.execute();

        if (prx.result == null || prx.result == "") {
            return;
        }

        var result = eval("(" + prx.result + ")");

        for (var item in result) {
            if (item != result[item]) {
                any.message.data[item] = result[item];
            }
        }

        if (messageCode != null) {
            return any.message.data[messageCode];
        }
    };

    if (messageCode != null) {
        o.msg = any.message.data[messageCode];
        if (o.msg == null) {
            o.msg = f.initialize();
        }
        if (o.msg == null && defaultText != null) {
            o.msg = any.message.invalidText.prefix + defaultText + any.message.invalidText.suffix;
        }
        if (o.msg == null) {
            o.msg = any.message.invalidText.prefix + messageCode + any.message.invalidText.suffix;
        }
    }

    f.exists = function () {
        return any.message.data[messageCode] != null;
    };

    f.arg = function () {
        if (o.msg == null) {
            return f;
        }

        if (o.argIndex == null) {
            if (o.msg.indexOf("{0}") != -1 || o.msg.indexOf("{#0}") != -1) {
                o.argIndex = 0;
            } else {
                o.argIndex = 1;
            }
        }

        for (var i = 0, ii = arguments.length; i < ii; i++) {
            var argIndex = o.argIndex++;
            o.msg = any.text.replaceAll(o.msg, "\\{" + argIndex + "\\}", arguments[i]);
            o.msg = any.text.replaceAll(o.msg, "\\{#" + argIndex + "\\}", arguments[i]);
        }

        return f;
    };

    f.toString = function () {
        return o.msg;
    };

    /**
     * 투 에이치티엠엘
     *
     * @returns {*}
     * @memberOf message#
     *
     * @example
     * any.text.toHTML = function (txt, isPre) {
     *     if (txt == null) {
     *         return txt;
     *     }
     *
     *     txt = String(txt);
     *
     *     var result = [];
     *
     *     for (var i = 0, ii = txt.length; i < ii; i++) {
     *         var c = txt.charAt(i);
     *         switch (c) {
     *             case "<":
     *                 result.push("&lt;");
     *                 break;
     *             case ">":
     *                 result.push("&gt;");
     *                 break;
     *             case '"':
     *                 result.push("&quot;");
     *                 break;
     *             case "&":
     *                 result.push("&amp;");
     *                 break;
     *             case '+':
     *                 result.push("&#43;");
     *                 break;
     *             default:
     *                 if (isPre == true) {
     *                     result.push(c);
     *                     break;
     *                 }
     *                 switch (c) {
     *                     case " ":
     *                         result.push("&nbsp;");
     *                         break;
     *                     case "\r":
     *                         if (i + 1 < ii && txt.charAt(i + 1) == '\n') {
     *                             result.push("<br>\r\n");
     *                         } else {
     *                             result.push("<br>\r");
     *                         }
     *                         break;
     *                     case "\n":
     *                         if ((i > 0 && txt.charAt(i - 1) == '\r') != true) {
     *                             result.push("<br>\n");
     *                         }
     *                         break;
     *                     default:
     *                         result.push(c);
     *                         break;
     *                 }
     *         }
     *     }
     *
     *     return result.join("");
     * };
     */
    toHTML = function () {
        return any.text.toHTML(o.msg);
    };

    f.toJSON = function () {
        return any.text.toJSON(o.msg);
    };

    f.toJS = function () {
        return any.text.toJS(o.msg);
    };

    return f;
};


/**
 * 코드 데이터
 *
 * @param control
 * @returns {{}}
 *
 * @constructs codedata
 *
 */
codedata = function (control) {
    var f = {};
    var o = {};

    if (any.codedata.container == null) {
        any.codedata.container = {};
    }

    /**
     *
     * 코드데이터 겟 퍼스트 네임
     *
     * @param firstName
     * @returns {string|*}
     *
     * @memberOf codedata#
     *
     * @example
     * <구 버전>
     * any.getFirstNode = function (firstName) {
     *     if (firstName == null) return;
     *
     *     var msgId = "msg.codedata.firstname." + firstName.toLowerCase();
     *
     *     return { CODE: "", NAME: (any.message.exist(msgId) == true ? any.message.get(msgId) : firstName) };
     * }
     */
    codedata_getFirstName = function (firstName) {
        if (any.message("any.codeData.firstName." + firstName).exists() == true) {
            return any.message("any.codeData.firstName." + firstName, firstName).toString();
        }

        return firstName;
    };

    f.initialize = function (callback) {
        var attrName = any.text.nvl(control, "defaultCodeData");
        var $controls = jQuery('[' + attrName + ']');

        if ($controls.length == 0) {
            if (callback != null) {
                callback.apply();
            }
            return;
        }

        var codeDataPaths = {};

        $controls.each(function () {
            var path = jQuery(this).attr(attrName);
            if (path == null || any.text.trim(path) == "") {
                this.setCodeDataObject();
                return true;
            }
            var codeData = any.codedata.container[path];
            if (codeData == null) {
                if (codeDataPaths[path] == null) {
                    codeDataPaths[path] = [];
                }
                codeDataPaths[path].push(this);
            } else {
                resetCodeData(this, codeData, attrName);
            }
        });

        var pathList = [];

        for (var path in codeDataPaths) {
            pathList.push({path: path, controls: codeDataPaths[path]});
        }

        if (pathList.length == 0) {
            if (callback != null) {
                callback.apply();
            }
            return;
        }

        var prx = any.proxy().output(false);
        prx.url(any.config.codedataLoader);

        for (var i = 0, ii = pathList.length; i < ii; i++) {
            prx.param("ID", i, true);
            prx.param("PATH", pathList[i].path, true);
        }

        prx.on("onSuccess", function () {
            var result = eval("([" + this.result + "])");
            var codeDatas;

            if (result != null && result.length > 0 && (result[0]["_DATA_SET_JSON_"] != null || result[0].model != null)) {
                codeDatas = result[0]["_DATA_SET_JSON_"];
                if (codeDatas == null) {
                    codeDatas = [];
                }
                if (result[0].model != null) {
                    for (var id in result[0].model) {
                        codeDatas.push({"id": id, "error": result[0].model[id].error});
                    }
                }
            } else {
                codeDatas = result;
            }

            for (var i = 0, ii = codeDatas.length; i < ii; i++) {
                var pathInfo = pathList[parseInt(codeDatas[i].id, 10)];
                any.codedata.container[pathInfo.path] = codeDatas[i];
                for (var j = 0, jj = pathInfo.controls.length; j < jj; j++) {
                    resetCodeData(pathInfo.controls[j], codeDatas[i], attrName);
                }
            }

            if (callback != null) {
                callback.apply();
            }
        });

        prx.on("onError", function () {
            this.error.show();

            for (var i = 0; i < pathList.length; i++) {
                for (var j = 0, jj = pathList[i].controls.length; j < jj; j++) {
                    resetCodeData(pathList[i].controls[j], {});
                }
            }
        });

        prx.execute();
    };


    /**
     * 겟 코드데이터
     * 
     * @param path
     * @param callback
     * @returns {*}
     *
     * @memberOf codedata#
     *
     * @example
     * <구 버전>
     * any.getCodeData = function (codeDataPath) {
     *     var xhr;
     *
     *     try {
     *
     *         var isSingle = (typeof (codeDataPath) == "string");
     *         var codeDataPathArray;
     *
     *         if (isSingle == true) {
     *             codeDataPathArray = [{ id: 0, path: codeDataPath }];
     *         } else {
     *             codeDataPathArray = codeDataPath;
     *         }
     *
     *         xhr = new any.xmlHttp();
     *         xhr.path = "/anyfive.framework.codedata.act.RetrieveCodeData.do";
     *         for (var i = 0; i < codeDataPathArray.length; i++) {
     *             xhr.addParam("ID", codeDataPathArray[i].id);
     *             xhr.addParam("PATH", codeDataPathArray[i].path);
     *         }
     *         xhr.send(false);
     *
     *         if (xhr.error() == true) {
     *             xhr.error.show();
     *             return;
     *         }
     *
     *         var codeDatas = eval("([" + xhr.req.responseText + "])");
     *         var errorMessage;
     *
     *         if (isSingle == true) {
     *             if (codeDatas[0].error == null) return codeDatas[0].data;
     *             if (codeDatas[0].error == "") {
     *                 errorMessage = "[CodeData Error] " + codeDataPath;
     *                 alert(errorMessage);
     *             } else {
     *                 errorMessage = "[CodeData Error] " + codeDataPath + "\n\n" + codeDatas[0].error;
     *                 if (!confirm(errorMessage + "\n\n위 메세지를 복사하시겠습니까?")) return null;
     *                 window.clipboardData.setData("Text", errorMessage);
     *             }
     *             return null;
     *         }
     *
     *         return codeDatas;
     *
     *     } catch (ex) {
     *         alert("Error in any.getCodeData\n\n" + ex.description);
     *         xhr.req = null;
     *         xhr = null;
     *     } finally {
     *         xhr.req = null;
     *         xhr = null;
     *     }
     * }
     */
    get = function (path, callback) {
        var codeData;

        if (path == null || any.text.trim(path) == "") {
            codeData = any.ds("_DS_DEFAULT_CODEDATA_").json();
        } else {
            codeData = any.codedata.container[path];
        }

        if (codeData != null) {
            if (control != null && "setCodeDataObject" in control) {
                control.setCodeDataObject(codeData.data);
            }
            if (callback != null) {
                callback.apply(callback, [codeData]);
            }
            return codeData;
        }

        var prx = any.proxy().output(false);
        prx.url(any.config.codedataLoader);
        prx.param("ID", "0");
        prx.param("PATH", path);

        prx.on("onSuccess", function () {
            var result = eval("(" + this.result + ")");

            if (result != null && (result["_DATA_SET_JSON_"] != null || result.model != null)) {
                if (result["_DATA_SET_JSON_"] != null && result["_DATA_SET_JSON_"].length > 0) {
                    codeData = result["_DATA_SET_JSON_"][0];
                }
                if (result.model != null) {
                    for (var id in result.model) {
                        codeData = {"id": id, "error": result.model[id].error};
                    }
                }
                if (codeData == null) {
                    codeData = {};
                }
            } else {
                codeData = result;
            }

            any.codedata.container[path] = codeData;
            resetCodeData(control, codeData);

            if (callback != null) {
                callback.apply(callback, [codeData]);
            }
        });

        prx.on("onError", function () {
            this.error.show();
        });

        prx.option({loadingbar: false, async: callback != null});

        prx.execute();

        return codeData;
    };

    /**
     * 네임 코드데이터
     * 
     * @param path
     * @param code
     * @returns {string|*}
     *
     * @memberOf codedata#
     *
     * @example
     * <구 버전>
     * any.getCodeName = function (rowData) {
     *     var name = rowData["NAME_" + String(any.langCode).toUpperCase()];
     *
     *     if (name == null) name = rowData["NAME_" + String(any.defaultLangCode).toUpperCase()];
     *     if (name == null) name = rowData["NAME"];
     *     if (name == null) name = rowData["CODE"];
     *
     *     return (name == null ? "" : name);
     * }
     *
     * <구 버전>
     * any.getCodeDataName = function (codeDataPath, code) {
     *     var codeDatas = any.getCodeData(codeDataPath);
     *
     *     for (var i = 0; i < codeDatas.length; i++) {
     *         if (codeDatas[i].data.CODE == code) return any.getCodeName(codeDatas[i].data);
     *     }
     * }
     */
    name = function (path, code) {
        var codeData = f.get(path);

        if (codeData == null || codeData.data == null) {
            return "";
        }

        for (var i = 0, ii = codeData.data.length; i < ii; i++) {
            var data = codeData.data[i].data;
            if (data.CODE == code) {
                return data.NAME;
            }
            if (data.code == code) {
                return data.name;
            }
        }

        return "";
    };

    /**
     * 셋 코드데이터
     * 
     * @param path
     * @returns {{}}
     *
     * @memberOf codedata#
     *
     * @example
     * any.setCodeDataObjects = function (aObjs) {
     *     var objs = new Array();
     *     var reqs = new Array();
     *
     *     if (aObjs == null) {
     *         addObj(document.getElementsByTagName("SELECT"));
     *         addObj(document.getElementsByTagName("RADIO"));
     *         addObj(document.getElementsByTagName("CHECKMULTI"));
     *         addObj(document.getElementsByTagName("POPUP"));
     *     } else {
     *         addObj(aObjs);
     *     }
     *
     *     if (objs.length == 0) return;
     *
     *     for (var i = 0; i < objs.length; i++) {
     *         reqs.push({ id: i, path: objs[i].codeData });
     *     }
     *
     *     var codeDatas = any.getCodeData(reqs);
     *
     *     if (codeDatas == null || codeDatas.length < 1) return;
     *
     *     var errorMessage;
     *
     *     for (var i = 0; i < codeDatas.length; i++) {
     *         if (codeDatas[i].error == null) {
     *             objs[parseInt(codeDatas[i].id, 10)].setCodeDataObject(codeDatas[i].data);
     *             objs[parseInt(codeDatas[i].id, 10)].codeDataLoaded = true;
     *         } else {
     *             if (codeDatas[i].error == "") {
     *                 errorMessage = "[CodeData Error] " + objs[parseInt(codeDatas[i].id, 10)].codeData;
     *                 alert(errorMessage);
     *             } else {
     *                 errorMessage = "[CodeData Error] " + objs[parseInt(codeDatas[i].id, 10)].codeData + "\n\n" + codeDatas[i].error;
     *                 if (!confirm(errorMessage + "\n\n위 메세지를 복사하시겠습니까?")) continue;
     *                 window.clipboardData.setData("Text", errorMessage);
     *             }
     *         }
     *     }
     *
     *     function addObj(o) {
     *         for (var i = 0; i < o.length; i++) {
     *             if (o[i].scopeName != "ANY") continue;
     *             if (o[i].codeData == null) continue;
     *             if (o[i].codeData == "") continue;
     *             if (o[i].codeDataLoaded == true) continue;
     *             o[i].clearAll();
     *             objs.push(o[i]);
     *         }
     *     }
     * }
     */
    append = function (path) {
        if (path == null || any.text.trim(path) == "") {
            return;
        }

        if (any.codedata.container[path] != null) {
            return;
        }

        if (o.pathList == null) {
            o.pathList = [];
        }

        if (jQuery.inArray(path, o.pathList) == -1) {
            o.pathList.push(path);
        }

        return f;
    };

    f.load = function (callback) {
        if (o.pathList == null || o.pathList.length == 0) {
            return;
        }

        var prx = any.proxy().output(false);
        prx.url(any.config.codedataLoader);

        for (var i = 0, ii = o.pathList.length; i < ii; i++) {
            if (any.codedata.container[o.pathList[i]] != null) {
                continue;
            }
            prx.param("ID", i, true);
            prx.param("PATH", o.pathList[i], true);
        }

        prx.on("onSuccess", function () {
            var result = eval("([" + this.result + "])");
            var codeDatas;

            if (result != null && result.length > 0 && result[0]["_DATA_SET_JSON_"] != null) {
                codeDatas = result[0]["_DATA_SET_JSON_"];
            } else {
                codeDatas = result;
            }

            for (var i = 0, ii = codeDatas.length; i < ii; i++) {
                any.codedata.container[o.pathList[i]] = codeDatas[i];
            }

            o.pathList = null;

            if (callback != null) {
                callback.apply();
            }
        });

        prx.on("onError", function () {
            o.pathList = null;

            this.error.show();
        });

        prx.option({loadingbar: false, async: callback != null});

        prx.execute();
    };

    return f;

    function resetCodeData(control, codeData, attrName) {
        if (codeData.error == null) {
            if (control != null && "setCodeDataObject" in control) {
                control.setCodeDataObject(codeData.data);
            }
        } else {
            any.dialog(true).alert("[CodeData Error] " + (attrName == null ? "codedata[" + codeData.id + "]" : jQuery(control).attr(attrName)) + (codeData.error == "" ? "" : "\n\n" + codeData.error));
            if (control != null && "setCodeDataObject" in control) {
                control.setCodeDataObject([]);
            }
        }

        return codeData;
    }
};

any.control = function (control) {
    if (any.control.controls == null) {
        any.control.controls = {};
        any.control.util = {};
        any.control.sourceIndex = 0;
    }

    var f = {};

    f.resource = function (src, async) {
        if (src == null) {
            return f;
        }

        if (any.control.controls[control.toLowerCase()] == null) {
            any.control.controls[control.toLowerCase()] = {};
        }

        if (src.indexOf(".") == -1) {
            var ctrl = any.control.controls[src.toLowerCase()];
            if (ctrl == null) {
                return f;
            }
            for (var i = 0, ii = ctrl.resource.styles.length; i < ii; i++) {
                f.resource(ctrl.resource.styles[i].src);
            }
            for (var i = 0, ii = ctrl.resource.scripts.length; i < ii; i++) {
                f.resource(ctrl.resource.scripts[i].src, ctrl.resource.scripts[i].async);
            }
        } else {
            var ctrl = any.control.controls[control.toLowerCase()];
            if (ctrl.resource == null) {
                ctrl.resource = {styles: [], scripts: []};
            }
            if (any.text.endsWith(src, ".css", true) == true || src.toLowerCase().indexOf(".css?") != -1) {
                if (existsSrc(ctrl.resource.styles, src) != true) {
                    ctrl.resource.styles.push({src: src});
                }
            } else {
                if (existsSrc(ctrl.resource.scripts, src) != true) {
                    ctrl.resource.scripts.push({src: src, async: async !== false});
                }
                ctrl.behavior = null;
            }
        }

        return f;
    };

    f.plugin = function (nameOrBehavior, srcOrBehavior, async) {
        if (nameOrBehavior == null) {
            return f;
        }

        if (typeof (nameOrBehavior) === "function") {
            var behavior = nameOrBehavior;

            if (any.control.controls[control.toLowerCase()] == null) {
                any.control.controls[control.toLowerCase()] = {};
            }

            if (any.control.controls[control.toLowerCase()].plugins == null) {
                any.control.controls[control.toLowerCase()].plugins = [];
            }

            any.control.controls[control.toLowerCase()].plugins.push({behavior: behavior});
        } else if (typeof (srcOrBehavior) === "function") {
            var name = nameOrBehavior;
            var behavior = srcOrBehavior;

            if (any.control.controls[control.toLowerCase()] == null) {
                any.control.controls[control.toLowerCase()] = {};
            }

            if (any.control.controls[control.toLowerCase()].plugins == null) {
                any.control.controls[control.toLowerCase()].plugins = [];
            }

            any.control.controls[control.toLowerCase()].plugins.push({name: name, behavior: behavior});
        } else if (srcOrBehavior != null) {
            var name = nameOrBehavior;
            var src = srcOrBehavior;
            var ctrl = any.control.controls[control.toLowerCase()];

            if (ctrl.pluginResources == null) {
                ctrl.pluginResources = {};
            }

            if (ctrl.pluginResources[name.toLowerCase()] == null) {
                ctrl.pluginResources[name.toLowerCase()] = [];
            }

            if (existsSrc(ctrl.pluginResources[name.toLowerCase()], src) != true) {
                ctrl.pluginResources[name.toLowerCase()].push({src: src, async: async !== false});
            }
        }

        return f;
    };

    f.config = function (key, value) {
        var controlName;
        var dataConfig;

        if (typeof (control) === "string") {
            controlName = control;
        } else {
            var $control = jQuery(control);
            controlName = $control.controlName(true);
            dataConfig = $control.data("any-config");
        }

        if (any.control.controls[controlName.toLowerCase()] == null) {
            any.control.controls[controlName.toLowerCase()] = {};
        }

        if (arguments.length < 1) {
            return any.control.controls[controlName.toLowerCase()].config;
        }

        if (any.control.controls[controlName.toLowerCase()].config == null) {
            any.control.controls[controlName.toLowerCase()].config = {};
        }

        if (arguments.length < 2) {
            if (dataConfig != null && key in dataConfig) {
                return dataConfig[key];
            }
            return any.control.controls[controlName.toLowerCase()].config[key];
        }

        any.control.controls[controlName.toLowerCase()].config[key] = value;

        return f;
    };

    f.define = function (behavior) {
        if (any.control.controls[control.toLowerCase()] == null) {
            any.control.controls[control.toLowerCase()] = {};
        }

        any.control.controls[control.toLowerCase()].behavior = behavior;

        return f;
    };

    f.inherit = function (name) {
        if (any.control.controls[control.toLowerCase()] == null) {
            any.control.controls[control.toLowerCase()] = {};
        }

        var inherit = {name: name.toLowerCase()};

        for (var i = 1, ii = arguments.length; i < ii; i++) {
            if (any.text.startsWith(arguments[i], "function ready", true)) {
                inherit.ready = arguments[i];
            } else if (any.text.startsWith(arguments[i], "function initialize", true)) {
                inherit.init = arguments[i];
            }
        }

        any.control.controls[control.toLowerCase()].inherit = inherit;

        return f;
    };

    f.newIndex = function () {
        return any.control.sourceIndex++;
    };

    f.initialize = function (context) {
        if (control == null) {
            return getControls(context).control();
        }

        var $control = jQuery(control);

        if ($control.data("any-control-name-current") == $control.controlName()) {
            var $script = $control.next('script[type="text/any-initialize"]');
            if ($script.length == 1) {
                new Function($script[0].text).apply(control);
            }
            if (typeof (window[control.id + "_initialize"]) === "function") {
                window[control.id + "_initialize"].apply(control);
            }
            $control.fire("any-initialize");
        } else {
            var init = $control.data($control.data("any-control-name-current") + "-initialize");
            if (init != null) {
                init.apply(control, [control, $control.data("any-control-name-current")]);
            }
            $control.fire("any-initialize", [$control.data("any-control-name-current")]);
        }

        $control.data("any-initialize.fired", true);
    };

    f.activate = function (name) {
        var $control = jQuery(control);

        if (name == null) {
            name = $control.attrControlName();
        }

        if (name == null && control.tagName.toUpperCase() == "BUTTON") {
            name = "any-button";
        }

        if (name == null) {
            return;
        }

        name = name.toLowerCase();

        $control.data("any-control-name-current", name);

        if ($control.data("any-control-name") == null) {
            $control.data("any-control-name", name);
        }

        if ($control.data("any-control-state") == null) {
            $control.data("any-control-state", {});
        }

        if (isScriptLoaded(name) !== true) {
            loadStyle(name);
            loadScript(control, name);
            return;
        }

        var inheritName = (any.control.controls[name] == null || any.control.controls[name].inherit == null ? null : any.control.controls[name].inherit.name);

        if (inheritName != null && $control.data("any-control-state")[inheritName] != "activated") {
            if ($control.data("any-control-queuenames") == null) {
                $control.data("any-control-queuenames", []);
            }
            $control.data("any-control-queuenames").splice(0, 0, name);
            if (any.control.controls[name].inherit.ready != null) {
                any.control.controls[name].inherit.ready.apply(control);
            }
            $control.data(inheritName + "-initialize", any.control.controls[name].inherit.init);
            any.control(control).activate(inheritName);
            return;
        }

        if ($control.data("any-control-state")[name] == "activated") {
            return;
        }

        $control.data("any-control-state")[name] = "activated";

        if (any.control.controls[name].plugins != null) {
            for (var i = 0, ii = any.control.controls[name].plugins.length; i < ii; i++) {
                var plugin = any.control.controls[name].plugins[i];
                if (plugin.name == null || jQuery.inArray(plugin.name, $control.data("any-control-plugin-names")) != -1) {
                    plugin.behavior.apply(control, [control, name]);
                }
            }
        }

        if (any.control.controls[name].behavior != null) {
            var dataConfig = $control.data("any-config");
            if (dataConfig != null && typeof (dataConfig) === "string") {
                $control.data("any-config", eval("(" + dataConfig + ")"));
            }
            any.control.controls[name].behavior.apply(control, [control, name]);
        }

        $control.removeData("any-control-name-current");

        var queueNames = $control.data("any-control-queuenames");

        if (queueNames == null) {
            $control.data("any-control-state")["[=ANY=]"] = "activated";
        } else {
            var queueName = queueNames[0];
            queueNames.splice(0, 1);
            if (queueNames.length == 0) {
                $control.removeData("any-control-queuenames");
            }
            $control.data("any-control-name-queue", queueName);
            any.control(control).activate(queueName);
        }
    };

    f.checkActivated = function (context) {
        var $controls = getControls(context).control();

        for (var i = 0, ii = $controls.length; i < ii; i++) {
            var state = $controls.eq(i).data("any-control-state");
            if (state != null && state["[=ANY=]"] != "activated") {
                return false;
            }
        }

        return true;
    };

    f.checkReady = function (context) {
        var $controls = getControls(context);

        for (var i = 0, ii = $controls.length; i < ii; i++) {
            if ($controls[i].isReady === false) {
                return false;
            }
        }

        return true;
    };

    return f;

    function existsSrc(arr, src) {
        var exists;

        for (var i = 0, ii = arr.length; i < ii; i++) {
            if (arr[i].src == src) {
                return true;
            }
        }

        return false;
    }

    function getControls(context) {
        var query = [];

        for (var item in any.control.controls) {
            query.push('[' + item + '=""]');
        }

        return jQuery(query.join(","), context);
    }

    function isScriptLoaded(name) {
        if (any.control.controls == null) {
            return true;
        }
        if (any.control.controls[name] == null) {
            return true;
        }
        if (any.control.controls[name].resource == null) {
            return true;
        }

        var scripts = any.control.controls[name].resource.scripts;

        if (scripts == null) {
            return true;
        }

        for (var i = 0, ii = scripts.length; i < ii; i++) {
            if (any.control.queues == null || any.control.queues.scripts[scripts[i].src] !== true) {
                return false;
            }
        }

        return true;
    }

    function loadStyle(name) {
        if (any.control.controls[name].resource == null) {
            return;
        }

        var styles = any.control.controls[name].resource.styles;

        if (styles == null) {
            return;
        }

        if (any.control.queues == null) {
            any.control.queues = {controls: {}, names: {}, styles: {}, scripts: {}};
        }

        for (var i = 0, ii = styles.length; i < ii; i++) {
            if (any.control.queues.styles[styles[i].src] != null) {
                continue;
            }
            any.control.queues.styles[styles[i].src] = true;
            any.loadStyle(styles[i].src);
        }
    }

    function loadScript(control, name, force) {
        if (any.control.controls[name].resource == null) {
            return;
        }

        var scripts = any.control.controls[name].resource.scripts;

        if (scripts == null) {
            return;
        }

        if (any.control.queues == null) {
            any.control.queues = {controls: {}, names: {}, styles: {}, scripts: {}};
        }

        if (any.control.queues.controls[name] == null) {
            any.control.queues.controls[name] = [];
        }

        var controls = any.control.queues.controls[name];

        if (control != null) {
            controls.push(control);
        }

        if (isScriptLoaded(name) === true) {
            for (var i = 0, ii = controls.length; i < ii; i++) {
                var controlState = jQuery(controls[i]).data("any-control-state");
                if (controlState != null && controlState[name] != "activate-started" && controlState[name] != "activated") {
                    controlState[name] = "activate-started";
                    any.control(controls[i]).activate(name);
                }
            }
            return;
        }

        if (force != true && control == null) {
            return;
        }

        for (var i = 0, ii = scripts.length; i < ii; i++) {
            if (any.control.queues.scripts[scripts[i].src] == false) {
                any.control.queues.names[name] = [null, name, true];
                if (scripts[i].async != true) {
                    break;
                }
            }

            if (any.control.queues.scripts[scripts[i].src] != null) {
                continue;
            }

            any.control.queues.scripts[scripts[i].src] = false;

            (function (script) {
                any.loadScript(script.src, function () {
                    any.control.queues.scripts[script.src] = true;
                    loadScript(null, name, script.async != true);
                    for (var item in any.control.queues.names) {
                        loadScript.apply(loadScript, any.control.queues.names[item]);
                    }
                });
            })(scripts[i]);

            if (scripts[i].async != true) {
                break;
            }
        }
    }
};

/**
 * 파일
 *
 * @param scope
 * @returns {{}}
 *
 * @constructs file
 */
file = function (scope) {
    var f = {};
    var o = {$f: jQuery(f), datas: [], params: [], events: {}};

    f.url = function (url) {
        if (arguments.length == 0) {
            return any.url(o.url);
        }

        o.url = url;

        return f;
    };

    f.header = function (name, value) {
        if (name == "") {
            return;
        }

        if (arguments.length == 0) {
            return;
        }

        if (arguments.length == 1) {
            return o.headers == null ? null : o.headers[name];
        }

        if (o.headers == null) {
            o.headers = {};
        }

        o.headers[name] = value;

        return f;
    };

    f.param = function (name, value, multi) {
        if (name == "") {
            return;
        }

        if (arguments.length == 0) {
            return;
        }

        if (o.params == null) {
            o.params = [];
        }

        if (arguments.length == 1) {
            return any.param(o.params).get(name);
        }

        any.param(o.params).set(name, value, multi);

        return f;
    };

    f.params = function (params, multi) {
        for (var i = 0; i < params.length; i++) {
            f.param(params[i].name, params[i].value, multi);
        }

        return f;
    };

    f.data = function (ds, id) {
        if (arguments.length == 0) {
            return o.datas;
        }

        if (ds == null) {
            return f;
        }

        if (typeof (ds) === "object") {
            if (ds.id == null) {
                return f;
            }
        } else {
            if (any.ds(null, scope).exists(ds) != true) {
                return f;
            }
            ds = any.ds(ds, scope);
        }

        for (var i = 0, ii = o.datas.length; i < ii; i++) {
            if (o.datas[i].ds == ds && o.datas[i].id == id) {
                return f;
            }
        }

        o.datas.push({ds: ds, id: id});

        return f;
    };

    f.on = f.event = function (name, func) {
        o.events[name] = func;

        o.$f.on(name, function (event, data) {
            func.apply(f, [data]);
        });

        return f;
    };

    f.upload = function (form, control) {
        if (any.config["/anyworks/file/session-continuous-proxy"] == true) {
            any.proxy().url(o.url).on("onSuccess", function () {
                upload(form, control);
            }).on("onError", function () {
                this.error.show();
            }).option("loadingbar", false).execute();
        } else {
            upload(form, control);
        }

        return f;
    };

    function upload(form, control) {
        if (form != null && form.method != null && (form.enctype != null || form.encoding != null)) {
            uploadForm(form, control);
        } else {
            uploadAjax(form, control);
        }
    }

    function uploadForm(form, control) {
        if (o.url == null) {
            return f;
        }

        var $form = jQuery(form);
        var $ifr = getFrame("UPLOAD");
        var attrs = {"method": $form.attr("method"), "enctype": $form.attr("enctype")};
        var rootWin = any.rootWindow();

        $form.attr({"method": "POST", "enctype": "multipart/form-data"});

        var $hiddenArea = $form.data("$upload-hidden-params-area");

        if ($hiddenArea == null) {
            $form.data("$upload-hidden-params-area", $hiddenArea = jQuery('<div>').appendTo($form));
        }

        $hiddenArea.empty();

        if (any.text.isEmpty(rootWin.any.meta.servletToken) != true) {
            $hiddenArea.append(jQuery('<input>').attr({
                type: "hidden",
                name: any.config["/anyworks/servlet-token-check/param-name"],
                value: rootWin.any.meta.servletToken
            }));
        }

        for (var i = 0, ii = o.params.length; i < ii; i++) {
            $hiddenArea.append(jQuery('<input>').attr({
                type: "hidden",
                name: o.params[i].name,
                value: o.params[i].value
            }));
        }

        for (var i = 0, ii = o.datas.length; i < ii; i++) {
            $hiddenArea.append(jQuery('<input>').attr({
                type: "hidden",
                name: o.datas[i].id,
                value: o.datas[i].ds.jsonString(o.datas[i].id)
            }));
        }

        $form.attr({"target": $ifr.attr("name"), "action": f.url()});

        if (control == null) {
            control = $form.data("any-file-control");
        }

        if (control != null) {
            jQuery(control).on("onUploadSuccess", function () {
                for (var name in attrs) {
                    if (attrs[name] == null) {
                        $form.removeAttr(name);
                    } else {
                        $form.attr(name, attrs[name]);
                    }
                }
            });
        }

        $ifr.on("onInvalidSessionError", function () {
            any.error({error: true, type: "session"}).show(function () {
                $form.submit();
            });
        });

        $form.submit();

        return f;
    }

    function uploadAjax(files, control) {
        if (files == null || files.length == 0) {
            o.$f.fire("onUploadSuccess");
            return;
        }

        var options = {
            url: f.url(),
            method: "POST",
            headers: o.headers,
            processData: false,
            contentType: false
        };

        var rootWin = any.rootWindow();

        if (any.text.isEmpty(rootWin.any.meta.servletToken) != true) {
            if (options.headers == null) {
                options.headers = {};
            }
            options.headers["X-AnyWorks-Servlet-Token"] = rootWin.any.meta.servletToken;
        }

        options.data = function () {
            var formData = new FormData();

            for (var i = 0, ii = files.length; i < ii; i++) {
                formData.append("file[]", files[i]);
            }

            for (var i = 0, ii = o.params.length; i < ii; i++) {
                formData.append(o.params[i].name, o.params[i].value);
            }

            for (var i = 0, ii = o.datas.length; i < ii; i++) {
                formData.append(o.datas[i].id, o.datas[i].ds.jsonString(o.datas[i].id));
            }

            return formData;
        }();

        options.success = function (data, textStatus, jqXHR) {
            var error = any.error().parse(jqXHR, null, "\n\n" + f.url());

            if (error.error != true) {
                var result = eval("([" + any.text.trim(jqXHR.responseText) + "])");
                var jsons;
                if (result != null && result.length > 0 && result[0]["_DATA_SET_JSON_"] != null) {
                    jsons = result[0]["_DATA_SET_JSON_"][0];
                } else if (any.text.isEmpty(jqXHR.responseText) != true) {
                    jsons = eval("(" + any.text.trim(jqXHR.responseText) + ")");
                }
                o.$f.fire("onUploadSuccess", [jsons]);
            } else {
                o.$f.fire("onActionFailure", [error]);
            }
        };

        options.error = function (jqXHR, textStatus, errorThrown) {
            o.$f.fire("onActionFailure", [any.error().parse(jqXHR, errorThrown, "\n\n" + f.url())]);
        };

        jQuery.ajax(options);
    }

    /**
     * 파일 다운로드
     *
     * @returns {{}}
     *
     * @memberOf file#
     *
     * @example
     * <구 버전>
     * any.fileDownloader = function () {
     *     var ifr_name = "__FILE_DOWNLOAD_FRAME__";
     *     var ifrs = document.getElementsByName(ifr_name);
     *
     *     var ifr = document.createElement('<IFRAME name="' + ifr_name + '" style="display:none;">');
     *     if (ifrs.length == 0) {
     *         document.body.appendChild(ifr);
     *     } else {
     *         ifrs[0].insertAdjacentElement("beforeBegin", ifr);
     *     }
     *
     *     var frm = document.body.appendChild(document.createElement('<FORM>'));
     *
     *     this.path = "/anyfive.framework.file.act.DownloadFile.do";
     *
     *     this.addParam = function (name, value) {
     *         addHidden(name, value);
     *     }
     *
     *     this.execute = function () {
     *         frm.action = any.getServletPath(this.path);
     *         frm.method = "post";
     *         frm.target = ifr_name;
     *         frm.submit();
     *     }
     *
     *     function addHidden(name, value) {
     *         if (value == null) return;
     *
     *         var hdn = document.createElement('<INPUT type="hidden" name="' + name + '">');
     *         hdn.value = value;
     *         frm.appendChild(hdn);
     *     }
     * }
     */
    download = function () {
        if (any.config["/anyworks/file/session-continuous-proxy"] == true) {
            any.proxy().url(o.url).on("onSuccess", function () {
                download();
            }).on("onError", function () {
                this.error.show();
            }).option("loadingbar", false).execute();
        } else {
            download();
        }

        return f;
    };

    function download() {
        var rootWin = any.rootWindow();
        var method = (o.datas.length > 0 ? "POST" : "GET");
        var $form = jQuery('<form>').attr({"method": method}).appendTo(document.body);
        var $ifr = getFrame("DOWNLOAD");

        if (method == "POST" && any.text.isEmpty(rootWin.any.meta.servletToken) != true) {
            $form.append(jQuery('<input>').attr({
                type: "hidden",
                name: any.config["/anyworks/servlet-token-check/param-name"],
                value: rootWin.any.meta.servletToken
            }));
        }

        for (var i = 0, ii = o.params.length; i < ii; i++) {
            $form.append(jQuery('<input>').attr({
                type: "hidden",
                name: o.params[i].name,
                value: o.params[i].value
            }));
        }

        if (o.datas.length > 0) {
            var jsons = [];

            for (var i = 0, ii = o.datas.length; i < ii; i++) {
                jsons.push(o.datas[i].ds.jsonString(o.datas[i].id));
            }

            $form.append(jQuery('<input>').attr({
                type: "hidden",
                name: "_DATA_SET_JSON_",
                value: '[' + jsons.join(",") + ']'
            }));
        }

        $form.attr({"target": $ifr.attr("name"), "action": f.url()});

        $ifr.on("onInvalidSessionError", function () {
            any.error({error: true, type: "session"}).show(function () {
                $form.submit();
            });
        });

        $form.submit();

        return f;
    }

    return f;

    function getFrame(type) {
        var ifr_name = "__IFR_FILE_" + type + "_" + any.control().newIndex() + "__";
        var $iframe = jQuery('iframe[name="' + ifr_name + '"]');

        if ($iframe.length > 0) {
            $iframe.remove();
        }

        $iframe = jQuery('<iframe name="' + ifr_name + '">').hide().appendTo(document.body);

        $iframe[0].onActionFailure = function (error) {
            $iframe.remove();

            any.error(error).show();

            o.$f.fire("onError");
        };

        for (var item in o.events) {
            $iframe[0][item] = o.events[item];
        }

        return $iframe;
    }
};

any.progress = function (obj) {
    var f = {};
    var o = {keyName: "_SERVICE_PROGRESS_KEY_", interval: 1000};

    function init() {
        o.count = 0;

        o.proxy = any.proxy().url(f.config("proxy.url"));

        o.proxy.param(o.keyName, o.keyValue = function () {
            var seeds = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var values = new Array();

            for (var i = 0; i < 8; i++) {
                values.push(seeds.substr(Math.floor(Math.random() * seeds.length), 1));
            }

            if (any.progress.keyIndex == null) {
                any.progress.keyIndex = 0;
            }

            return "KEY" + values.join("") + any.date().timestamp() + (any.progress.keyIndex++);
        }());

        o.proxy.onSuccess = function () {
            o.count++;

            var data = null;

            if (this.response != null && typeof (this.response.data) === "object") {
                data = this.response.data;
            } else if (this.result != null && this.result != "") {
                data = eval("(" + this.result + ")");
            }

            if (o.callback != null) {
                o.callback.apply(f, [data]);
            }

            if (data == null || data.completed == true || (data.startTime == 0 && o.count >= 5)) {
                f.stop();
            }

            if (o.interval != null && o.stopped != true) {
                window.setTimeout(o.proxy.execute, o.interval);
            }
        };

        o.proxy.onError = function () {
            this.error.show();
        };

        if (obj == null) {
            return;
        }

        if (typeof (obj) === "string") {
            obj += ((obj.indexOf("?") == -1 ? "?" : "&") + o.keyName + "=" + o.keyValue);
        } else if ("action" in obj) {
            jQuery('<input>').attr({type: "hidden", name: o.keyName}).val(o.keyValue).appendTo(obj);
        } else if ("param" in obj) {
            obj.param(o.keyName, o.keyValue);
        } else if ("push" in obj) {
            obj.push(o.keyName + "=" + o.keyValue);
        }

        jQuery(obj).on("onError", function () {
            f.stop();
        });
    }

    f.config = function (name, value) {
        if (any.progress["config-data"] == null) {
            any.progress["config-data"] = {};
        }

        if (arguments.length < 2) {
            return any.progress["config-data"][name];
        }

        any.progress["config-data"][name] = value;

        return f;
    };

    f.keyName = function () {
        return o.keyName;
    };

    f.keyValue = function () {
        return o.keyValue;
    };

    f.proxy = function () {
        return o.proxy;
    };

    f.interval = function (interval) {
        if (arguments.length < 1) {
            return o.interval;
        }

        o.interval = interval;

        return f;
    };

    f.callback = function (callback) {
        if (arguments.length < 1) {
            return o.callback;
        }

        o.callback = callback;

        return f;
    };

    f.count = function () {
        return o.count;
    };

    f.on = function (name, func) {
        if (o.$f == null) {
            o.$f = jQuery(f);
        }

        o.$f.on(name, func);

        return f;
    };

    f.start = function () {
        delete (o.stopped);

        if (o.$f != null) {
            o.$f.fire("onStart");
        }

        if (o.proxy.url() != null) {
            o.proxy.option({loadingbar: false}).execute();
        } else if (o.callback != null) {
            o.callback.apply(f);
        }

        return f;
    };

    f.stop = function () {
        if (o.stopped == true) {
            return f;
        }

        o.stopped = true;

        if (o.$f != null) {
            o.$f.fire("onStop");
        }

        return f;
    };

    init();

    return f;
};

any.search = function (obj) {
    var f = {};
    var o = {};

    if (obj == null) {
        f.prx = any.proxy();
        f.win = any.window();
    } else {
        f.prx = any.object.nvl(obj.prx, any.proxy());
        f.win = any.object.nvl(obj.win, any.window());
    }

    if (any.search.proxyDsIndex == null) {
        any.search.proxyDsIndex = 0;
    }

    f.ds = function (ds) {
        if (arguments.length < 1) {
            if (o.ds == null) {
                o.ds = any.ds("ds_any.search.proxyDs_" + (any.search.proxyDsIndex++));
            }

            return o.ds;
        }

        o.ds = ds;

        return f;
    };

    f.ok = function (callback) {
        if (arguments.length < 1) {
            return o.callback;
        }

        o.callback = callback;

        return this;
    };

    f.param = function () {
        f.prx.param.apply(f.prx, arguments);
        f.win.param.apply(f.win, arguments);

        return f;
    };

    f.paramArg = function () {
        f.prx.param.apply(f.prx, arguments);
        f.win.arg.apply(f.win, arguments);

        return f;
    };

    f.paramArg2 = function () {
        f.prx.param.apply(f.prx, arguments);
        f.win.param.apply(f.win, arguments);
        f.win.arg.apply(f.win, arguments);

        return f;
    };

    f.windowMode = function (windowMode) {
        if (arguments.length < 1) {
            return o.windowMode;
        }

        o.windowMode = windowMode;

        return f;
    };

    f.search = function () {
        if (o.windowMode === true) {
            searchWindow();
        } else {
            searchProxy();
        }

        function searchProxy() {
            if (f.prx.url() == null) {
                searchWindow();
                return;
            }

            f.prx.param(any.pagingParameterName("recordCountPerPage"), 2);
            f.prx.param(any.pagingParameterName("currentPageNo"), 1);
            f.prx.param("_DS_ID_", f.ds().id);
            f.prx.output(o.ds);

            f.prx.onSuccess = function () {
                if (o.ds.rowCount() == 0) {
                    if (o.callback != null) {
                        o.callback();
                    }
                } else if (o.ds.rowCount() == 1) {
                    if (o.callback != null) {
                        o.callback(o.ds.rowData(0), true);
                    }
                } else {
                    searchWindow();
                }

                o.ds.destroy();
            };

            f.prx.onError = function () {
                this.error.show();
            };

            f.prx.execute();
        }

        function searchWindow() {
            if (f.win.url() == null) {
                return;
            }

            f.win.ok(o.callback);
            f.win.show();
        }
    };

    return f;
};

any.ds = function (id, scope) {
    var f = {};

    f.exists = function (id) {
        return any.ds.container != null && any.ds.container[scope] != null && any.ds.container[scope][id] != null;
    };

    f.isChanged = function (includeIds, excludeIds) {
        if (includeIds == null) {
            jQuery('[bind^="ds_"]').each(function () {
                var attr = jQuery(this).attr("bind");
                var dsId = (attr.indexOf(":") == -1 ? attr : attr.substr(0, attr.indexOf(":")));
                if (any.ds().exists(dsId) != true) {
                    any.ds(dsId);
                }
            });
        } else {
            for (var i = 0, ii = includeIds.length; i < ii; i++) {
                if (any.ds().exists(includeIds[i]) != true) {
                    any.ds(includeIds[i]);
                }
            }
        }

        if (any.ds.container == null) {
            return false;
        }
        if (any.ds.container[scope] == null) {
            return false;
        }

        for (var id in any.ds.container[scope]) {
            var exclude = false;
            if (excludeIds != null) {
                for (var i = 0, ii = excludeIds.length; i < ii; i++) {
                    if (id == excludeIds[i]) {
                        exclude = true;
                        break;
                    }
                }
            }
            if (exclude != true) {
                if (any.ds(id).isChanged() == true) {
                    return true;
                }
            }
        }

        return false;
    };

    f.isValidJSON = function (obj) {
        return typeof (obj) === "object" && jQuery.type(obj.header) === "array" && jQuery.type(obj.data) === "array";
    };

    scope = parseScope(scope);

    if (id == null || id == "") {
        return f;
    }

    if (any.ds.container == null) {
        any.ds.container = {};
    }

    if (any.ds.container[scope] == null) {
        any.ds.container[scope] = {};
    }

    if (id === true) {
        if (any.ds.datasetIdIndex == null) {
            any.ds.datasetIdIndex = 0;
        }
        var dsId = "=ANY-DATASET#" + (any.ds.datasetIdIndex++) + "=";
        any.ds.container[scope][dsId] = new dataset(dsId).init();
        return any.ds.container[scope][dsId];
    }

    if (any.ds.container[scope][id] == null) {
        any.ds.container[scope][id] = new dataset(id).init();
    }

    return any.ds.container[scope][id];

    function parseScope(scope) {
        if (typeof (scope) !== "object") {
            return scope;
        }

        if ("id" in scope) {
            return scope.id;
        }

        if ("name" in scope) {
            return scope.name;
        }

        try {
            return JSON.stringify(scope);
        } catch (e) {
            return scope;
        }
    }

    function dataset(id) {
        var o = {self: this};

        this.id = id;
        this.disabled = false;

        this.scope = function (scope) {
            scope = parseScope(scope);

            if (arguments.length < 1) {
                for (var item in any.ds.container) {
                    if (any.ds.container[item][this.id] === this) {
                        return item;
                    }
                }
                return null;
            }

            for (var item in any.ds.container) {
                if (any.ds.container[item][this.id] === this) {
                    delete (any.ds.container[item][this.id]);
                }
            }

            if (any.ds.container[scope] == null) {
                any.ds.container[scope] = {};
            }

            any.ds.container[scope][this.id] = this;

            return this;
        };

        this.init = function () {
            o.json = {header: [], data: []};
            o.keys = null;
            o.originalJSON = null;

            return this;
        };

        this.useNull = function (useNull) {
            if (arguments.length < 1) {
                return o.useNull === true;
            }

            o.useNull = useNull;

            return this;
        };

        this.dataOnly = function (dataOnly) {
            if (arguments.length < 1) {
                return o.dataOnly === true;
            }

            o.dataOnly = dataOnly;

            return this;
        };

        this.dataLoader = function (dataLoader) {
            if (arguments.length < 1) {
                return o.dataLoader;
            }

            o.dataLoader = dataLoader;
        };

        this.listData = function (isListData) {
            if (arguments.length < 1) {
                return o.isListData === true;
            }

            o.isListData = isListData;

            return this;
        };

        this.isEmpty = function () {
            return o.json.header.length == 0 && o.json.data.length == 0;
        };

        this.parse = function (json, stringify) {
            if (stringify === true && typeof (json) === "object") {
                this.json(getJsonString(json));
            } else {
                this.json(json);
            }

            o.originalJSON = any.object.clone(o.json);

            return this;
        };

        this.load = function (json, stringify) {
            this.parse(json, stringify);

            jQuery(this).fire("onLoad");

            return this;
        };

        this.loadData = function (data, withJobType, metaMap) {
            this.init();

            if (metaMap != null) {
                for (var name in metaMap) {
                    this.meta(name, metaMap[name]);
                }
            }

            o.forJsonValue = true;

            for (var i = 0, ii = data.length; i < ii; i++) {
                var row = this.addRow();
                for (var item in data[i]) {
                    this.value(row, item, data[i][item]);
                    if (withJobType === true) {
                        this.jobType(row, data[i]["_JOB_TYPE"]);
                    }
                }
            }

            executeDatasetToControlBind();

            delete (o.forJsonValue);

            jQuery(this).fire("onLoad");

            return this;
        };

        this.clearData = function (addDefaultRow) {
            o.json.data = [];

            if (addDefaultRow == true) {
                this.addRow();
            }

            executeDatasetToControlBind();

            return this;
        };

        this.addColumn = function (colId) {
            if (this.colIndex(colId) != -1) {
                return this;
            }

            o.json.header.push({id: colId});

            return this;
        };

        this.addRow = function (data) {
            return this.insertRow(o.json.data.length, data);
        };

        this.insertRow = function (row, data) {
            o.json.data.splice(row, 0, {jobType: "C", data: {}});

            if (data != null) {
                this.rowData(row, data);
            }

            return row;
        };

        this.eraseRow = function (row) {
            for (var i = 0, ii = this.colCount(); i < ii; i++) {
                this.value(row, i, null);
            }
        };

        this.deleteAll = function (erase) {
            for (var i = this.rowCount(); i >= 0; i--) {
                if (erase == true) {
                    this.eraseRow(i);
                }
                this.deleteRow(i);
            }

            return this;
        };

        this.deleteRow = function (row) {
            if (row == -1) {
                return;
            }

            var jobType = o.self.jobType(row);

            if (jobType == "C") {
                o.json.data.splice(row, 1);
                return true;
            }

            if (jobType != "D" && o.json.data[row] != null) {
                o.json.data[row].orgJobType = jobType;
                o.self.jobType(row, "D");
            }

            return false;
        };

        this.restoreRow = function (row) {
            o.self.jobType(row, o.json.data[row].orgJobType);
        };

        this.moveRow = function (oldRow, newRow) {
            if (oldRow == newRow) {
                return newRow;
            }

            var data = o.json.data.splice(oldRow, 1)[0];

            if (data == null) {
                data = {jobType: "C", data: {}};
            }

            o.json.data.splice(newRow, 0, data);

            return newRow;
        };

        this.colCount = function () {
            return o.json.header.length;
        };

        this.rowCount = function (withoutDeletedRow) {
            if (this.disabled == true) {
                return -1;
            }

            if (withoutDeletedRow != true) {
                return o.json.data.length;
            }

            var rowCount = 0;

            for (var i = 0, ii = o.json.data.length; i < ii; i++) {
                if (this.jobType(i) != "D") {
                    rowCount++;
                }
            }

            return rowCount;
        };

        this.colId = function (colIndex) {
            if (colIndex == null) {
                return null;
            }
            if (colIndex < 0) {
                return null;
            }
            if (colIndex >= this.colCount()) {
                return null;
            }

            return o.json.header[colIndex].id;
        };

        this.colIndex = function (colId) {
            for (var c = 0; c < o.json.header.length; c++) {
                if (o.json.header[c].id == colId) {
                    return c;
                }
            }

            return -1;
        };

        this.meta = function (name, value) {
            if (o.json.meta == null) {
                o.json.meta = {};
            }

            if (arguments.length < 1) {
                return o.json.meta;
            }

            if (arguments.length < 2) {
                return o.json.meta[name];
            }

            o.json.meta[name] = value;

            return this;
        };

        this.colValues = function (col) {
            var colId;

            if (typeof (col) === "string") {
                colId = col;
            } else {
                colId = this.colId(col);
            }

            var values = [];

            for (var i = 0, ii = this.rowCount(); i < ii; i++) {
                values.push(this.rowData(i)[colId]);
            }

            return values;
        };

        this.value = function (row, col, val) {
            if (row == null || col == null) {
                return;
            }

            var colId;

            if (typeof (col) === "string") {
                colId = col;
            } else {
                colId = this.colId(col);
            }

            if (arguments.length < 3) {
                if (colId == null) {
                    return null;
                }

                jQuery(this).fire("onBeforeSend");

                bindControlToDataset(getControlIndex(row), colId);

                if (o.json.data[row] == null) {
                    return null;
                }

                val = o.json.data[row].data[colId];

                if (val == null && o.useNull !== true) {
                    return "";
                }

                return val;
            }

            if (colId == null) {
                return;
            }

            o.self.addColumn(colId);

            if (row == 0 && o.self.rowCount() == 0) {
                o.self.addRow();
            }

            if (o.json.data[row] == null) {
                return;
            }

            o.json.data[row].data[colId] = val;

            if (o.self.jobType(row) == "") {
                o.self.jobType(row, "U");
            }

            if (o.forJsonValue != true) {
                bindDatasetToControl(row, colId);
            }

            return this;
        };

        this.valueRow = function (obj) {
            jQuery(this).fire("onBeforeSend");

            for (var i = 0, ii = this.rowCount(); i < ii; i++) {
                if (function (row) {
                    for (var key in obj) {
                        var val = o.self.rowData(row)[key];
                        if (val == null || val != obj[key]) {
                            return false;
                        }
                    }
                    return true;
                }(i) == true) return i;
            }

            return -1;
        };

        this.dataRow = function (rowData) {
            for (var i = 0, ii = o.json.data.length; i < ii; i++) {
                if (o.json.data[i] == rowData || o.json.data[i].data == rowData) {
                    return i;
                }
            }

            return -1;
        };

        this.rowDataWithBind = function (row) {
            bindControlToDataset(row);

            return o.json.data[row].data;
        };

        this.rowData = function (row, obj, update) {
            if (arguments.length < 2) {
                return o.json.data[row].data;
            }

            if (update != true) {
                for (var i = 0, ii = o.self.colCount(); i < ii; i++) {
                    o.self.value(row, o.self.colId(i), null);
                }
            }

            if (row == 0 && o.self.rowCount() == 0) {
                o.self.addRow();
            }

            if (update != true) {
                o.json.data[row].data = {};
            }

            if (obj == null) {
                return this;
            }

            for (var item in obj) {
                o.json.data[row].data[item] = obj[item];
            }

            for (var item in obj) {
                o.self.value(row, item, obj[item]);
            }

            return this;
        };

        this.fromControl = function () {
            jQuery(this).fire("onBeforeSend");

            executeControlToDatasetBind();

            return this;
        };

        this.jobType = function (row, val) {
            if (row == -1) {
                return;
            }

            if (arguments.length >= 2) {
                o.json.data[row].jobType = val;
                return this;
            }

            if (typeof (row) === "number") {
                return any.text.nvl(o.json.data[row] == null ? null : o.json.data[row].jobType, "");
            }

            for (var i = 0, ii = o.json.data.length; i < ii; i++) {
                o.json.data[i].jobType = row;
            }

            return this;
        };

        this.clearJobType = function () {
            for (var r = 0, rr = o.json.data.length; r < rr; r++) {
                if (o.json.data[r].jobType == "D") {
                    o.json.data[r].isDeleted = true;
                } else {
                    o.json.data[r].jobType = null;
                }
            }

            return this;
        };

        this.resetJobType = function (jobType) {
            if (arguments.length >= 1) {
                for (var i = 0, ii = o.json.data.length; i < ii; i++) {
                    o.json.data[i].jobType = jobType;
                }
                return this;
            }

            for (var r = o.json.data.length - 1; r >= 0; r--) {
                if (o.json.data[r].jobType == "C") {
                    this.deleteRow(r);
                } else {
                    o.json.data[r].jobType = null;
                }
            }

            return this;
        };

        this.json = function (json) {
            if (arguments.length < 1) {
                executeControlToDatasetBind();
                return o.json;
            }

            if (json == null || json === "") {
                json = {header: [], data: []};
            }

            if (typeof (json) === "string") {
                o.json = eval("(" + json + ")");
            } else {
                o.json = json;
            }

            executeDatasetToControlBind();

            return this;
        };

        this.jsonString = function (datasetId) {
            if (this.disabled == true) {
                return null;
            }

            jQuery(this).fire("onBeforeSend");

            executeControlToDatasetBind();

            return this.jsonStringWithoutBind(datasetId);
        };

        this.jsonStringWithoutBind = function (datasetId) {
            if (this.disabled == true) {
                return null;
            }

            return getJsonString(o.json, datasetId == null ? this.id : datasetId);
        };

        this.toJSON = function () {
            if (this.disabled == true) {
                return null;
            }

            if (this.listData() === true) {
                return this.toList();
            }

            return this.toData();
        };

        this.toData = function () {
            if (this.disabled == true) {
                return null;
            }

            jQuery(this).fire("onBeforeSend");

            o.forJsonValue = true;

            executeControlToDatasetBind();

            delete (o.forJsonValue);

            var json = (this.rowCount() == 0 ? {} : this.rowData(0));

            json["_JOB_TYPE"] = this.jobType(0);

            for (name in json) {
                if (json[name] === "") {
                    json[name] = null;
                }
            }

            return json;
        };

        this.toList = function () {
            if (this.disabled == true) {
                return null;
            }

            jQuery(this).fire("onBeforeSend");

            o.forJsonValue = true;

            executeControlToDatasetBind();

            delete (o.forJsonValue);

            var json = [];

            for (var i = 0, ii = this.rowCount(); i < ii; i++) {
                var rowData = this.rowData(i);

                rowData["_JOB_TYPE"] = this.jobType(i);

                for (name in rowData) {
                    if (rowData[name] === "") {
                        rowData[name] = null;
                    }
                }

                json.push(rowData);
            }

            return json;
        };

        this.setKeys = function () {
            o.keys = Array.prototype.slice.call(arguments);
        };

        this.setBinder = function (datasetToControl, controlToDataset) {
            o.binder = {datasetToControl: datasetToControl, controlToDataset: controlToDataset};
        };

        this.resetControlValues = function () {
            executeDatasetToControlBind();
        };

        this.saveDefault = function () {
            o.defaultJSON = any.object.clone(o.self.json());
        };

        this.loadDefault = function () {
            this.load(any.object.clone(o.defaultJSON));
        };

        this.hierarchy = function (keyColId, parentColId, levelColId) {
            for (var r = 0, rr = o.json.data.length; r < rr; r++) {
                var newRow = getNewRow(r);
                if (newRow != -1) {
                    this.moveRow(r, newRow);
                }
            }

            function getNewRow(row) {
                var parentRow = -1;
                var newRow = -1;

                for (var r = 0, rr = o.json.data.length; r < rr; r++) {
                    if (o.json.data[r].data[keyColId] == o.json.data[row].data[parentColId]) {
                        parentRow = r;
                        break;
                    }
                }

                if (parentRow == -1) {
                    return -1;
                }

                o.json.data[parentRow].hasChild = true;

                for (var r = parentRow + 1, rr = o.json.data.length; r < rr; r++) {
                    if (Number(o.json.data[r].data[levelColId]) < Number(o.json.data[row].data[levelColId])) {
                        newRow = r;
                        break;
                    }
                }

                return newRow;
            }
        };

        this.hasChild = function (row) {
            if (row != -1) {
                return o.json.data[row].hasChild === true;
            }
        };

        this.isChanged = function () {
            executeControlToDatasetBind();

            if (o.originalJSON == null || o.originalJSON.header == null || o.originalJSON.data == null) {
                for (var i = 0, ii = o.json.data.length; i < ii; i++) {
                    var data = o.json.data[i].data;
                    for (var id in data) {
                        if (data[id] != null && data[id] != "") {
                            return true;
                        }
                    }
                }
                return false;
            }

            if (o.originalJSON.header.length > o.json.header.length) {
                return true;
            }
            if (o.originalJSON.data.length != o.json.data.length) {
                return true;
            }

            for (var i = 0, ii = o.originalJSON.header.length; i < ii; i++) {
                if (o.originalJSON.header[i].id != o.json.header[i].id) {
                    return true;
                }
            }

            for (var i = 0, ii = o.originalJSON.data.length; i < ii; i++) {
                if (o.json.data[i].jobType == "D") {
                    return true;
                }
                var data1 = o.originalJSON.data[i].data;
                var data2 = o.json.data[i].data;
                for (var id in data1) {
                    var val1 = (data1[id] == null && o.useNull !== true ? "" : data1[id]);
                    var val2 = (data2[id] == null && o.useNull !== true ? "" : data2[id]);
                    if (val1 != val2) {
                        return true;
                    }
                }
            }

            return false;
        };

        this.destroy = function () {
            delete (any.ds.container[scope][id]);
        };

        function getControlIndex(dsRow) {
            if (o.keys == null) {
                return dsRow;
            }

            if (o.rowIndexMap != null && o.rowIndexMap.controlIndex[dsRow] != null) {
                return o.rowIndexMap.controlIndex[dsRow];
            }

            var ctrlCount = -1;

            for (var c = 0; c < o.keys.length; c++) {
                ctrlCount = Math.max(ctrlCount, $getBindControl(o.keys[c]).length);
            }

            if (ctrlCount > dsRow && checkRowIndex(dsRow, dsRow) == true) {
                if (o.rowIndexMap != null) {
                    o.rowIndexMap.save(dsRow, dsRow);
                }
                return dsRow;
            }

            for (var r = 0; r < ctrlCount; r++) {
                if (checkRowIndex(r, dsRow) == true) {
                    if (o.rowIndexMap != null) {
                        o.rowIndexMap.save(r, dsRow);
                    }
                    return r;
                }
            }

            if (ctrlCount > dsRow) {
                var dsRowReturn = true;
                for (var c = 0; c < o.keys.length; c++) {
                    if (o.json.data[dsRow].data[o.keys[c]] != null) {
                        dsRowReturn = false;
                        break;
                    }
                }
                if (dsRowReturn == true) {
                    return dsRow;
                }
            }

            return -1;
        }

        function getDatasetIndex(ctrlRow) {
            if (o.keys == null) {
                return ctrlRow;
            }

            if (o.rowIndexMap != null && o.rowIndexMap.datasetIndex[ctrlRow] != null) {
                return o.rowIndexMap.datasetIndex[ctrlRow];
            }

            var dsRowCount = o.self.rowCount();

            if (dsRowCount > ctrlRow && checkRowIndex(ctrlRow, ctrlRow) == true) {
                if (o.rowIndexMap != null) {
                    o.rowIndexMap.save(ctrlRow, ctrlRow);
                }
                return ctrlRow;
            }

            for (var i = 0; i < dsRowCount; i++) {
                if (checkRowIndex(ctrlRow, i) == true) {
                    if (o.rowIndexMap != null) {
                        o.rowIndexMap.save(ctrlRow, i);
                    }
                    return i;
                }
            }

            if (dsRowCount > ctrlRow) {
                var ctrlRowReturn = true;
                for (var c = 0; c < o.keys.length; c++) {
                    if (o.json.data[ctrlRow].data[o.keys[c]] != null) {
                        ctrlRowReturn = false;
                        break;
                    }
                }
                if (ctrlRowReturn == true) {
                    return ctrlRow;
                }
            }

            return -1;
        }

        function checkRowIndex(ctrlRow, dsRow) {
            for (var c = 0; c < o.keys.length; c++) {
                if (o.json.data[dsRow] == null || getBindControlValue($getBindControl(o.keys[c]).eq(ctrlRow), o.keys[c]) != o.json.data[dsRow].data[o.keys[c]]) {
                    return false;
                }
            }

            return true;
        }

        function getJsonString(json, datasetId) {
            var str = [];

            str.push('{\n');
            str.push('"id":"' + (datasetId == null ? json.id : datasetId) + '",\n');
            str.push('"header":[\n');
            for (var c = 0; c < json.header.length; c++) {
                str.push((c == 0 ? '' : ',') + '{"id":"' + any.text.toJSON(json.header[c].id) + '"}');
            }
            str.push('\n],\n');
            if (json.meta != null) {
                str.push('"meta":{\n');
                var delimiter = "";
                for (var item in json.meta) {
                    if (json.meta[item] == null) {
                        continue;
                    }
                    str.push(delimiter + '"' + item + '":"' + any.text.toJSON(json.meta[item]) + '"');
                    delimiter = ",";
                }
                str.push("\n},\n");
            }
            str.push('"data":[\n');
            for (var r = 0; r < json.data.length; r++) {
                var jobType = json.data[r].jobType;
                if (jobType == "D" && json.data[r].isDeleted == true) {
                    continue;
                }
                if (r > 0) {
                    str.push(',\n');
                }
                str.push('{' + (jobType == null || jobType == "" ? '' : '"jobType":"' + jobType + '",') + '"data":{');
                var delimiter = "";
                for (var c = 0; c < json.header.length; c++) {
                    var val = json.data[r].data[json.header[c].id];
                    if (val == null) {
                        continue;
                    }
                    if (any.ds().isValidJSON(val)) {
                        str.push(delimiter + '"' + any.text.toJSON(json.header[c].id) + '":' + getJsonString(val));
                    } else if (typeof (val) === "number" || typeof (val) === "boolean") {
                        str.push(delimiter + '"' + any.text.toJSON(json.header[c].id) + '":' + val);
                    } else if (jQuery.type(val) === "date") {
                        str.push(delimiter + '"' + any.text.toJSON(json.header[c].id) + '":' + val.getTime());
                    } else {
                        str.push(delimiter + '"' + any.text.toJSON(json.header[c].id) + '":"' + any.text.toJSON(String(val)) + '"');
                    }
                    delimiter = ",";
                }
                str.push('}}');
            }
            str.push('\n]}');

            return str.join("");
        }

        function initRowIndexMap() {
            if (o.keys == null) {
                return;
            }

            o.rowIndexMap = {controlIndex: {}, datasetIndex: {}};

            o.rowIndexMap.save = function (ctrlRow, dsRow) {
                o.rowIndexMap.controlIndex[dsRow] = ctrlRow;
                o.rowIndexMap.datasetIndex[ctrlRow] = dsRow;
            };
        }

        function executeDatasetToControlBind() {
            initRowIndexMap();

            if (o.binder != null && o.binder.datasetToControl != null) {
                o.binder.datasetToControl.apply(o.self);
            } else {
                bindDatasetToControl();
            }

            delete (o.rowIndexMap);
        }

        function executeControlToDatasetBind() {
            initRowIndexMap();

            if (o.binder != null && o.binder.controlToDataset != null) {
                o.binder.controlToDataset.apply(o.self);
            } else {
                bindControlToDataset();
            }

            delete (o.rowIndexMap);
        }

        function bindDatasetToControl(row, colId) {
            if (o.dataOnly === true) {
                return;
            }

            if (row == -1) {
                return;
            }

            $getBindControl.controls = {};

            if (colId == null) {
                for (var i = 0, ii = o.self.colCount(); i < ii; i++) {
                    bindCol(o.self.colId(i));
                }
            } else {
                bindCol(colId);
            }

            $getBindControl.controls = null;

            function bindCol(colId) {
                var $ctrl = $getBindControl(colId);

                if ($ctrl == null) {
                    return;
                }

                o.self.addColumn(colId);

                if (row == null) {
                    for (var i = 0, ii = o.self.rowCount(); i < ii; i++) {
                        bindRow(i);
                    }
                } else {
                    bindRow(row);
                }

                function bindRow(dsRow) {
                    var ctrlRow = getControlIndex(dsRow);

                    if (ctrlRow == -1) {
                        o.self.deleteRow(ctrlRow);
                        return;
                    }

                    if ($ctrl.get(ctrlRow) == null) {
                        return;
                    }

                    setBindControlValue($ctrl.eq(ctrlRow), colId, function () {
                        if (String($ctrl.get(ctrlRow).isObjectValueSet).toLowerCase() == "true") {
                            return o.self.rowData(dsRow);
                        }

                        if ($ctrl.get(ctrlRow).tagName.toLowerCase() == "img") {
                            return any.url(any.text.nvl(o.json.data[dsRow].data[colId], ""));
                        }

                        return any.text.nvl(o.json.data[dsRow].data[colId], "");
                    }());
                }
            }
        }

        function bindControlToDataset(row, colId) {
            if (o.dataOnly === true) {
                return;
            }

            if (row == -1) {
                return;
            }

            $getBindControl.controls = {};

            if (colId == null) {
                var cols = {};
                jQuery('[bind="' + o.self.id + '"],[bind^="' + o.self.id + ':"],[name^="' + o.self.id + '."],[id^="' + o.self.id + '."]').each(function () {
                    var $this = jQuery(this);
                    var key;
                    if ($this.attr("bind") != null) {
                        if ($this.attr("bind").indexOf(":") != -1) {
                            key = $this.attr("bind").split(":")[1];
                        } else {
                            key = any.text.nvl($this.attr("name"), this.id);
                        }
                    } else if ($this.attr("name") != null && $this.attr("name").indexOf(".") != -1) {
                        key = $this.attr("name").split(".")[1];
                    } else if (this.id != null && this.id.indexOf(".") != -1) {
                        key = this.id.split(".")[1];
                    } else {
                        key = any.text.nvl($this.attr("name"), this.id);
                    }
                    if (key != null && any.text.trim(key) != "" && cols[key] != true) {
                        cols[key] = true;
                        bindCol(key);
                    }
                });
            } else {
                bindCol(colId);
            }

            $getBindControl.controls = null;

            function bindCol(colId) {
                var $ctrl = $getBindControl(colId);

                if ($ctrl == null) {
                    return;
                }

                o.self.addColumn(colId);

                if (row >= $ctrl.length) {
                    return;
                }

                if (row == null) {
                    for (var i = 0, ii = o.self.rowCount(); i < ii; i++) {
                        if (getControlIndex(i) == -1) {
                            o.self.deleteRow(i);
                        }
                    }
                    for (var i = 0; i < $ctrl.length; i++) {
                        bindRow(i);
                    }
                } else {
                    bindRow(row);
                }

                function bindRow(ctrlRow) {
                    var dsRow = getDatasetIndex(ctrlRow);

                    if (dsRow == -1 || o.self.rowCount() <= dsRow) {
                        dsRow = o.self.insertRow(ctrlRow);
                    }

                    if ($ctrl.eq(ctrlRow).isDisabled()) {
                        o.json.data[dsRow].data[colId] = null;
                    } else {
                        var val = getBindControlValue($ctrl.eq(ctrlRow), colId);
                        if (jQuery.type(val) == "object") {
                            for (var col in val) {
                                o.self.addColumn(col);
                                o.json.data[dsRow].data[col] = val[col];
                            }
                        } else {
                            o.json.data[dsRow].data[colId] = val;
                        }
                    }

                    if (o.self.jobType(dsRow) == "") {
                        o.self.jobType(dsRow, "U");
                    }
                }
            }
        }

        function $getBindControl(colId) {
            if (colId == null || any.text.trim(colId) == "") {
                return null;
            }

            if ($getBindControl.controls != null && $getBindControl.controls[colId] != null) {
                return $getBindControl.controls[colId];
            }

            var selectors = [];

            selectors.push('[bind="' + o.self.id + ':' + colId + '"]');
            selectors.push('[bind="' + o.self.id + '"][id="' + colId + '"]');
            selectors.push('[bind="' + o.self.id + '"][name="' + colId + '"]');
            selectors.push('[bind^="' + o.self.id + ':' + colId + ':"]');
            selectors.push('[bind^="' + o.self.id + '::"][id="' + colId + '"]');
            selectors.push('[bind^="' + o.self.id + '::"][name="' + colId + '"]');
            selectors.push('[bind1="' + o.self.id + ':' + colId + '"]');
            selectors.push('[bind2="' + o.self.id + ':' + colId + '"]');
            selectors.push('[name="' + o.self.id + '.' + colId + '"]');
            selectors.push('[id="' + o.self.id + '.' + colId + '"]');

            var $controls = jQuery(selectors.join(","));

            if ($getBindControl.controls != null) {
                $getBindControl.controls[colId] = $controls;
            }

            return $controls;
        }

        function getBindControlValue($ctrl, colId) {
            var propName = getBindPropertyName($ctrl);

            if (propName != null) {
                return $ctrl.prop(propName);
            }
        }

        function setBindControlValue($ctrl, colId, value) {
            var propName = getBindPropertyName($ctrl);

            if (propName != null) {
                $ctrl.prop(propName, value);
            }
        }

        function getBindPropertyName($ctrl) {
            var bind = $ctrl.attr("bind");

            if (bind != null) {
                var binds = bind.split(":");

                if (binds.length > 2) {
                    return binds[2];
                }
            }

            var ctrl = $ctrl.get(0);

            if (o.forJsonValue === true) {
                if ("time" in ctrl) {
                    return "time";
                }
                if ("jsonObject" in ctrl) {
                    return "jsonObject";
                }
            } else {
                if ("jsonString" in ctrl) {
                    return "jsonString";
                }
            }
            if ("value" in ctrl) {
                return "value";
            }
            if ("ds" in ctrl) {
                return null;
            }

            var props = $ctrl.data("any-properties");

            if (props != null) {
                if (o.forJsonValue === true) {
                    if (props.time != null) {
                        return "time";
                    }
                    if (props.jsonObject != null) {
                        return "jsonObject";
                    }
                } else {
                    if (props.jsonString != null) {
                        return "jsonString";
                    }
                }
                if (props.value != null) {
                    return "value";
                }
                if (props.ds != null) {
                    return null;
                }
            }

            switch (ctrl.tagName.toUpperCase()) {
                case "TD":
                case "LABEL":
                case "SPAN":
                case "DIV":
                case "PRE":
                case "XMP":
                case "A":
                    return "innerText";
                case "IMG":
                    return "src";
                default:
                    return "value";
            }
        }
    }
};

/**
 * 디버그
 *
 * @constructs debug
 */
debug = function () {

    /**
     * 디버그 클리어
     *
     * @memberOf debug#
     */
    clear = function () {
        any.debug.buffer = null;
        var win = any.debug.window;
        if (win == null || win.closed == true || win.$clear == null) return;
        win.$clear();
    };

    write = function (val) {
        if (any.debug.buffer != null) {
            any.debug.buffer.push(val);
            return;
        }
        var win = any.debug.window;
        try {
            win.$write(val);
        } catch (ex) {
            if (win == null || win.closed == true || win.$write == null) {
                win = any.debug.window = window.open(any.meta.contextPath + "/ipms/com/debug/DebugViewer.jsp", "_AnyWorks_Debug_", "menubar=no,scrollbars=yes,resizable=yes,left=0,top=0,width=600,height=500");
            }
            any.debug.buffer = [val];
            any.debug.setDebugTimeout();
        }
    };

    writeObject = function (obj) {
        for (var item in obj) {
            try {
                any.debug.write(item + " : " + obj[item]);
            } catch (ex) {
                any.debug.write(item + " : [ERROR] " + ex.description);
            }
        }
    };

    writeBuffer = function () {
        var win = any.debug.window;
        try {
            win.$writeBuffer(any.debug.buffer);
            any.debug.buffer = null;
        } catch (ex) {
            any.debug.setDebugTimeout();
        }
    };

    setDebugTimeout = function () {
        window.setTimeout("any.debug.writeBuffer();", 100);
    };
}

/**
 * 엑셈엘
 *
 * @constructs xmlHttp
 */
xmlHttp = function () {
    var params = new Array();
    var datas = new Array();

    this.proxy = null;
    this.req = null;
    this.path = null;

    try {
        this.req = new ActiveXObject("MSXML2.XMLHTTP");
    } catch (ex) {
        try {
            this.req = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (ex) {
        }
    }
    if (!this.req && typeof (XMLHttpRequest) != null) {
        try {
            this.req = new XMLHttpRequest();
        } catch (ex) {
        }
    }
    if (!this.req && window.createRequest) {
        try {
            this.req = window.createRequest();
        } catch (ex) {
        }
    }

    this.addParam = function (sName, sValue) {
        if (sValue == null) return;

        params.push(sName + "=" + encodeURIComponent(sValue));
    };

    this.addData = function (vData, sId) {
        var data;

        if (typeof (vData) == "object") {
            data = vData;
        } else {
            data = document.getElementById(vData);
            if (data == null) {
                alert('Dataset [' + vData + '] is not valid.');
                return false;
            }
        }

        datas.push({ data: data, id: sId });

        return true;
    };

    /**
     * 센드
     *
     * @param async
     *
     * @memberOf xmlHttp#
     */
    send = function (async) {
        if (this.req == null) return;
        if (this.path == null) return;

        if (async == null) async = true;

        if (datas.length > 0) this.addParam("_DATA_SET_JSON_", '[' + getAllDataSetJSONString() + ']');

        try {

            this.req.open("POST", any.getServletPath(this.path), async);
            this.req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
            this.req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            this.req.send(params.join("&"));

        } catch (ex) {
            alert("[ERROR] any.xmlHttp.send\n\n" + ex);
        } finally {
        }

        function getAllDataSetJSONString() {
            if (datas.length == 0) return "";

            var jsons = [];

            for (var i = 0; i < datas.length; i++) {
                jsons.push(datas[i].data.jsonString(datas[i].id));
            }

            return jsons.join(",");
        }
    };

    this.error = function () {
        var req = this.req;

        for (var item in this.error) {
            this.error[item] = null;
        }

        this.error.show = function () {
            any.showError(this);
        };

        switch (req.status) {
            case 0:
            case 200:
                try {
                    var temp = eval("(" + req.responseText + ")");
                    for (var item in temp) {
                        this.error[item] = temp[item];
                    }
                    temp = null;
                } catch (ex) {
                }
                break;
            case 404:
                this.error.type = "sys";
                this.error.number = req.status;
                this.error.description = 'Page not found. => ' + this.path;
                break;
            default:
                this.error.type = "sys";
                this.error.number = req.status;
                this.error.description = req.statusText + ' => ' + this.path;
                break;
        }

        return (this.error.type != null);
    };
};


/**
 * 데이터 임포터
 */
dataImporter = function () {
    this.win = new any.window();
    this.win.path = "/ipms/com/dataimport/DataImportList.jsp";
    this.win.opt.width = 850;
    this.win.opt.height = 600;
    this.win.opt.resizable = "yes";
    this.loadAction = null;
    this.onBeforeLoad = null;
    this.saveAction = null;
    this.onBeforeSave = null;
    this.onReturn = null;

    this.execute = function () {
        this.win.arg.loadAction = this.loadAction;
        this.win.arg.onBeforeLoad = this.onBeforeLoad;
        this.win.arg.saveAction = this.saveAction;
        this.win.arg.onBeforeSave = this.onBeforeSave;
        this.win.onReturn = this.onReturn;
        this.win.show();
    };
};

/**
 * 엑셀 임포터
 */
excelImporter = function () {
    this.win = new any.window();
    this.win.path = "/ipms/com/dataimport/DataImportList.jsp";
    this.win.opt.width = 850;
    this.win.opt.height = 600;
    this.win.opt.resizable = "yes";
    this.templateFile = null;
    this.saveAction = null;
    this.onBeforeSave = null;
    this.onReturn = null;

    this.execute = function () {
        this.win.arg.templateFile = this.templateFile;
        this.win.arg.saveAction = this.saveAction;
        this.win.arg.onBeforeSave = this.onBeforeSave;
        this.win.arg.isExcel = true;
        this.win.onReturn = this.onReturn;
        this.win.show();
    };

    this.create = function (obj) {
        window.templateFile = this.templateFile;
        window.saveAction = this.saveAction;
        window.onBeforeSave = this.onBeforeSave;
        window.isExcel = true;

        obj.innerHTML = '<iframe name="' + obj.id + '_frame" src="' + listPath + '" frameBorder="0" style="width:100%; height:100%;" pageType="tabframe"></iframe>';
    };
};

/**
 * 리플레이스 로그인 페이지
 * @param noMsg
 *
 * @constructs replaceLoginPage
 */
replaceLoginPage = function (noMsg) {
    if (noMsg != true) alert("세션정보가 존재하지 않습니다.");

    if (top.location.pathname.indexOf("popup.jsp") == -1) {
        top.location.replace(top.getRoot() + "/anyfive/ipims/share/login/SessionOut.jsp");
        return;
    }

    // with (top.window.dialogArguments == null ? top.window.opener : top.window.dialogArguments.opener) {
    //     any.replaceLoginPage(true);
    //     focus();
    // }

    top.window.close();
}

/**
 * <SS> 이즈 팝업
 *
 * @returns {boolean|*}
 */
isPopup = function () {
    if (any.topPageType == "popup") return true;
    if (any.docPageType == "popup") return true;
    if (any.docPageType == "window") return true;

    if (parent == window || parent.any == any) return false;

    return parent.any.isPopup();
};



/**
 * 구 버전 테스트 1-1
 *
 * @module te02
 */
any1 = function () {
    /**
     * 구 버전 테스트 2-2
     *
     * @param {String} 구 버전 테스트 2-2
     * @returns {null|*} 구 버전 테스트 2-2
     *
     * @memberOf te02#
     */
    trim = function (sString) {
        if (sString == null) return null;

        return sString.replace(/(^\s*)|(\s*$)/g, "");
    }
};





















































// ---------------------------------------------------------------------------------------------------------------------


/**
 * any-jqgrid.js
 *
 * @constructs jqgrid
 */
jqgrid = function () {

    /**
     * jqgrid 엘리먼트
     *
     * @returns {*|jQuery}
     *
     * @memberOf jqgrid#
     */
    function element() {
        return o.$element;
    }

    /**
     * DS 값을 가져 옴(HTC 전용)
     *
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getDs() {
        return o.ds;
    }

    /**
     * 데이터 셋 초기화(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function initDataset() {
        if (o.$control.hasAttr("ds")) {
            o.ds = any.ds(o.$control.attr("ds"));
        } else if (control.id.indexOf("_") > 0) {
            o.ds = any.ds("ds_" + control.id.substr(control.id.indexOf("_") + 1));
        } else {
            o.ds = any.ds(control.id);
        }

        o.ds.listData(true);

        o.ds.dataLoader(function (data) {
            if (jQuery.type(data) === "object") {
                if ("totalCount" in data && "list" in data) {
                    this.loadData(data.list, true, {"_TOTAL_COUNT_": data.totalCount});
                } else {
                    this.loadData([data], true, data["_META_MAP"]);
                }
            } else if (jQuery.type(data) === "array") {
                this.loadData(data, true);
            }
        });

        o.ds.setBinder(function () {
            if (o.loader == null) {
                o.loader = {};
            }

            if (o.autoColumn === true) {
                reset(function () {
                    for (var i = 0, ii = o.ds.colCount(); i < ii; i++) {
                        this.addColumn({width: 200, sortable: true, name: o.ds.colId(i), label: o.ds.colId(i)});
                    }
                });
            }

            o.loader.result = {};

            resetPagingInfo(o.loader.result);

            if (o.options.pager == null) {
                o.$element.jqGrid("setGridParam", {rowNum: o.loader.result.records});
            }

            if (o.loader.result.records == 0) {
                o.$element.jqGrid("setCaption", any.message("any.grid.caption.noRecords").toString());
            } else if (o.options.pager == null) {
                o.$element.jqGrid("setCaption", any.message("any.grid.caption.countWithoutPage").arg(any.text.formatNumber(o.loader.result.records)).toString());
            } else {
                o.$element.jqGrid("setCaption", any.message("any.grid.caption.countWithPage").arg(any.text.formatNumber(o.loader.result.records), (o.loader.result.page - 1) * o.loader.postdata.rows + 1, Math.min(o.loader.result.page * o.loader.postdata.rows, o.loader.result.records)).toString());
            }

            o.loader.result.rows = [];
            o.rowData = {};

            if (o.treeGridInfo != null) {
                this.hierarchy(o.treeGridInfo.keyColumn, o.treeGridInfo.parentKeyColumn, o.treeGridInfo.levelColumn);

                if (o.treeGridInfo.rootName != null) {
                    var rowData = {};
                    rowData[o.treeGridInfo.keyColumn] = o.treeGridInfo.rootKey;
                    rowData[o.treeGridInfo.parentKeyColumn] = null;
                    rowData[o.treeGridInfo.expandColumn] = o.treeGridInfo.rootName;
                    rowData[o.treeGridInfo.levelColumn] = o.options.tree_root_level;
                    rowData[o.options.treeReader.leaf_field] = false;
                    rowData[o.options.treeReader.expanded_field] = function () {
                        if (o.treeGridInfo.expandLevel == null) {
                            return false;
                        }
                        if (o.treeGridInfo.expandLevel == -1) {
                            return true;
                        }
                        if (o.treeGridInfo.expandLevel >= o.options.tree_root_level) {
                            return true;
                        }
                        return false;
                    }();
                    o.rowData[o.treeGridInfo.rootKey] = rowData;
                    o.loader.result.rows.push(rowData);
                }
            }

            for (var i = 0, ii = this.rowCount(); i < ii; i++) {
                var rowId;
                if (o.treeGridInfo == null) {
                    rowId = i + 1;
                } else {
                    rowId = this.rowData(i)[o.treeGridInfo.keyColumn];
                }
                o.rowData[rowId] = this.rowData(i);
                o.rowData[rowId]["=JQGRID-ROW-ID="] = String(i + 1);
                var rowData = {};
                for (var item in o.rowData[rowId]) {
                    rowData[item] = o.rowData[rowId][item];
                }
                if (o.treeGridInfo != null) {
                    rowData[o.options.treeReader.leaf_field] = !this.hasChild(i);
                    rowData[o.options.treeReader.expanded_field] = function () {
                        if (o.treeGridInfo.expandLevel == null) {
                            return false;
                        }
                        if (o.treeGridInfo.expandLevel == -1) {
                            return true;
                        }
                        if (o.treeGridInfo.expandLevel >= Number(rowData[o.treeGridInfo.levelColumn])) {
                            return true;
                        }
                        return false;
                    }();
                }
                o.loader.result.rows.push(rowData);
            }

            if (o.options.pager == null) {
                o.$element.jqGrid("setGridParam", {datatype: "json", loadonce: true});
            }

            o.$element[0].addJSONData(o.loader.result);

            if (o.options.pager == null && o.treeGridInfo == null) {
                var sortorder = any.text.blank(o.$element.jqGrid("getGridParam", "sortorder"), "asc").toLowerCase();
                if (o.options.multiSort == true) {
                    o.$element.jqGrid("setGridParam", {
                        datatype: "local",
                        multiSort: true,
                        sortname: o.options.sortname
                    }).trigger("reloadGrid");
                    if (o.frozen.index != -1) {
                        o.$element.jqGrid("setFrozenColumns");
                        o.$control.find('div.ui-jqgrid-hdiv.frozen-div').not(':first').remove();
                        if (o.$contextMenu != null) {
                            o.$contextMenu.exec("attach", o.$control.find('div.ui-jqgrid-hdiv, div.ui-jqgrid-bdiv, div.ui-jqgrid-hdiv.frozen-div, div.ui-jqgrid-bdiv.frozen-bdiv'));
                        }
                    }
                } else {
                    o.$element.jqGrid("setGridParam", {
                        datatype: "local",
                        sortorder: sortorder == "asc" ? "desc" : "asc"
                    }).jqGrid("sortGrid");
                }
            }

            o.maxRowId = getDataTableRows().length;

            tableDnDUpdate();
            loadComplete();
            resizeAll();
        }, function () {
            stopEdit();

            if (o.options.rowEdit == true || o.options.cellEdit == true) {
                o.$element.jqGrid("saveRow", o.$element.jqGrid("getGridParam", "selrow"));
                if (o.rowData == null) {
                    o.rowData = {};
                }
                var rowIds = o.$element.jqGrid("getDataIDs");
                for (var i = 0, ii = rowIds.length; i < ii; i++) {
                    var rowId = rowIds[i];
                    var rowData = o.$element.jqGrid("getRowData", rowId);
                    if (o.rowData[rowId] == null) {
                        o.rowData[rowId] = o.ds.rowData(o.ds.addRow(rowData));
                    } else {
                        o.ds.rowData(o.ds.dataRow(o.rowData[rowId]), rowData, true);
                    }
                    o.rowData[rowId]["=JQGRID-ROW-ID="] = rowId;
                }
                for (var i = o.ds.rowCount() - 1, ii = 0; i >= ii; i--) {
                    var $tr = o.$element.find('tr[role="row"][id="' + o.ds.rowData(i)["=JQGRID-ROW-ID="] + '"].jqgrow');
                    if ($tr.length == 0 || $tr.data("isDeleted") == true) {
                        o.ds.deleteRow(i);
                    }
                }
            } else if (o.options.multiselect == true && o.selection != null) {
                o.ds.addColumn(o.selection.name);
                for (var rowId in o.rowData) {
                    o.rowData[rowId][o.selection.name] = o.selection.unselectValue;
                }
                var selRowIds = getSelectedRowIds();
                for (var i = 0, ii = selRowIds.length; i < ii; i++) {
                    o.rowData[selRowIds[i]][o.selection.name] = o.selection.selectValue;
                }
            }
        });
    }

    /**
     * 버튼 초기화(refresh, excel, filter, config)
     *
     * @memberOf jqgrid#
     */
    function initButtons() {
        o.buttons = {};

        addButton("refresh", {
            icon: "refresh",
            text: any.message("any.grid.button.reload.name"),
            title: any.message("any.grid.button.reload.title"),
            func: function () {
                if (o.loader != null && o.loader.reload != null) {
                    o.loader.reload();
                }
            },
            show: true
        });

        addButton("excel", {
            icon: "disk",
            text: any.message("any.grid.button.excel.name"),
            title: any.message("any.grid.button.excel.title"),
            func: function () {
                downloadExcel();
            },
            show: true
        });

        addButton("filter", {
            icon: "search",
            text: any.message("any.grid.button.filter.name"),
            title: any.message("any.grid.button.filter.title"),
            func: function () {
                toggleFilterToolbar();
                doFilter();
            },
            toggle: true,
            show: true
        });

        addButton("config", {
            icon: "gear",
            text: any.message("any.grid.button.config.name"),
            title: any.message("any.grid.button.config.title"),
            func: function () {
                doConfig();
            }
        });
    }

    /**
     * 포맷 형식(any-number, thousandsSeparator, any-timestamp, any-datetime, any-date, any-html)
     *
     * @memberOf jqgrid#
     */
    function initFormatters() {
        o.formatter = {};

        addFormatter("any-number", function (cellValue, options, rowObject) {
            var formatoptions = options.colModel.formatoptions;

            if (formatoptions == null) {
                formatoptions = {};
            }

            if ("thousandsSeparator" in formatoptions) {
                return any.text.formatNumber(o.formatter.getCellValue(options, cellValue), formatoptions.decimalPlaces, formatoptions.thousandsSeparator);
            }

            return any.text.formatNumber(o.formatter.getCellValue(options, cellValue), formatoptions.decimalPlaces);
        });

        addFormatter("any-timestamp", function (cellValue, options, rowObject) {
            return any.text.empty(any.date(o.formatter.getCellValue(options, cellValue)).toString(any.meta.dateFormat + " hh:ii:ss.lll"), any.text.nvl(cellValue, ""));
        });

        addFormatter("any-datetime", function (cellValue, options, rowObject) {
            return any.text.empty(any.date(o.formatter.getCellValue(options, cellValue)).toString(any.meta.dateFormat + " hh:ii:ss"), any.text.nvl(cellValue, ""));
        });

        addFormatter("any-date", function (cellValue, options, rowObject) {
            return any.text.empty(any.date(o.formatter.getCellValue(options, cellValue)).toString(any.meta.dateFormat), any.text.nvl(cellValue, ""));
        });

        addFormatter("any-html", function (cellValue, options, rowObject) {
            return any.text.toHTML(o.formatter.getCellValue(options, cellValue), true);
        });

        o.formatter.getCellValue = function (options, cellValue) {
            if (options.rowId == null || options.rowId == "") {
                return cellValue;
            }

            var rowData = getRowData(options.rowId);

            if (rowData == null) {
                return cellValue;
            }

            return rowData[options.colModel.name];
        };
    }

    /**
     * 코드 데이터 초기화(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function initCodeData() {
        var codeDataLoader = any.codedata();

        for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
            var option = o.options.colModel[i]["column-option"];
            if (option != null) {
                codeDataLoader.append(option.codeData);
            }
        }

        codeDataLoader.load();
    }

    /**
     * 테이블 엘리먼트 가져오기(내부 펑션)
     *
     * @returns {*|jQuery}
     *
     * @memberOf jqgrid#
     */
    function getTableElement() {
        return jQuery('<table>').attr("id", control.id + "_table").appendTo(o.$control);
    }

    /**
     * 그리드 활성화
     *
     * @param {Boolean} true or flase
     *
     * @memberOf jqgrid#
     */
    function activateGrid(fireEvent) {
        delete (o.$loadUI);

        o.$element.jqGrid(o.options).jqGrid("navGrid", "#" + o.options.pager, {
            edit: false,
            add: false,
            del: false,
            search: false,
            refresh: false
        }, {}, {}, {}, {multipleSearch: true});

        if (o.groupHeaders != null) {
            var groupHeaders = [];
            for (var i = 0, ii = o.groupHeaders.length; i < ii; i++) {
                var groupHeader = {
                    startColumnName: o.groupHeaders[i].start,
                    numberOfColumns: 0,
                    titleText: o.groupHeaders[i].label
                };
                for (var j = 0, jj = o.options.colModel.length; j < jj; j++) {
                    if (o.options.colModel[j].name == o.groupHeaders[i].start) {
                        groupHeader.numberOfColumns = 1;
                    } else if (groupHeader.numberOfColumns != 0) {
                        groupHeader.numberOfColumns++;
                    }
                    if (o.options.colModel[j].name == o.groupHeaders[i].end) {
                        break;
                    }
                }
                groupHeaders.push(groupHeader);
            }
            o.$element.jqGrid("setGroupHeaders", {useColSpanStyle: o.frozen.index == -1, groupHeaders: groupHeaders});
        }

        if (o.removeTitlebar == true) {
            o.$control.find('div.ui-jqgrid-titlebar').remove();
        } else {
            o.$control.find('div.ui-jqgrid-titlebar').css("padding-left", "8px").css("padding-right", "5px");
        }

        for (var name in o.buttons) {
            var spec = o.buttons[name];

            if (spec == null) {
                continue;
            }

            delete (spec.toggleActivated);

            spec.toggleButtonStyle = function () {
                if (this.toggleActivated === true) {
                    this.$button.addClass("ui-state-hover").css("padding", "0px");
                } else {
                    this.$button.removeClass("ui-state-hover").removeCss("padding");
                }
            };

            spec.toggleButton = function (isActivate, isClick) {
                if (this.toggle == true) {
                    if (isActivate == null) {
                        this.toggleActivated = (this.toggleActivated !== true);
                    } else {
                        if (this.toggleActivated === isActivate) {
                            return;
                        }
                        this.toggleActivated = isActivate;
                    }
                }

                if (isClick != true) {
                    this.toggleButtonStyle();
                }

                this.func.apply(this, [this.toggleActivated]);

                if (this.toggle == true) {
                    o.$control.fire("onButtonToggleAfter", [this.$button.attr("name"), this.toggleActivated]);
                }
            };

            if (o.$buttons == null) {
                o.$buttons = jQuery('<tr>').appendTo(jQuery('<tbody>').appendTo(jQuery('<table>').attr({
                    "border": "0",
                    "cellspacing": "0",
                    "cellpadding": "0"
                }).addClass("ui-pg-table navtable").css({
                    "table-layout": "auto",
                    "float": "right"
                }).appendTo(o.$control.find('div.ui-jqgrid-titlebar'))));
            }

            spec.$button = jQuery('<td>').attr({
                "name": name,
                "title": any.text.nvl(spec.title, spec.text)
            }).addClass("ui-pg-button ui-corner-all").css("cursor", "pointer").showHide(spec.show).appendTo(o.$buttons);
            spec.$button.append(jQuery('<div>').addClass("ui-pg-div").css("margin-right", "3px").append(jQuery('<span>').addClass("ui-icon ui-icon-" + spec.icon)).append(jQuery('<span>').css("margin-top", "2px").text(spec.text)));

            spec.$button.on("mouseover", function () {
                jQuery(this).addClass("ui-state-hover");
            });

            spec.$button.on("click", function () {
                o.buttons[jQuery(this).attr("name")].toggleButton(null, true);
            });

            spec.$button.on("mouseout", function () {
                o.buttons[jQuery(this).attr("name")].toggleButtonStyle();
            });
        }

        if (o.buttons["filter"].show === true) {
            o.$element.jqGrid("filterToolbar", {stringResult: true, searchOnEnter: false, autosearch: false});
        }

        if (o.frozen.index != -1) {
            if (o.options.cellEdit == true) {
                o.$element.jqGrid("setGridParam", {cellEdit: false});
                o.$element.jqGrid("setFrozenColumns");
                o.$element.jqGrid("setGridParam", {cellEdit: o.options.cellEdit});
            } else {
                o.$element.jqGrid("setFrozenColumns");
            }
            o.$control.find('div.ui-jqgrid-hdiv.frozen-div').children('table.ui-jqgrid-htable').find('th').css("white-space", "nowrap");
            o.$frozenSearchToolbarTr = o.$control.find('div.ui-jqgrid-hdiv.frozen-div').css("overflow-y", "hidden").find('tr.ui-search-toolbar');
            o.$frozenSearchToolbarDummy = jQuery('<tr>').addClass("ui-search-toolbar").append(jQuery('<th>').attr("colspan", o.$frozenSearchToolbarTr.children('th').length));
            o.$frozenSearchToolbarTr.after(o.$frozenSearchToolbarDummy);
        }

        if (o.buttons["filter"].show === true) {
            o.$control.find('tr.ui-search-toolbar').find('input:text').enter(function () {
                doFilter();
            });
            o.$control.find('tr.ui-search-toolbar').find('td.ui-search-clear').children('a').click(function () {
                doFilter();
            });
            toggleFilterToolbar();
        }

        appendFrozenGroupHeaderDummyTh();

        if (o.$contextMenu != null) {
            o.$contextMenu.remove();
        }

        if (o.removeContextMenu != true && o.options.rowEdit != true && o.options.cellEdit != true) {
            o.$contextMenu = jQuery('<div>').control("any-contextmenu", function () {
                this.setDynamic(function () {
                    if (o.clipboardText != null && o.clipboardText != "") {
                        this.addMenu(any.message("any.grid.button.copyCell.title", "Copy Cell") + " : " + (o.clipboardText.length > 30 ? o.clipboardText.substr(0, 30) + "..." : o.clipboardText));
                        this.addSeparator();
                    }
                    if (o.buttons["refresh"].show === true) {
                        this.addMenu(any.message("any.grid.button.reload.title", "Reload"), function (menuItem, menu) {
                            o.loader.reload();
                        }, {disabled: o.loader == null || o.loader.prx == null});
                    }
                    if (o.buttons["excel"].show === true) {
                        this.addMenu(any.message("any.grid.button.excel.title", "Excel Download"), function (menuItem, menu) {
                            downloadExcel();
                        }, {disabled: o.loader == null || o.loader.prx == null});
                    }
                    if (o.buttons["config"].show === true) {
                        this.addSeparator();
                        this.addMenu(any.message("any.grid.button.config.title", "Configuration"), function (menuItem, menu) {
                            doConfig();
                        });
                    }
                });
                this.setOption("theme", "vista");
                this.setOption("beforeShow", function (target, e) {
                    jQuery('div.context-menu').closest('table').remove();
                    if (typeof (window.Clipboard) === "function") {
                        try {
                            delete (o.clipboardText);
                            var event = (e == null ? window.event : e);
                            if (event != null && event.target != null) {
                                var $target = jQuery(event.target);
                                if (!($target.tag() == "DIV" && ($target.hasClass("ui-jqgrid-hdiv") == true || $target.hasClass("ui-jqgrid-bdiv") == true))) {
                                    o.clipboardText = event.target.innerText;
                                }
                            }
                        } catch (e) {
                            delete (o.clipboardText);
                        }
                    }
                    return true;
                });
                this.attach(o.$control.find('div.ui-jqgrid-hdiv, div.ui-jqgrid-bdiv'));
            }).appendTo(document.body);

            if (o.contextMenuClipboard == null && typeof (window.Clipboard) === "function") {
                o.contextMenuClipboard = new Clipboard('.context-menu-item-inner', {
                    triggerListen: "mousedown",
                    text: function (trigger) {
                        var clipboardText = any.text.replaceAll(o.clipboardText, "\u00A0", " ");
                        delete (o.clipboardText);
                        return clipboardText;
                    }
                });
            }
        }

        resetDummyDataDiv();

        if (o.headerRowHeight != null) {
            setHeaderRowHeight(o.headerRowHeight);
        }

        if (fireEvent === true) {
            o.$control.fire("onGridActivated");
        }
    }

    /**
     * 토글 형식의 필터 툴바
     *
     * @memberOf jqgrid#
     */
    function toggleFilterToolbar() {
        if (o.$element[0].toggleToolbar == null) {
            return;
        }

        var $toolbar = o.$control.find('tr.ui-search-toolbar').not(o.$frozenSearchToolbarDummy);

        if ($toolbar == null || $toolbar.length == 0) {
            return;
        }

        if (o.buttons["filter"].toggleActivated == $toolbar.is(':visible')) {
            return;
        }

        o.$element[0].toggleToolbar();

        if (o.buttons["filter"].toggleActivated != $toolbar.is(':visible')) {
            o.buttons["filter"].toggleActivated = ($toolbar.is(':visible') == true);
            o.buttons["filter"].toggleButtonStyle();
        }

        if (o.$frozenSearchToolbarDummy != null) {
            o.$frozenSearchToolbarDummy.show();
        }

        if (o.$element[0].grid.fhDiv != null) {
            jQuery(o.$element[0].grid.fhDiv).css(jQuery(o.$element[0].grid.hDiv).position());
        }

        if (o.$element[0].grid.fbDiv != null) {
            jQuery(o.$element[0].grid.fbDiv).css(jQuery(o.$element[0].grid.bDiv).position());
        }

        resizeHeight();
    }

    /**
     * jqrid 엘리먼트 초기화
     *
     * @param {function} func
     * @param {Boolean} check
     * @param {callback} callback
     * @param {function} addon
     *
     * @memberOf jqgrid#
     */
    function reset(func, check, callback, addon) {
        if (typeof (check) === "function") {
            if (check.apply(control) !== true) {
                if (typeof (callback) === "function") {
                    callback();
                }
                return;
            }
        }

        o.sortings = [];
        o.actions = {};

        o.options.colModel = [];
        o.options.grouping = false;

        delete (o.options.sortname);
        delete (o.options.sortorder);
        delete (o.options.multiselect);
        delete (o.options.groupingView);
        delete (o.options.footerrow);
        delete (o.actionClassIndex);
        delete (o.tableDnD);

        o.$element.jqGrid("GridDestroy");
        o.$element = getTableElement();

        o.$buttons.remove();
        o.$buttons = null;

        delete (resetConfig.executed);

        if (typeof (func) === "function") {
            func.apply(control);

            o.defaultColModel = any.object.clone(o.options.colModel);
            o.defaultSortings = any.object.clone(o.sortings);

            if (o.configInfo != null && o.configInfo.ds != null && o.configInfo.ds.column != null) {
                for (var i = 0, ii = o.configInfo.ds.column.rowCount(); i < ii; i++) {
                    if (o.configInfo.ds.column.value(i, "SHOW") != "1") {
                        var colModel = getColModel(o.configInfo.ds.column.value(i, "NAME"))

                        if (colModel != null) {
                            colModel.hidden = true;
                        }
                    }
                }
            }

            o.$control.fire("onResetFunctionAfter");
        }

        activateGrid();

        if (typeof (func) === "function") {
            o.$control.fire("onResetGridActivated");
        }

        resizeHeight();

        if (o.buttons["config"].show === true && typeof (func) === "function" && resetConfig.executed == null) {
            resetConfig(function () {
                if (typeof (addon) === "function") {
                    return addon.apply(control);
                }
            }(), callback);
        } else if (typeof (callback) === "function") {
            callback();
        }
    }

    /**
     * jqrid 엘리먼트 초기화2 (사용 부분 없음)
     *
     * @param {function} func
     * @returns {{}}
     *
     * @memberOf jqgrid#
     */
    function reset2(func) {
        var f = {};
        var o = {func: func};

        f.executeCheck = function (check) {
            o.check = check;

            return f;
        };

        f.callback = function (callback) {
            o.callback = callback;

            return f;
        };

        f.configAddonPath = function (addon) {
            o.addon = addon;

            return f;
        };

        f.execute = function () {
            reset(o.func, o.check, o.callback, o.addon);
        };

        return f;
    }

    /**
     * 모두 리사이즈(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function resizeAll() {
        window.setTimeout(function () {
            jQuery('div[any-container=""]').parent('div').css("overflow-x", "hidden");

            resizeWidth();
            resizeHeight();

            o.$control.fire("onResizeAll");
        });
    }

    /**
     * 폭 리사이즈(내부 펑션)
     *
     * @param {boolean} force
     * @returns {resizeWidth}
     *
     * @memberOf jqgrid#
     */
    function resizeWidth(force) {
        if (o.$control.width() == 0) {
            return;
        }

        var $gbox = o.$control.find('div#gbox_' + control.id + '_table');
        var $gview = o.$control.find('div#gview_' + control.id + '_table');

        if ($gbox.width() == 0) {
            $gbox.width("");
        }
        if ($gview.width() == 0) {
            $gview.width("");
        }

        var controlWidth = o.$control.innerWidth();

        if (force != true && controlWidth == o.controlWidth) {
            return this;
        }

        var $gbox = o.$control.children('div#gbox_' + control.id + '_table');

        o.$element.jqGrid("setGridWidth", controlWidth - ($gbox.outerWidth(true) - $gbox.width()));

        o.controlWidth = controlWidth;
    }

    /**
     * 높이 리사이즈(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function resizeHeight() {
        if (o.options.height == "auto" || o.options.height == "100%") {
            return;
        }

        if (o.$control.height() == 0) {
            return;
        }

        var titlebarHeight = any.object.nvl(o.$control.find('div.ui-jqgrid-titlebar').outerHeight(true), 0);
        var hdivHeight = any.object.nvl(o.$control.find('div.ui-jqgrid-hdiv').outerHeight(true), 0);
        var sdivHeight = any.object.nvl(o.$control.find('div.ui-jqgrid-sdiv').outerHeight(true), 0);
        var pagerHeight = any.object.nvl(o.$control.find('div.ui-jqgrid-pager').outerHeight(true), 0);
        var $gbox = o.$control.children('div#gbox_' + control.id + '_table');

        o.$element.jqGrid("setGridHeight", o.$control.height() - titlebarHeight - hdivHeight - sdivHeight - pagerHeight - ($gbox.outerHeight(true) - $gbox.height()));

        if (o.frozen.correctTableHeight == true) {
            o.$control.find('div.ui-jqgrid-hdiv.frozen-div').css({"top": titlebarHeight, "height": ""});
            o.$control.find('div.ui-jqgrid-bdiv.frozen-bdiv').css({"top": titlebarHeight + hdivHeight});
        }
    }

    /**
     * 타이틀 바 제거(WEB-INF/jsp/common/grid/GridConfig.jsp:303)
     *
     * @memberOf jqgrid#
     */
    function removeTitlebar() {
        o.removeTitlebar = true;

        var $titlebar = o.$control.find('div.ui-jqgrid-titlebar');

        if ($titlebar.length > 0) {
            $titlebar.remove();
            resizeHeight();
        }
    }

    /**
     * 컨텍스트 메뉴 제거(WEB-INF/jsp/common/grid/GridConfig.jsp:256)
     * 
     * @memberOf jqgrid#
     */
    function removeContextMenu() {
        o.removeContextMenu = true;
    }

    /**
     * 옵션 가져오기(내부 펑션)
     *
     * @param name
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getOption(name) {
        return o.options[name];
    }

    /**
     * 옵션 설정하기(dsGrid, jqGrid 동일 이름)
     * shrinkToFit 이 옵션은 jqgrid width부분 조정해주는 옵션.
     * 옵션이 true이거나 없는 경우에는 grid의 widht가 자동으로 조정이 됨.
     *
     * @memberOf jqgrid# 
     */
    function setOption() {
        any.copyArguments(o.options, arguments);
    }

    /**
     * 구성 요소 추가 이벤트(beforeSelectRow, beforeSaveCell)
     * 
     * @param {string} key
     * @param {function} func
     * 
     * @memberOf jqgrid#
     */
    function addElementEvent(key, func) {
        func.origin = o.options[key];

        o.options[key] = function () {
            if (func.origin != null) {
                func.origin.apply(this, arguments);
            }

            func.apply(this, arguments);
        };
    }

    /**
     * 그룹 헤더 추가(dsGrid, jqGrid 동일 이름)
     *
     * @param {Object} obj
     *
     * @memberOf jqgrid#
     */
    function addGroupHeader(obj) {
        if (o.groupHeaders == null) {
            o.groupHeaders = [];
        }

        o.groupHeaders.push(obj);
    }

    /**
     * 컬럼 추가(dsGrid, jqGrid 동일 이름)
     * 
     * @param {object} model
     * @param {} option
     *
     * @memberOf jqgrid#
     */
    function addColumn(model, option) {
        if (model.sorttype == null && (model.formatter == "number" || model.formatter == "any-number")) {
            model.sorttype = "number";
        }

        if (typeof (model.formatter) === "string") {
            model["formatter-name"] = model.formatter;

            var formatter = o.formatter[model.formatter];

            if (formatter != null) {
                if (formatter.formatter != null) {
                    model.formatter = formatter.formatter;
                }
                if (formatter.unformat != null) {
                    model.unformat = formatter.unformat;
                }
            }
        }

        model["column-option"] = option;

        if (option != null && option.codeData != null) {
            if (model.formatter == null) {
                model.formatter = function (cellValue, options, rowObject) {
                    return any.codedata().name(options.colModel["column-option"].codeData, cellValue);
                };
            }
            if (model.editoptions == null) {
                var codeData = any.codedata().get(option.codeData);
                var values = [];
                if (option.firstName != null) {
                    values.push(":" + any.codedata.getFirstName(option.firstName));
                }
                for (var i = 0, ii = codeData.data.length; i < ii; i++) {
                    values.push(codeData.data[i].data.CODE + ":" + codeData.data[i].data.NAME);
                }
                model.editoptions = {value: values.join(";")};
            }
        }

        if (model.label != null) {
            model.label = model.label + "";
        }

        if (option == null || option.unused !== true) {
            o.options.colModel.push(model);
        } else {
            if (o.unusedModel == null) {
                o.unusedModel = {};
            }
            o.unusedModel[model.name] = model;
        }
    }

    /**
     * 컬럼 모달 호출
     *
     * @param {string} colName
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getColModel(colName) {
        for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
            if (o.options.colModel[i].name == colName) {
                return o.options.colModel[i];
            }
        }
    }

    /**
     * 포맷 형식 추가
     * 
     * @param {string} name
     * @param {function} formatter
     * @param {function} unformat
     *
     * @memberOf jqgrid#
     */
    function addFormatter(name, formatter, unformat) {
        o.formatter[name] = {formatter: formatter, unformat: unformat};

        if (o.options.colModel == null) {
            return;
        }

        for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
            if (o.options.colModel[i].formatter == name) {
                setFormatter(o.options.colModel[i].name, formatter, unformat);
            }
        }
    }

    /**
     * 포맷 형식 세팅(dsGrid, jqGrid 동일 이름)
     *
     * @param {string} colName
     * @param {function} formatter
     * @param {setFormatter} unformat
     *
     * @memberOf jqgrid#
     */
    function setFormatter(colName, formatter, unformat) {
        var model = getColModel(colName);

        if (model == null) {
            return;
        }

        model.formatter = formatter;

        if (unformat != null) {
            model.unformat = unformat;
        }
    }

    /**
     * 숨겨진 컬럼 보이기
     * 
     * @param {string} colName
     * @param {boolean} showHide
     *
     * @memberOf jqgrid#
     */
    function showHideCol(colName, showHide) {
        o.$element.jqGrid(showHide == true ? "showCol" : "hideCol", colName);

        resizeWidth(true);
    }

    /**
     * 선택 설정
     *
     * @param {string} name
     * @param {Object} selectValue
     * @param {Object} unselectValue
     *
     * @memberOf jqgrid#
     */
    function setSelection(name, selectValue, unselectValue) {
        o.selection = {name: name};

        if (selectValue == null) {
            o.selection.selectValue = any["boolean"](o.config("booleanValues")).trueValue();
        } else {
            o.selection.selectValue = selectValue;
        }

        if (unselectValue == null) {
            o.selection.unselectValue = any["boolean"](o.config("booleanValues")).falseValue();
        } else {
            o.selection.unselectValue = unselectValue;
        }
    }

    /**
     * 데이터 다중 선택
     *
     * @param {function} func
     * @param {function} linkSelection
     *
     * @memberOf jqgrid#
     */
    function setMultiSelect(func, linkSelection) {
        o.options.multiselect = true;
        o.multiSelectFunction = func;

        if (o.options.cellEdit == true) {
            return;
        }

        if (o.multiSelectOnBeforeSelectRowAdded == true) {
            return;
        }

        o.multiSelectOnBeforeSelectRowAdded = true;

        addElementEvent("beforeSelectRow", function (rowId, event) {
            if (o.options.multiselect != true) {
                o.$element.jqGrid("setSelection", rowId);
                return true;
            }

            var $src = jQuery(event.srcElement || event.target);

            if (!($src.tag() == "INPUT" && $src.attr("role") == "checkbox" && $src.hasClass("cbox") == true)) {
                $src = $src.closest('td');
            }

            var qry = 'input[role="checkbox"].cbox:enabled';

            if (o.config("multiselect.checkboxOnly") === true && $src.closest('td').children(qry).length == 0) {
                if (linkSelection !== true || $src.data("linkActionEnable") !== true) {
                    return;
                }
            }

            if ($src.data("linkActionEnable") === true) {
                if (linkSelection !== true) {
                    return;
                }
                if (event.ctrlKey === true) {
                    if (jQuery.inArray(rowId, getSelectedRowIds()) != -1) {
                        o.$element.jqGrid("setSelection", rowId);
                    }
                } else if (event.altKey !== true) {
                    o.$element.jqGrid("resetSelection");
                }
            }

            if (o.rowAction != null && $src.children(qry).length == 0 && $src.is(qry) != true) {
                return;
            }

            if (getDataTableRow(rowId).find(qry).length > 0) {
                o.$element.jqGrid("setSelection", rowId);
            }
        });
    }

    /**
     * 그룹 세팅(미 사용)
     * 
     * @param {Object} groupingView
     * @param {Object} options
     *
     * @memberOf jqgrid#
     */
    function setGrouping(groupingView, options) {
        if (options != null && options.checkbox == true) {
            groupingView.groupText[0] = '<input type="checkbox" style="vertical-align:middle;">&nbsp;' + groupingView.groupText[0];
        }

        setOption({grouping: true, groupingView: groupingView});
    }

    /**
     * 선택한 데이터를 그룹핑
     *
     * @param {Array} colNames
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getGroupingSelectedData(colNames) {
        var ds = any.ds("ds_" + control.id + "_groupingSelected").dataOnly(true).init();

        o.$control.find('table#' + control.id + '_table').find('tr.jqgroup > td > input:checkbox').each(function () {
            if (this.checked != true) {
                return true;
            }
            var row = ds.addRow();
            for (var i = 0, ii = colNames.length; i < ii; i++) {
                ds.value(row, colNames[i], getValue(jQuery(this).parent().parent().next().attr("id"), colNames[i]));
            }
        });

        return ds;
    }

    /**
     * 해당 컬럼 불능화 - disabled
     * 
     * @param {string} name
     * @param {Number} correctTableHeight
     *
     * @memberOf jqgrid#
     */
    function setFrozen(name, correctTableHeight) {
        o.frozen.name = name;

        for (var i = 0; i < o.options.colModel.length; i++) {
            if (o.options.colModel[i].name == name) {
                o.frozen.index = i;
                break;
            }
        }

        for (var i = 0; i <= o.frozen.index; i++) {
            o.options.colModel[i].frozen = true;
        }

        if (correctTableHeight != null) {
            o.frozen.correctTableHeight = correctTableHeight;
        }
    }

    /**
     * 페이징 기능
     * 
     * @param {Array} rowList
     * @param {Number} rowNum
     *
     * @memberOf jqgrid#
     */
    function setPaging(rowList, rowNum) {
        if (o.options.treeGrid == true) {
            return;
        }

        o.options.pager = jQuery('<div>').attr("id", control.id + "_pager").appendTo(o.$control).attr("id");
        o.options.rowList = (rowList == null ? any.object.nvl(o.config("paging.rowList"), [20, 50, 100, 150, 200]) : rowList);
        o.options.rowNum = (rowNum == null ? any.object.nvl(o.config("paging.rowNum"), 50) : rowNum);
    }

    /**
     * 페이징 페이지 리셋(미사용)
     *
     * @param {Object} obj
     * @param {Object} ds
     *
     * @memberOf jqgrid#
     */
    function resetPagingInfo(obj, ds) {
        if (ds == null) {
            ds = o.ds;
        }

        if (o.options.pager == null) {
            obj.records = ds.rowCount();
        } else {
            obj.records = getTotalCount(ds);
            obj.total = Math.max(parseInt((obj.records - 1) / o.loader.postdata.rows + 1, 10), 1);
            obj.page = o.loader.postdata.page;
        }
    }

    /**
     * 정렬 기능(jqGrid, dsGridHTC 동일 이름)
     *
     * @param {String} name
     * @param {String} order
     *
     * @memberOf jqgrid#
     */
    function addSorting(name, order) {
        o.sortings.push({name: name, order: order});

        if (o.options.multiSort == true) {
            var sortnames = [];
            for (var i = 0, ii = o.sortings.length; i < ii; i++) {
                sortnames.push(o.sortings[i].name + " " + o.sortings[i].order.toLowerCase());
            }
            o.options.sortname = sortnames.join(", ");
            o.options.sortorder = order;
        } else if (o.sortings.length == 1) {
            o.options.sortname = name;
            o.options.sortorder = order;
        }
    }

    /**
     * disabled된 그룹 헤더에 더미 더하기(내부 펑션)
     * 
     * @memberOf jqgrid#
     */
    function appendFrozenGroupHeaderDummyTh() {
        if (o.frozen.index == -1) {
            return;
        }
        if (o.groupHeaders == null) {
            return;
        }

        o.$control.find('div.ui-jqgrid-hdiv.frozen-div').css("overflow-x", "hidden").children('table.ui-jqgrid-htable').find('tr[role="rowheader"]').not('.ui-search-toolbar').each(function () {
            if (jQuery(this).children('th[role="rowspan-dummy"]').length == 0) {
                jQuery('<th role="rowspan-dummy">').appendTo(this);
            }
        });
    }

    /**
     * disabled된 로우에 더미 더하기(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function appendFrozenRowspanDummyTd() {
        if (o.frozen.index == -1) {
            return;
        }
        if (o.rowspan == null) {
            return;
        }

        o.$control.find('div.ui-jqgrid-bdiv.frozen-bdiv').css("overflow-x", "hidden").children('table.ui-jqgrid-btable').find('tr[role="row"].jqgrow').each(function () {
            if (jQuery(this).children('td[role="rowspan-dummy"]').length == 0) {
                jQuery('<td role="rowspan-dummy">').appendTo(this);
            }
        });
    }

    /**
     * 아래로 로우 합치기 설정
     * 
     * @param {Array} arg1
     * @param {Array} arg2
     * @param {Array} arg3
     *
     * @memberOf jqgrid#
     */
    function setRowspan(arg1, arg2, arg3) {
        if (arguments.length >= 2 && typeof (arguments[0]) === "string" && typeof (arguments[1]) === "string") {
            o.rowspan = {columns: [], restrict: arg3};

            for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
                if (o.options.colModel[i].name == arg1 || o.rowspan.columns.length > 0) {
                    o.rowspan.columns.push(o.options.colModel[i].name);
                    if (o.rowspan.columns.length > 0 && o.options.colModel[i].name == arg2) {
                        break;
                    }
                }
            }
        } else {
            o.rowspan = {columns: arg1, restrict: arg2};
        }
    }

    /**
     * 로우 스팬 적용(내부 펑션)
     *
     * @param afterFilter
     *
     * @memberOf jqgrid#
     */
    function applyRowspan(afterFilter) {
        if (o.rowspan == null) {
            return;
        }

        if (afterFilter == true) {
            for (var c = 0, cc = o.rowspan.columns.length; c < cc; c++) {
                var elemId = control.id + "_table_" + o.rowspan.columns[c];

                if (o.$control.find('div.ui-jqgrid-hbox table.ui-jqgrid-htable th[role="columnheader"]#' + elemId).is(':visible')) {
                    o.$control.find('div.ui-jqgrid-bdiv table.ui-jqgrid-btable td[role="gridcell"][aria-describedby="' + elemId + '"]').removeAttr("rowspan").show();
                }
            }
        }

        appendFrozenRowspanDummyTd();

        var $rows = getDataTableRows(true);

        for (var c = 0, cc = o.rowspan.columns.length; c < cc; c++) {
            var spanrow = 0;
            var spannum = 1;
            var firstRow = true;

            for (var r = 0, rr = $rows.length; r < rr; r++) {
                if (afterFilter == true && $rows.eq(r).css("display") == "none") {
                    continue;
                }

                var $td = $getTd(r, o.rowspan.columns[c]);
                var $prevTd;

                if (o.frozen.index != -1 && $td.closest('table')[0] != $getTd(spanrow, o.rowspan.columns[c]).closest('table')[0]) {
                    firstRow = true;
                }

                if (c > 0 && o.rowspan.restrict == true) {
                    $prevTd = $getTd(r, o.rowspan.columns[c - 1]);
                }

                if ($prevTd != null && $prevTd.attr("rowspan") == 1) {
                    $td.attr("rowspan", 1);
                } else {
                    if (firstRow != true && $td.text() == $getTd(spanrow, o.rowspan.columns[c]).text() && ($prevTd == null || $prevTd.attr("rowspan") == null)) {
                        $td.hide();
                        spannum++;
                    } else {
                        $getTd(spanrow, o.rowspan.columns[c]).attr("rowspan", spannum);
                        spanrow = r;
                        spannum = 1;
                    }
                }

                firstRow = false;
            }

            $getTd(spanrow, o.rowspan.columns[c]).attr("rowspan", spannum);
        }

        function $getTd(row, colName) {
            return $rows.eq(row).children('td[role="gridcell"][aria-describedby="' + control.id + '_table_' + colName + '"]');
        }
    }

    /**
     * 합계 세팅
     * 
     * @param {String} label
     * @param {String} css
     *
     * @memberOf jqgrid#
     */
    function setSummary(label, css) {
        o.options.footerrow = true;
        o.summary = {label: label, css: css};

        addElementEvent("beforeSaveCell", function (rowid, cellname, value, iRow, iCol) {
            resetSummaryData(cellname, value);
        });
    }

    /**
     * 리셋 합계 라벨
     * 
     * @memberOf jqgrid#
     */
    function resetSummaryLabel() {
        if (o.summary == null) {
            return;
        }

        var $fTableCells = o.$control.find('div.ui-jqgrid-sdiv table.ui-jqgrid-ftable td[role="gridcell"]');
        var $labelCell;

        $fTableCells.each(function () {
            var $this = jQuery(this);
            var colName = $this.attr("aria-describedby").replace(control.id + "_table_", "");
            var colModel = getColModel(colName);

            if (colModel == null) {
                return true;
            }

            if (colModel.summaryType != null && colModel.summaryTpl == null) {
                return false;
            }

            if (colModel.hidden != true) {
                $labelCell = $this;
            }
        });

        if ($labelCell == null) {
            return;
        }

        for (var i = $labelCell.index(); i < $fTableCells.length; i++) {
            var $this = $fTableCells.eq(i);
            var colName = $this.attr("aria-describedby").replace(control.id + "_table_", "");
            var colModel = getColModel(colName);

            if (colModel.summaryType == null) {
                $this.empty().removeAttr("title");
            }
        }

        jQuery('<div>').text(o.summary.label).attr({"title": o.summary.label}).css({
            "float": "right",
            "padding-right": "2px"
        }).appendTo($labelCell.empty());

        $labelCell.attr({"title": o.summary.label}).css({"overflow": "visible"}).prevAll().each(function () {
            var $this = jQuery(this).empty().removeAttr("title").css("border-right", "transparent");

            if ($this.is(':first-child') != true) {
                $this.css("border-left", "transparent");
            }
        });

        if (o.summary.css != null) {
            if (o.summary.css.row != null) {
                $fTableCells.css(o.summary.css.row);
            }
            if (o.summary.css.label != null) {
                $labelCell.css(o.summary.css.label);
            }
        }
    }

    /**
     * 리셋 합계 데이터 
     * 
     * @param {String} name
     * @param {String} value
     *
     * @memberOf jqgrid#
     */
    function resetSummaryData(name, value) {
        if (o.summary == null) {
            return;
        }

        value = any.text.replaceAll(value, ",", "");

        var footerData = {};

        for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
            if (o.options.colModel[i].summaryType == null) {
                continue;
            }
            if (name != null && name != o.options.colModel[i].name) {
                continue;
            }
            footerData[o.options.colModel[i].name] = function (colModel) {
                var colValues = o.$element.jqGrid("getCol", colModel.name);
                var sumValue = (value == null || value == "" || isNaN(value) ? 0 : Number(value));
                var avgCount = 0;
                for (var i = 0, ii = colValues.length; i < ii; i++) {
                    var colValue = any.text.replaceAll(colValues[i], ",", "");
                    if (colValue == null || colValue == "" || isNaN(colValue)) {
                        continue;
                    }
                    sumValue += Number(colValue);
                    avgCount++;
                }
                switch (colModel.summaryType) {
                    case "sum":
                        return sumValue;
                    case "avg":
                        return avgCount == 0 ? null : sumValue / avgCount;
                    case "avg2":
                        return colValues.length == 0 ? null : sumValue / colValues.length;
                }
            }(o.options.colModel[i]);
        }

        o.$element.jqGrid("footerData", "set", footerData);
    }

    /**
     * 트리 그리드 세팅
     *
     * @param {Object} obj
     *
     * @memberOf jqgrid#
     */
    function setTreeGrid(obj) {
        delete (o.options.pager);
        delete (o.options.rowList);
        delete (o.options.rowNum);

        o.treeGridInfo = obj;

        o.options.treeGrid = true;
        o.options.treeGridModel = "adjacency";

        if (o.options.rownumbers == true) {
            for (var i = 0, ii = o.options.colModel.length - 1; i < ii; i++) {
                if (o.options.colModel[i].name == obj.expandColumn) {
                    o.options.ExpandColumn = o.options.colModel[i + 1].name;
                    break;
                }
            }
            if (o.options.ExpandColumn == null) {
                o.options.ExpandColumn = obj.expandColumn;
            }
        } else {
            o.options.ExpandColumn = obj.expandColumn;
        }

        if (o.options.tree_root_level == null) {
            o.options.tree_root_level = 0;
        }

        o.options.treeReader = {};
        o.options.treeReader.parent_id_field = obj.parentKeyColumn;
        o.options.treeReader.level_field = obj.levelColumn;
        o.options.treeReader.leaf_field = "=JQGRID-TREE-LEAF=";
        o.options.treeReader.expanded_field = "=JQGRID-TREE-EXPANDED=";
    }

    /**
     * 버튼 세팅(config, refresh, excel)
     *
     * @param {Object} obj
     *
     * @memberOf jqgrid#
     */
    function setButton(obj) {
        for (var name in obj) {
            if (o.buttons[name] != null) {
                o.buttons[name].show = obj[name];
            }

            if (o.$buttons != null) {
                o.$buttons.children('td[name="' + name + '"]').showHide(obj[name]);
            }

            if (name == "filter") {
                window.setTimeout(function () {
                    doFilter();
                });
            }
        }
    }

    /**
     * 버튼 추가(내부 펑션) from function initButtons() { (dsGridHTC, jqGrid 동일 이름)
     * 
     * @param {String} name
     * @param {Object} spec
     * 
     * @memberOf jqgrid#
     */
    function addButton(name, spec) {
        o.buttons[name] = spec;
    }

    /**
     * 버튼 가져오기
     * 
     * @param name
     * @param elem
     * @returns {null|*}
     *
     * @memberOf jqgrid#
     */
    function getButton(name, elem) {
        var spec = o.buttons[name];

        if (elem === true) {
            return spec == null ? null : spec.$button;
        }

        return spec;
    }

    /**
     * 로우 클릭 시 실행할 액션 추가
     * 
     * @param {String} colName
     * @param {function} action
     * @param {boolean} check
     * @param {Object} css
     * @param {Object} summary
     *
     * @memberOf jqgrid#
     */
    function addAction(colName, action, check, css, summary) {
        if (jQuery.type(colName) === "array") {
            for (var i = 0, ii = colName.length; i < ii; i++) {
                addAction(colName[i], action, check, css, summary);
            }
            return;
        }

        if (typeof (action) === "object") {
            o.actions[colName] = action;
        } else {
            o.actions[colName] = {action: action, check: check, summary: summary};
        }

        if (css == null) {
            var linkActions = o.config("link.actions");

            if (linkActions != null) {
                if (o.actionClassIndex == null) {
                    o.actionClassIndex = 0;
                }
                o.actions[colName].className = linkActions[o.actionClassIndex % linkActions.length];
                o.actionClassIndex++;
            }
        } else {
            if (typeof (css) === "string") {
                o.actions[colName].className = css;
            } else if (typeof (css) === "object") {
                o.actions[colName].css = css;
            }
        }
    }

    /**
     * 액션 삭제(dsGridHTC, jqGrid 동일 이름)
     *
     * @param {String} colName
     *
     * @memberOf jqgrid#
     */
    function delAction(colName) {
        o.$element.find('td[role="gridcell"][aria-describedby="' + control.id + '_table_' + colName + '"]').each(function () {
            var $this = jQuery(this);
            $this.removeData("linkActionEnable").css({
                "text-decoration": "",
                "cursor": ""
            }).removeClass("any-jqgrid-linkaction");
            if (o.actions[colName].className != null) {
                $this.removeClass(o.actions[colName].className);
            }
            if (o.actions[colName].css != null && o.actions[colName].css.del) {
                $this.css(o.actions[colName].css.del);
            }
        });

        delete (o.actions[colName]);
    }

    /**
     * 로우 액션 설정
     * 
     * @param {function} func
     * @param {boolean} isDblClick
     *
     * @memberOf jqgrid#
     */
    function setRowAction(func, isDblClick) {
        o.rowAction = {func: func, isDblClick: isDblClick};
    }

    /**
     * 컬럼 선택으로 인하여 로우를 선택
     *
     * @param colName
     *
     * @memberOf jqgrid#
     */
    function setRowSelectionByActionColumn(colName) {
        o.rowSelectionByActionColumnName = colName;

        addElementEvent("beforeSelectRow", function (rowId, event) {
            if ($getCell(jQuery(event.srcElement || event.target)).data("linkActionEnable") === true) {
                o.$element.jqGrid("setSelection", rowId);
            }
        });

        function $getCell($elem) {
            return $elem.tag() == "TD" && $elem.attr("role") == "gridcell" ? $elem : $getCell($elem.parent());
        }
    }

    /**
     * 테이블 정렬 조건 세팅
     *
     * @param {Boolean} bool
     *
     * @memberOf jqgrid#
     */
    function setTableDnD(bool) {
        o.tableDnD = (bool == null ? true : bool);
    }

    /**
     * 테이블 컬럼 업데이트
     */
    function tableDnDUpdate() {
        if (o.tableDnD != true) {
            return;
        }

        if (jQuery.fn.tableDnD == null) {
            any.loadScript(o.config("url.plugins") + "/jquery.tablednd.js", function () {
                update();
            });
        } else {
            update();
        }

        function update() {
            if (o.$element[0].tableDnDConfig == null) {
                o.$element.tableDnD({scrollAmount: 0});
            }

            o.$element.tableDnDUpdate();
        }
    }

    /**
     * 그리드 로우 추가(jqGrid, dsGrid, dsGridHTC)
     * 
     * @param {Object} rowData
     * @param {Array} keyNames
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function addRow(rowData, keyNames) {
        if (keyNames != null) {
            var keyData = {};

            for (var i = 0, ii = keyNames.length; i < ii; i++) {
                keyData[keyNames[i]] = rowData[keyNames[i]];
            }

            var row = o.ds.valueRow(keyData);

            if (row != -1) {
                var rowId = o.ds.rowData(row)["=JQGRID-ROW-ID="];
                var $tr = o.$element.find('tr[role="row"][id="' + rowId + '"].jqgrow');

                if ($tr.length == 0) {
                    o.$element.jqGrid("addRowData", rowId, rowData || {});
                }

                if (o.ds.jobType(row) == "D") {
                    o.ds.restoreRow(row);
                }

                return rowId;
            }
        }

        o.maxRowId = String(Number(any.object.nvl(o.maxRowId, 0)) + 1);

        if (o.rowData == null) {
            o.rowData = {};
        }

        if (rowData["=JQGRID-ROW-ID="] == null) {
            rowData["=JQGRID-ROW-ID="] = o.maxRowId;
        }

        o.rowData[o.maxRowId] = o.ds.rowData(o.ds.addRow(rowData));

        o.$element.jqGrid("addRowData", o.maxRowId, rowData || {});

        return o.maxRowId;
    }

    /**
     * 다건의 로우 추가
     * 
     * @param {Array} rowDatas
     * @param {Array} keyNames
     *
     * @memberOf jqgrid#
     */
    function addRows(rowDatas, keyNames) {
        for (var i = 0, ii = rowDatas.length; i < ii; i++) {
            addRow(rowDatas[i], keyNames);
        }
    }

    /**
     * 로우 삭제
     * 
     * @param {String} rowId
     *
     * @memberOf jqgrid#
     */
    function deleteRow(rowId) {
        o.$element.jqGrid("delRowData", rowId);
    }

    /**
     * 선택한 다건의 row 삭제
     *
     * @memberOf jqgrid#
     */
    function deleteSelectedRows() {
        var selRowIds = getSelectedRowIds();

        for (var i = selRowIds.length - 1; i >= 0; i--) {
            deleteRow(selRowIds[i]);
        }
    }

    /**
     * 그리드 수정 부분 중지
     * 
     * @param {Boolean} resetSelection
     *
     * @memberOf jqgrid#
     */
    function stopEdit(resetSelection) {
        if (o.editCell != null) {
            o.$element.jqGrid("saveCell", o.editCell.row, o.editCell.col);
        }

        if (resetSelection == true) {
            o.$element.jqGrid("resetSelection");
        }
    }

    /**
     * 오더 넘버 재 설정
     *
     * @param {String} columnName
     *
     * @memberOf jqgrid#
     */
    function resetOrderNo(columnName) {
        for (var i = 0, ii = o.ds.rowCount(); i < ii; i++) {
            o.ds.value(i, columnName, getRowIndex(o.ds.value(i, "=JQGRID-ROW-ID=")) + 1);
        }
    }

    /**
     * 더미 데이터 초기화(내부 펑션)
     *
     * @param scrollLeft
     *
     * @memberOf jqgrid#
     */
    function resetDummyDataDiv(scrollLeft) {
        if (o.$dummyDataDiv != null) {
            o.$dummyDataDiv.remove();
        }

        var $dataTable = o.$control.find('table#' + control.id + '_table');
        var visibleRowCount = $dataTable.find('tr[role="row"].jqgrow:visible').length;
        var cssValue = (visibleRowCount == 0 ? "none" : "");

        if (o.frozen.index != -1) {
            o.$control.find('div.ui-jqgrid-hdiv.frozen-div').css({"background": cssValue, "border-bottom": cssValue});
        }

        if (visibleRowCount == 0) {
            o.$dummyDataDiv = jQuery('<div>').width($dataTable.width()).height("1px").appendTo($dataTable.parent());

            if (scrollLeft != null) {
                o.$control.find('div.ui-jqgrid-bdiv').scrollLeft(scrollLeft);
            }
        }
    }

    /**
     * disabled된 스크롤 Div를 재 설정(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function resetFrozenScrollGapDiv() {
        if (o.frozen.index == -1) {
            return;
        }

        var $frozenTable = o.$control.find('div.ui-jqgrid-bdiv.frozen-bdiv').children('table#' + control.id + '_table_frozen');

        $frozenTable.siblings('div[role="frozen-scroll-gap-dummy"]').remove();

        jQuery('<div>').attr("role", "frozen-scroll-gap-dummy").height("1px").insertAfter($frozenTable);
    }

    /**
     * 로더 가져오기 (jqGrid, dsgridHTC 동일 이름) (미사용)
     *
     * @returns {*|{}|{}}
     *
     * @memberOf jqgrid#
     */
    function getLoader() {
        if (o.loader != null) {
            return o.loader;
        }

        o.loader = {};

        o.$loader = jQuery(o.loader);

        o.loader.sortParam = function () {
            var arr = [];

            for (var i = 0, ii = o.sortings.length; i < ii; i++) {
                arr.push(o.sortings[i].name + ":" + any.text.blank(o.sortings[i].order, "ASC").toUpperCase() + any.text.nvl(o.config("paging.sortorderSuffix"), ""));
            }

            return arr.join(",");
        };

        o.loader.param = function (name) {
            if (o.loader.prx != null) {
                return o.loader.prx.param(name);
            }
        };

        o.loader.proxy = function () {
            if (o.loader.loading == true) {
                var prx = any.proxy();
                prx.execute = new Function();
                return prx;
            }

            o.loader.loading = true;

            o.$control.resize();

            o.loader.prx = any.proxy().output(o.ds);

            o.loader.prx.executeGrid = o.loader.prx.execute;

            o.$loader.fire("onStart");

            o.$control.resize();

            o.loader.prx.execute = function () {
                if (o.options.pager == null) {
                    loadData();
                } else {
                    o.loader.prx.param(any.pagingParameterName("type"), 1);
                    var page = 1;
                    if (o.loader.prx.reloadParams != null && o.loader.prx.reloadParams.pageNo != null) {
                        page = o.loader.prx.reloadParams.pageNo;
                    }
                    o.$element.jqGrid("setGridParam", {page: page, datatype: loadFunc}).trigger("reloadGrid");
                }
            };

            return o.loader.prx;

            function loadFunc(postdata) {
                if (o.loader.result != null) {
                    postdata.page = Math.min(postdata.page, o.loader.result.total);
                }

                o.loader.prx.param(any.pagingParameterName("recordCountPerPage"), postdata.rows);
                o.loader.prx.param(any.pagingParameterName("currentPageNo"), postdata.page);

                if (o.sortings.length > 0) {
                    o.loader.prx.param(any.pagingParameterName("sortingNames"), o.loader.sortParam());
                } else {
                    o.loader.prx.param(any.pagingParameterName("sortingNames"), null);
                }

                o.loader.postdata = postdata;

                loadData();
            }

            function loadData() {
                bindEvent();

                o.loader.prx.scrollLeft = o.$element.parent().parent().scrollLeft();
                o.loader.prx.option({loadingbar: false});
                o.loader.prx.executeGrid(o.loader.prx.executed);
                o.loader.prx.executed = true;
            }

            function bindEvent() {
                if (o.loader.prx.eventBinded == true) {
                    return;
                }

                o.loader.prx.eventBinded = true;

                o.loader.prx.on("onStart", function () {
                    clearData();
                    resetSummaryLabel();
                    o.loader.loading = true;
                    o.loader.reloading = (o.loader.prx.reloadParams != null);
                    o.$loader.fire("onLoadStart");
                    o.$element.jqGrid("setCaption", "Loading...");
                    showHideLoadUI(true);
                });

                o.loader.prx.on("onSuccess", function () {
                    o.loader.loading = false;
                    showHideLoadUI(false);
                    var $hcb = o.$control.find('input:checkbox#cb_' + control.id + '_table');
                    if ($hcb.data("click-event-attached") != true) {
                        $hcb.data("click-event-attached", true).click(function () {
                            o.$control.fire("onHeaderCheckAll", [this.checked]);
                        });
                    }
                    o.$loader.fire("onLoadSuccess");
                });

                o.loader.prx.on("onError", function () {
                    o.loader.loading = false;
                    o.$element.jqGrid("setCaption", "(Error)");
                    showHideLoadUI(false);
                    o.$loader.fire("onLoadError");
                });

                o.loader.prx.on("onComplete", function () {
                    o.$loader.fire("onLoadComplete");
                    delete (o.loader.reloading);
                });
            }

            function showHideLoadUI(bool) {
                if (o.$loadUI == null) {
                    o.$loadUI = o.$control.find('div#lui_' + control.id + '_table, div#load_' + control.id + '_table');
                }

                o.$loadUI.appendTo(o.$loadUI.parent()).css("z-index", "auto").showHide(bool);
            }
        };

        o.loader.reload = function () {
            if (o.loader.prx == null) {
                return false;
            }

            o.loader.prx.reloadParams = {};
            o.loader.prx.reloadParams.scrollTop = o.$element.parent().parent().scrollTop();
            o.loader.prx.reloadParams.selectedRowId = o.$element.jqGrid("getGridParam", "selrow");
            o.loader.prx.reloadParams.pageNo = o.$element.jqGrid("getGridParam", "page");

            o.loader.prx.reload();

            return true;
        };

        return o.loader;
    }

    /**
     * 컴플릿 로드(내부 펑션)
     *
     * @memberOf jqgrid#
     */
    function loadComplete() {
        if (o.loader != null && o.loader.prx != null) {
            doFilter();
        }

        o.$control.find('table#' + control.id + '_table_frozen, table#' + control.id + '_table').unbind("contextmenu");

        resetFrozenScrollGapDiv();

        (function () {
            if (o.rowAction == null) {
                return;
            }
            o.$control.find('table#' + control.id + '_table').find('tr[role="row"].jqgrow > td').on(o.rowAction.isDblClick === true ? "dblclick" : "click", function () {
                var $src = jQuery(this);
                var qry = 'input[role="checkbox"].cbox:enabled';
                if ($src.children(qry).length == 0 && $src.is(qry) != true) {
                    o.rowAction.func.apply(this, [getRowData($src.parent().attr("id"))]);
                }
            });
        })();

        (function () {
            if (o.options.rownumbers != true || o.rownumberDesc != true) {
                return;
            }
            if (o.loader == null || o.loader.result == null) {
                return;
            }
            var pagingFactor = 0;
            if (o.options.pager != null) {
                pagingFactor = (o.loader.result.page - 1) * o.loader.postdata.rows;
            }
            var $rows = getDataTableRows();
            for (var r = 0, rr = $rows.length; r < rr; r++) {
                $rows.eq(r).children('td.jqgrid-rownum').text(o.loader.result.records - pagingFactor - r);
            }
        })();

        resetSummaryData();
        applyRowspan();

        (function () {
            if (o.rowData == null) {
                return;
            }
            var $bTableCells = o.$control.find('div.ui-jqgrid-bdiv table.ui-jqgrid-btable td[role="gridcell"]');
            var $fTableCells = o.$control.find('div.ui-jqgrid-sdiv table.ui-jqgrid-ftable td[role="gridcell"]');
            for (var colName in o.actions) {
                apply($bTableCells, colName);
                if (o.actions[colName].summary == true) {
                    apply($fTableCells, colName, true);
                }
            }

            function apply($gridCells, colName, summary) {
                $gridCells.filter('[aria-describedby="' + control.id + '_table_' + colName + '"]').each(function () {
                    var $this = jQuery(this);
                    if ($this.data("colName") != null) {
                        return true;
                    }
                    if (o.actions[colName].check != null) {
                        var rowId, rowData;
                        if (summary == true) {
                            rowId = null;
                            rowData = o.$element.jqGrid("footerData", "get");
                        } else {
                            rowId = $this.parent().attr("id");
                            rowData = o.rowData[rowId];
                        }
                        if (o.actions[colName].check.apply(control, [rowData, rowId, colName]) != true) {
                            return true;
                        }
                    }
                    var linkActionEnable = (o.rowSelectionByActionColumnName == null || o.rowSelectionByActionColumnName == colName);
                    $this.data({
                        "colName": colName,
                        "linkActionEnable": linkActionEnable
                    }).css({
                        "text-decoration": "underline",
                        "text-underline-position": "under",
                        "cursor": "pointer"
                    }).addClass("any-jqgrid-linkaction").click(function () {
                        var $this = jQuery(this);
                        var colName = $this.data("colName");
                        if (o.actions[colName] != null) {
                            var rowId, rowData;
                            if (summary == true) {
                                rowId = null;
                                rowData = o.$element.jqGrid("footerData", "get");
                            } else {
                                rowId = $this.parent().attr("id");
                                rowData = o.rowData[rowId];
                            }
                            window.setTimeout(function () {
                                o.actions[colName].action.apply(control, [rowData, rowId, colName]);
                            });
                        }
                    });
                    if (o.actions[colName].className != null) {
                        $this.addClass(o.actions[colName].className);
                    }
                    if (o.actions[colName].css != null && o.actions[colName].css.add != null) {
                        $this.css(o.actions[colName].css.add);
                    }
                });
            }
        })();

        (function () {
            if (o.options.multiselect != true) {
                return;
            }
            if (o.selection == null) {
                return;
            }
            o.$element.jqGrid("resetSelection");
            o.$element.find('tr[role="row"][id]').each(function () {
                var rowId = jQuery(this).attr("id");
                if (o.rowData[rowId][o.selection.name] == o.selection.selectValue) {
                    o.$element.jqGrid("setSelection", rowId);
                }
            });
        })();

        (function () {
            if (o.loader == null || o.loader.prx == null) {
                return;
            }
            if (o.loader.prx.scrollLeft != null) {
                o.$element.parent().parent().scrollLeft(o.loader.prx.scrollLeft);
                delete (o.loader.prx.scrollLeft);
            }
            if (o.loader.prx.reloadParams == null) {
                return;
            }
            o.$element.parent().parent().scrollTop(o.loader.prx.reloadParams.scrollTop);
            if (o.options.multiselect != true) {
                o.$element.jqGrid("setSelection", o.loader.prx.reloadParams.selectedRowId);
            }
            if (o.options.pager != null) {
                o.loader.prx.reloadParams = null;
            }
        })();

        (function () {
            if (o.options.multiselect != true || o.multiSelectFunction == null) {
                return;
            }
            var $jqghDiv = jQuery('div#jqgh_' + control.id + '_table_cb');
            $jqghDiv.children('input[role="checkbox"]').remove().clone().prependTo($jqghDiv).click(function () {
                var checked = this.checked;
                o.$element.jqGrid("resetSelection");
                if (checked == true) {
                    o.$control.find('table#' + control.id + '_table').find('input[role="checkbox"].cbox').each(function () {
                        o.$element.jqGrid("setSelection", jQuery(this).parent().parent()[0].id);
                    });
                }
                this.checked = checked;
            });
            getDataTableRows(true).each(function () {
                if (o.multiSelectFunction.apply(o.$element[0], [getRowData(this.id), this.id]) != true) {
                    jQuery(this).find('input[role="checkbox"].cbox').remove();
                }
            });
            o.$element.jqGrid("resetSelection");
        })();
    }

    /**
     * 로우 아이디 가져오기
     * 
     * @param {Number} rowVar
     * @returns {null|*}
     *
     * @memberOf jqgrid#
     */
    function getRowId(rowVar) {
        if (rowVar == -1) {
            return null;
        }

        if (typeof (rowVar) === "number") {
            return getDataTableRows()[rowVar].id;
        }

        return rowVar;
    }

    /**
     * 로우 인덱스 넘버 가져오기(dsGrid, jqGrid 동일 이름)
     *
     * @param {Number} rowId
     * @returns {number}
     *
     * @memberOf jqgrid#
     */
    function getRowIndex(rowId) {
        if (rowId == null) {
            return -1;
        }

        if (o.jqgfirstrow == null) {
            o.jqgfirstrow = o.$element.find('tr[role="row"].jqgfirstrow').length;
        }

        return o.$element.jqGrid("getInd", rowId) - o.jqgfirstrow;
    }

    /**
     * 해당 로우의 데이터 가져오기(jqGrid, dsGrid, dsGridHTC 동일 이름)
     *
     * @param {Number} rowVar
     * @returns {{}}
     *
     * @memberOf jqgrid#
     */
    function getRowData(rowVar) {
        var rowId = getRowId(rowVar);
        var rowData = o.rowData[rowId];

        if (o.options.cellEdit == true) {
            var jqRowData = o.$element.jqGrid("getRowData", rowId);
            for (var item in jqRowData) {
                rowData[item] = jqRowData[item];
            }
        }

        var result = {};

        for (var item in rowData) {
            if (!any.text.startsWith(item, "=JQGRID-")) {
                result[item] = rowData[item];
            }
        }

        return result;
    }

    /**
     * 밸류 값 가져오기(jqGrid, dsGrid, dsGridHTC 동일 이름)
     * 
     * @param {Number} rowVar
     * @param {String} colName
     * @returns {null|*}
     *
     * @memberOf jqgrid#
     */
    function getValue(rowVar, colName) {
        var rowId = getRowId(rowVar);

        if (rowId == null) {
            return null;
        }

        for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
            if (o.options.colModel[i].name == colName && o.options.colModel[i].editable == true) {
                return o.$element.jqGrid("getCell", rowId, colName);
            }
        }

        var value = o.rowData[rowId][colName];

        return value == null ? null : value;
    }

    /**
     * 밸류 값 세팅(내부 펑션)
     * 
     * @param {Number} rowVar
     * @param {String} colName
     * @param {String} value
     * @param {String} style
     * 
     * @memberOf jqgrid#
     */
    function setValue(rowVar, colName, value, style) {
        var rowId = getRowId(rowVar);

        o.$element.jqGrid("setCell", rowId, colName, value, style);

        o.rowData[rowId][colName] = value;

        if (o.frozen.index != -1 && style != null) {
            o.$control.find('div.ui-jqgrid-bdiv.frozen-bdiv').children('table.ui-jqgrid-btable').find('tr[role="row"].jqgrow[id="' + rowId + '"]')
                .children('td[aria-describedby="' + control.id + '_table_' + colName + '"]').css(style);
        }
    }

    /**
     * 몇 번째 로우인지 가져오기(내부 펑션)
     * 
     * @param {Object} obj
     * @param {Array} defaultRow
     * @returns {number|*|number}
     *
     * @memberOf jqgrid#
     */
    function getValueRow(obj, defaultRow) {
        for (var i = 0, ii = getRowCount(); i < ii; i++) {
            if (checkValueRow(i) == true) {
                return i;
            }
        }

        return defaultRow == null ? -1 : defaultRow;

        function checkValueRow(row) {
            for (var key in obj) {
                if (getValue(row, key) != obj[key]) {
                    return false;
                }
            }
            return true;
        }
    }

    /**
     * 로우 아이디 가져오기(내부 펑션)
     *
     * @param {Object} obj
     * @param {Number} defaultRowId
     * @returns {*|null}
     *
     * @memberOf jqgrid#
     */
    function getValueRowId(obj, defaultRowId) {
        var row = getValueRow(obj);

        if (row != -1) {
            return getRowId(row);
        }

        return defaultRowId;
    }

    /**
     * 헤더 높이 가져오기(내부 펑션)
     * 
     * @returns {*}
     * 
     * @memberOf jqgrid#
     */
    function getHeaderRowHeight() {
        return o.headerRowHeight;
    }

    /**
     * 헤더 높이 세팅(내부 펑션)
     *
     * @param {Number} val
     *
     * @memberOf jqgrid#
     */
    function setHeaderRowHeight(val) {
        o.$control.find('div.ui-jqgrid-hdiv').find('table.ui-jqgrid-htable').find('tr.ui-jqgrid-labels[role="rowheader"]').height(val).find('div').height("auto");

        o.headerRowHeight = val;

        resizeHeight();
    }

    /**
     * disabled 된 테이블(미사용)
     *
     * @returns {Number|*}
     *
     * @memberOf jqgrid#
     */
    function getFrozenTableCorrect() {
        return o.frozen.correctTableHeight;
    }

    /**
     * disabled 테이블 설정(미사용)
     *
     * @param {Number} val
     *
     * @memberOf jqgrid#
     */
    function setFrozenTableCorrect(val) {
        o.frozen.correctTableHeight = val;
    }

    /**
     * 해당 로우의 설명(미사용)
     *
     * @returns {*|boolean}
     *
     * @memberOf jqgrid#
     */
    function getRownumberDesc() {
        return o.rownumberDesc;
    }

    /**
     * 해당 로우의 설명 세팅(미사용)
     *
     * @param {Number} val
     *
     * @memberOf jqgrid#
     */
    function setRownumberDesc(val) {
        o.rownumberDesc = (String(val).toLowerCase() == "true" || any.object.toBoolean(val, true));
    }

    /**
     * 자동 컬럼 가져오기(미사용)
     * 
     * @returns {*|boolean}
     * 
     * @memberOf jqgrid#
     */
    function getAutoColumn() {
        return o.autoColumn;
    }

    /**
     * 자동 컬럼 세팅(미사용)
     *
     * @param {String} val
     *
     * @memberOf jqgrid#
     */
    function setAutoColumn(val) {
        o.autoColumn = (String(val).toLowerCase() == "true" || any.object.toBoolean(val, true));
    }

    /**
     * 합계 카운트 가져오기(내부 펑션)
     * 
     * @param {Object} ds
     * @returns {number|*}
     *
     * @memberOf jqgrid#
     */
    function getTotalCount(ds) {
        if (ds == null) {
            ds = o.ds;
        }

        if (o.loader.prx.xhr != null) {
            var totalCount = o.loader.prx.xhr.getResponseHeader("_TOTAL_COUNT_");

            if (any.text.isEmpty(totalCount) != true) {
                ds.meta("_TOTAL_COUNT_", Number(totalCount));
            }
        }

        var meta = ds.json().meta;

        if (meta == null || meta["_TOTAL_COUNT_"] == null) {
            return ds.rowCount();
        }

        return Number(meta["_TOTAL_COUNT_"]);
    }

    /**
     * 로우 갯수 가져오기
     * 
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getRowCount() {
        return o.$element.jqGrid("getDataIDs").length;
    }

    /**
     * 데이터 모두 삭제(jqGrid, dsGrid 동일 이름)
     *
     * @memberOf jqgrid#
     */
    function clearData() {
        o.$element.jqGrid("clearGridData");

        if (o.loader != null && o.loader.prx != null) {
            resetDummyDataDiv(o.loader.prx.scrollLeft);
        } else {
            resetDummyDataDiv();
        }

        resetFrozenScrollGapDiv();

        o.ds.init();

        if (o.summary == null) {
            return;
        }

        var footerData = o.$element.jqGrid("footerData", "get");

        for (var i = 0, ii = o.options.colModel.length; i < ii; i++) {
            var colModel = o.options.colModel[i];

            if (colModel.summaryType != null) {
                footerData[colModel.name] = null;
            }
        }

        o.$element.jqGrid("footerData", "set", footerData);
    }

    /**
     * 선택한 로우 이동
     * 
     * @param {Number} num
     * @returns {boolean}
     *
     * @memberOf jqgrid#
     */
    function moveSelection(num) {
        if (num == null) {
            num = 1;
        }

        var row;

        if (getSelectedRowId() == null) {
            if (getRowCount() == 0) {
                return false;
            }
            row = (num == -1 ? getDataTableRows().length : -1);
        } else {
            row = getRowIndex(getSelectedRowId());
            if (num == -1 && row == 0) {
                return false;
            }
            if (num == +1 && row == getRowCount() - 1) {
                return false;
            }
        }

        o.$element.jqGrid("setSelection", getRowId(row + num));

        return true;
    }

    /**
     * 선택한 로우의 데이터 리스트 가져오기(내부 펑션)
     *
     * @returns {*[]}
     *
     * @memberOf jqgrid#
     */
    function getSelectedRowDataList() {
        var rowDataList = [];
        var selRowIds = getSelectedRowIds();

        for (var i = 0, ii = selRowIds.length; i < ii; i++) {
            rowDataList.push(getRowData(selRowIds[i]));
        }

        return rowDataList;
    }

    /**
     * 선택한 로우의 데이터 가져오기
     * 
     * @param {Array} columnNames
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getSelectedData(columnNames) {
        var ds = any.ds("ds_" + control.id + "_selected").init().dataOnly(true);
        var rowDataList = getSelectedRowDataList();

        for (var i = 0, ii = rowDataList.length; i < ii; i++) {
            var row = ds.addRow();
            var rowData = rowDataList[i];

            if (columnNames == null) {
                ds.rowData(row, rowData);
            } else {
                for (var j = 0, jj = columnNames.length; j < jj; j++) {
                    if (columnNames[j] != null && columnNames[j] != "") {
                        ds.value(row, columnNames[j], rowData[columnNames[j]]);
                    }
                }
            }

            ds.jobType(row, "U");
        }

        return ds;
    }

    /**
     * 다건의 로우 아이디 가져오기(내부 펑션)
     *
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getSelectedRowIds() {
        return o.$element.jqGrid("getGridParam", "selarrrow").sort(function (a, b) {
            return a - b;
        });
    }

    /**
     * 단건의 로우 아이디 가져오기(내부 펑션)
     *
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getSelectedRowId() {
        return o.$element.jqGrid("getGridParam", "selrow");
    }

    function getSelectedRowIndex() {
        return getRowIndex(getSelectedRowId());
    }


    /**
     * 테이블의 다건 로우 인덱스 넘버 가져오기(내부 펑션)
     *
     * @param {Boolean} withFrozen
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getDataTableRows(withFrozen) {
        return o.$control.find('table#' + control.id + '_table' + (withFrozen == true ? ',table#' + control.id + '_table_frozen' : '')).find('tr[role="row"].jqgrow');
    }

    /**
     * 테이블의 단건 로우 인덱스 넘버 가져오기(내부 펑션)
     *
     * @param {Number} rowVar
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getDataTableRow(rowVar) {
        return getDataTableRows().filter('#' + getRowId(rowVar));
    }

    /**
     * 데이터 테이블 셀 가져오기
     *
     * @param {Number} rowVar
     * @param {String} colName
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getDataTableCell(rowVar, colName) {
        return getDataTableRow(rowVar).children('[aria-describedby="' + control.id + '_table_' + colName + '"]');
    }

    /**
     * 불능화 가져오기(미사용)
     *
     * @returns {*|boolean}
     *
     * @memberOf jqgrid#
     */
    function getDisabled() {
        return o.disabled;
    }

    /**
     * 불능화 세팅(미사용)
     *
     * @param {String} val
     *
     * @memberOf jqgrid#
     */
    function setDisabled(val) {
        o.disabled = (String(val).toLowerCase() == "disabled" || any.object.toBoolean(val, true));

        if (o.disabled == true) {
            o.$control.css({"position": "relative"});
            if (o.$disabledScreen == null) {
                o.$disabledScreen = jQuery('<div>').css({
                    "position": "absolute",
                    "left": "0px",
                    "top": "0px",
                    "width": "100%",
                    "height": "100%"
                });
                o.$disabledScreen.css({"background-color": "#ffffff"});
                o.$disabledScreen.appendTo(control);
                o.$disabledScreen.fadeTo(0, 0.5);
            }
        } else {
            o.$control.css({"position": ""});
            if (o.$disabledScreen != null) {
                o.$disabledScreen.remove();
                delete (o.$disabledScreen);
            }
        }
    }

    /**
     * 다운로드 타이틀 가져오기(미사용)
     *
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getDownloadTitle() {
        return o.downloadTitle;
    }

    /**
     * 다운로드 타이틀 설정(미사용)
     * 
     * @param {String} name
     *
     * @memberOf jqgrid#
     */
    function setDownloadTitle(name) {
        o.downloadTitle = name;
    }

    /**
     * 헤더의 데이터셋 가져오기(내부 펑션)
     * 
     * @param {Array} columnNames
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getHeaderDataset(columnNames) {
        var ds = any.ds("ds_" + control.id + "_headerList").dataOnly(true).init();
        var colModel = o.$element.jqGrid("getGridParam", "colModel");

        if (columnNames == null) {
            for (var i = 0, ii = colModel.length; i < ii; i++) {
                if (colModel[i].name != "cb") {
                    ds.addColumn(colModel[i].name);
                }
            }
        } else {
            for (var i = 0, ii = columnNames.length; i < ii; i++) {
                ds.addColumn(columnNames[i]);
            }
        }

        var $trs = o.$control.find('div.ui-jqgrid-hdiv').not('div.frozen-div').find('table.ui-jqgrid-htable').find('tr.ui-jqgrid-labels[role="rowheader"]');

        for (var r = 0, rr = $trs.length; r < rr; r++) {
            ds.addRow();
        }

        for (var r = 0, rr = $trs.length; r < rr; r++) {
            var $ths = $trs.eq(r).children('th');
            var c = 0;
            for (var i = 0, ii = $ths.length; i < ii; i++) {
                var $th = $ths.eq(i);
                var label = any.text.trim($th.text());
                if ($th.attr("id") == null) {
                    if (ds.colId(c) != "cb") {
                        var colspan = any.text.toNumber(any.text.blank($th.attr("colspan"), 1));
                        for (var j = 0; j < colspan; j++) {
                            ds.value(r, c, label);
                            c++;
                        }
                    }
                } else {
                    var colName = $th.attr("id").replace(control.id + "_table_", "");
                    if (columnNames != null && ds.colIndex(colName) == -1) {
                        continue;
                    }
                    if (colName != "cb") {
                        var rowspan = any.text.toNumber(any.text.blank($th.attr("rowspan"), 1));
                        for (var j = 0; j < rowspan; j++) {
                            ds.value(r + j, colName, label);
                        }
                        c++;
                    }
                }
            }
        }

        if (columnNames != null && o.unusedModel != null) {
            for (var i = 0, ii = ds.rowCount(); i < ii; i++) {
                for (var name in o.unusedModel) {
                    ds.value(i, name, o.unusedModel[name].label);
                }
            }
        }

        return ds;
    }

    /**
     * 컬럼 데이터셋 가져오기(내부 펑션)
     *
     * @param {Array} columnNames
     * @returns {*}
     *
     * @memberOf jqgrid#
     */
    function getColumnDataset(columnNames) {
        var ds = any.ds("ds_" + control.id + "_columnList").dataOnly(true).init();
        var colModel = o.$element.jqGrid("getGridParam", "colModel");

        if (columnNames == null) {
            for (var i = 0, ii = colModel.length; i < ii; i++) {
                if (colModel[i].name != "cb") {
                    addModel(colModel[i]);
                }
            }
        } else {
            for (var i = 0, ii = columnNames.length; i < ii; i++) {
                addModel(getModel(columnNames[i]));
            }
        }

        return ds;

        function getModel(name) {
            for (var i = 0, ii = colModel.length; i < ii; i++) {
                if (colModel[i].name == name) {
                    return colModel[i];
                }
            }

            if (o.unusedModel != null) {
                return o.unusedModel[name];
            }
        }

        function addModel(model) {
            if (model == null) {
                return;
            }

            var row = ds.addRow();

            ds.value(row, "NAME", model.name);
            ds.value(row, "WIDTH", isNaN(model.width) ? 0 : model.width);
            ds.value(row, "ALIGN", model.align);
            ds.value(row, "HIDDEN", model.hidden);
            ds.value(row, "FORMATTER", model["formatter-name"]);

            var formatoptions = model["formatoptions"];

            if (formatoptions == null) {
                return;
            }

            var decimalPlaces = formatoptions["decimalPlaces"];

            if (decimalPlaces != null) {
                ds.value(row, "DECIMAL_PLACES", decimalPlaces);
            }
        }
    }

    /**
     * 엑셀 다운로드(내부 펑션)
     * 
     * @param {Array} columnNames
     *
     * @memberOf jqgrid#
     */
    function downloadExcel(columnNames) {
        if (o.loader == null || o.loader.prx == null) {
            return;
        }

        if (o.config("excelDownload.view") != null) {
            var win = any.window(true).url(o.config("excelDownload.view"));
            win.param("paging", o.options.pager == null ? "0" : 1);
            win.arg("functions", {download: download, cancel: cancel});
            win.option({closeOnEscape: false});
            win.show();
            win.$div.parent().find('button.ui-dialog-titlebar-close[role="button"]').click(cancel);
            return;
        }

        var rjQuery = any.rootWindow().jQuery;
        var $div = rjQuery('<div>').css("overflow", "hidden");
        var opts = {modal: true, resizable: false, hide: "clip", closeOnEscape: false, buttons: {}};

        $div.$buttonTable = rjQuery('<table>').css({"width": "100%", "height": "100%"}).appendTo($div);
        $div.$buttonTd = rjQuery('<td>').appendTo(rjQuery('<tr>').appendTo(rjQuery('<tbody>').appendTo($div.$buttonTable)));

        if (o.options.pager == null) {
            rjQuery('<button>').width("100%").text(any.message("any.grid.button.excel.downloadWithoutPage")).control("any-button").appendTo($div.$buttonTd).click(function () {
                doDownload(1);
            });
            opts.height = 130;
        } else {
            rjQuery('<button>').width("100%").text(any.message("any.grid.button.excel.downloadWithPage1")).control("any-button").appendTo($div.$buttonTd).click(function () {
                doDownload(1);
            });
            rjQuery('<div>').width("100%").height("5px").appendTo($div.$buttonTd);
            rjQuery('<button>').width("100%").text(any.message("any.grid.button.excel.downloadWithPage2")).control("any-button").appendTo($div.$buttonTd).click(function () {
                doDownload(2);
            });
            opts.height = 160;
        }

        opts.buttons[any.message("any.btn.cancel", "Cancel")] = function () {
            rjQuery(this).dialog("close");

            cancel();
        };

        opts.close = function (event, ui) {
            $div.remove();
            $div = null;
        };

        $div.attr("title", any.message("any.grid.button.excel.title")).dialog(opts);

        $div.parent().find('button.ui-dialog-titlebar-close[role="button"]').click(cancel);

        function doDownload(mode) {
            download(mode, null, {
                start: function () {
                    $div.$buttonTable.hide();
                    $div.$progressTable = rjQuery('<table>').css({"width": "100%", "height": "100%"}).appendTo($div);
                    $div.$progressTd = rjQuery('<td>').appendTo(rjQuery('<tr>').appendTo(rjQuery('<tbody>').appendTo($div.$progressTable)));
                    $div.$progressBar = rjQuery('<div>').css({"position": "relative"}).appendTo($div.$progressTd);
                    $div.$progressLabel = rjQuery('<div>').css({
                        "position": "absolute",
                        "font-weight": "bold",
                        "text-align": "center",
                        "text-shadow": "1px 1px 0 #fff",
                        "width": "100%",
                        "margin-top": "4px"
                    }).appendTo($div.$progressBar);
                    $div.$progressBar.progressbar({value: false});
                    $div.$progressLabel.text("Data Loading...");
                }, progress: function (data) {
                    if ($div == null) {
                        this.stop();
                    }
                    if ($div == null || (data.completed != true && data.totalValue == 0)) {
                        return;
                    }
                    if (data.completed == true && data.totalValue == 0) {
                        data.progress = 1;
                    }
                    $div.$progressBar.progressbar("value", data.progress * 100);
                    $div.$progressLabel.text(any.text.formatNumber(data.value) + "/" + any.text.formatNumber(data.totalValue) + " (" + any.text.formatNumber(data.progress * 100, 2) + "%)");
                }, stop: function () {
                    if ($div == null) {
                        return;
                    }
                    $div.dialog("close");
                }
            });
        }

        function download(mode, options, functions) {
            if (o.$downloadForm == null) {
                o.$downloadForm = jQuery('<form>').hide().appendTo(control);
            } else {
                o.$downloadForm.empty();
            }

            var tokenParamName = any.config["/anyworks/servlet-token-check/param-name"];

            if (tokenParamName != null && tokenParamName != "") {
                addHidden(tokenParamName, any.rootWindow().any.meta.servletToken);
            }

            var params = o.loader.prx.param();

            for (var i = 0, ii = params.length; i < ii; i++) {
                addHidden(params[i].name, params[i].value);
            }

            if (o.loader.prx.param(any.pagingParameterName("sortingNames")) == null && o.sortings.length > 0) {
                addHidden(any.pagingParameterName("sortingNames"), o.loader.sortParam());
            }

            var pagingFactor = 0;

            if (o.options.pager != null && mode == 1) {
                pagingFactor = (o.loader.result.page - 1) * o.loader.postdata.rows;
            }

            addHidden("_DOWNLOAD_MODE_", mode);
            addHidden("_DOWNLOAD_TITLE_", any.text.nvl(o.downloadTitle, any.text.empty(jQuery('h1:first').text(), document.title)));
            addHidden("_DATA_SET_JSON_", '[' + o.loader.prx.jsons(true).join(",") + ']');
            addHidden("_DS_HEADER_LIST_", getHeaderDataset(columnNames).jsonString());
            addHidden("_DS_COLUMN_LIST_", getColumnDataset(columnNames).jsonString());
            addHidden("_FROZEN_COLUMN_NAME_", o.frozen.name);
            addHidden("_ROWNUMBER_START_", o.rownumberDesc == true ? o.loader.result.records - pagingFactor : pagingFactor + 1);
            addHidden("_ROWNUMBER_CALC_", o.rownumberDesc == true ? -1 : 1);
            addHidden("_TOTAL_VALUE_", mode == 1 ? getRowCount() : getTotalCount());

            if (o.rowspan != null) {
                addHidden("_ROWSPAN_COLUMNS_", o.rowspan.columns.join(","));
                addHidden("_ROWSPAN_RESTRICT_", o.rowspan.restrict == true ? 1 : 0);
            }

            if (options != null) {
                for (var name in options) {
                    addHidden(name, options[name]);
                }
            }

            if (o.loader.prx.param(any.pagingParameterName("type")) == 1 && mode == 2) {
                o.$downloadForm.children('input[name="' + any.pagingParameterName("recordCountPerPage") + '"]').val(-1);
            }

            if (o.downloadFrameIndex == null) {
                o.downloadFrameIndex = 0;
            }

            o.$downloadFrame = jQuery('<iframe name="ifr_' + control.id + '_excelDownload_' + o.controlIndex + '_' + (o.downloadFrameIndex++) + '">').hide().appendTo(control);

            o.$downloadFrame[0].onActionFailure = function (error) {
                any.error(error).show();
            };

            if (functions != null && functions.start != null) {
                functions.start.apply();
            }

            any.progress(o.$downloadForm[0]).interval(500).callback(function (data) {
                if (data != null && functions != null && functions.progress != null) {
                    try {
                        functions.progress.apply(this, [data]);
                    } catch (e) {
                        this.stop();
                    }
                }
                if (data == null || data.completed == true || o.$downloadFrame == null) {
                    this.stop();
                }
            }).on("onStop", function () {
                if (functions != null && functions.stop != null) {
                    try {
                        functions.stop.apply();
                    } catch (e) {
                    }
                }
            }).start();

            o.$downloadForm.attr({
                action: o.loader.prx.url(),
                target: o.$downloadFrame.attr("name"),
                method: "POST"
            }).submit();

            function addHidden(name, value) {
                if (name != null && name != "" && value != null) {
                    jQuery('<input>').attr({type: "hidden", name: name}).val(value).appendTo(o.$downloadForm);
                }
            }
        }

        function cancel() {
            if (o.$downloadFrame != null) {
                o.$downloadFrame.attr("src", "about:blank").remove();
                o.$downloadFrame = null;
            }
        }
    }

    /**
     * 필터 적용(내부 펑션)
     * 
     * @memberOf jqgrid#
     */
    function doFilter() {
        var scrollLeft = o.$control.find('div.ui-jqgrid-bdiv').scrollLeft();

        if (o.buttons["filter"].toggleActivated == true) {
            var $toolbar = o.$control.find('tr.ui-search-toolbar').not(o.$frozenSearchToolbarDummy);
            getDataTableRows(true).each(function () {
                if (this.id == null || this.id == "") {
                    return;
                }
                this.style.display = (function (rowId) {
                    var $filter = $toolbar.find('input:text');
                    for (var i = 0, ii = $filter.length; i < ii; i++) {
                        if (o.rowData[rowId] == null || o.rowData[rowId][$filter[i].name] == null || $filter[i].value == "") {
                            continue;
                        }
                        if (String(o.rowData[rowId][$filter[i].name]).toUpperCase().indexOf(any.text.trim($filter[i].value.toUpperCase())) == -1) {
                            return false;
                        }
                    }
                    return true;
                }(this.id) == true ? "" : "none");
            });
        } else {
            getDataTableRows(true).show();
        }

        resetDummyDataDiv(scrollLeft);

        applyRowspan(true);
    }

    /**
     * 설정 설정(내부 펑션)
     * 
     * @memberOf jqgrid#
     */
    function doConfig() {
        var win = any.window(true);
        win.url(o.config("config.view"));
        win.arg("grid", control);
        win.arg("colModel", o.$element.jqGrid("getGridParam", "colModel"));
        win.arg("configInfo", o.configInfo);
        win.arg("sortings", o.sortings);
        win.arg("actions", o.actions);
        win.arg("saveConfig", saveConfig);
        win.show();
    }

    /**
     * 설정 리셋
     * 
     * @param {String} addonPath
     * @param {callback} callback
     */
    function resetConfig(addonPath, callback) {
        if (o.buttons["config"].show != true && arguments.length == 0) {
            return;
        }

        o.buttons["config"].show = true;

        resetConfig.executed = true;

        if (o.options.multiSort == null) {
            o.options.multiSort = true;
        }

        if (o.configInfo == null) {
            o.configInfo = {ds: {}};
            o.configInfo.ds.config = any.ds("ds_configMain", control).dataOnly(true);
            o.configInfo.ds.column = any.ds("ds_columnList", control).dataOnly(true);
            o.configInfo.ds.sorting = any.ds("ds_sortingList", control).dataOnly(true);
        }

        if (arguments.length > 0) {
            o.configInfo.addonPath = addonPath;
        }

        loadConfig(callback);
    }

    /**
     * 설정 불러오기(내부 펑션)
     *
     * @param {callback} callback
     *
     * @memberOf jqgrid#
     */
    function loadConfig(callback) {
        if (o.config("config.load") == null) {
            control.isReady = true;
            return;
        }

        var prx = any.proxy(control);
        prx.url(o.config("config.load"));
        prx.param("GRID_PATH", getGridPath());

        prx.on("onSuccess", function () {
            applyConfig(callback);
        });

        prx.on("onError", function () {
            this.error.show();
        });

        prx.on("onComplete", function () {
            control.isReady = true;
        });

        prx.option({loadingbar: false});

        prx.execute();
    }

    /**
     * 설정 저장
     *
     * @param {Object} ds
     * @param {Object} any2
     */
    function saveConfig(ds, any2) {
        var prx = any.proxy(control);
        prx.url(o.config("config.save"));
        prx.param("GRID_ID", o.configInfo.ds.config.value(0, "GRID_ID"));
        prx.param("GRID_PATH", getGridPath());
        prx.data(ds.config);
        prx.data(ds.column);
        prx.data(ds.sorting);

        prx.on("onSuccess", function () {
            any2.unloadPage();
            applyConfig();
        });

        prx.on("onError", function () {
            this.error.show();
        });

        prx.execute();
    }

    function applyConfig(callback) {
        if (o.configInfo.ds.config.value(0, "COLUMN_CONFIG") == "1") {
            var colModel = any.object.clone(o.defaultColModel);

            o.options.colModel = [];

            for (var i = 0, ii = o.configInfo.ds.column.rowCount(); i < ii; i++) {
                var model = null;

                for (var j = 0, jj = colModel.length; j < jj; j++) {
                    if (colModel[j].name == o.configInfo.ds.column.value(i, "NAME")) {
                        model = colModel[j];
                        break;
                    }
                }

                if (model == null) {
                    continue;
                }

                model.width = o.configInfo.ds.column.value(i, "WIDTH");
                model.hidden = (o.configInfo.ds.column.value(i, "SHOW") != "1");
                model.frozen = false;

                o.options.colModel.push(model);

                if (o.configInfo.ds.column.value(i, "FROZEN") == "1") {
                    setFrozen(model.name);
                }
            }

            for (var j = 0, jj = colModel.length; j < jj; j++) {
                var modelNameExists = false;

                for (var i = 0, ii = o.configInfo.ds.column.rowCount(); i < ii; i++) {
                    if (colModel[j].name == o.configInfo.ds.column.value(i, "NAME")) {
                        modelNameExists = true;
                        break;
                    }
                }

                if (modelNameExists != true) {
                    o.options.colModel.splice(j, 0, colModel[j]);
                }
            }
        } else {
            o.options.colModel = o.defaultColModel;
        }

        o.$element.jqGrid("GridDestroy");
        o.$element = getTableElement();

        o.$buttons.remove();
        o.$buttons = null;

        if (o.options.pager != null) {
            setPaging(o.options.rowList, o.options.rowNum);
        }

        o.sortings = [];

        delete (o.options.sortname);
        delete (o.options.sortorder);

        if (o.configInfo.ds.config.value(0, "SORTING_CONFIG") == "1") {
            for (var i = 0, ii = o.configInfo.ds.sorting.rowCount(); i < ii; i++) {
                addSorting(o.configInfo.ds.sorting.value(i, "NAME"), o.configInfo.ds.sorting.value(i, "ORDER"));
            }
        } else {
            for (var i = 0, ii = o.defaultSortings.length; i < ii; i++) {
                addSorting(o.defaultSortings[i].name, o.defaultSortings[i].order);
            }
        }

        activateGrid(true);

        resizeHeight();

        if (typeof (callback) === "function") {
            callback();
        } else if (o.loader != null && o.loader.prx != null) {
            o.loader.prx.execute();
        }
    }

    function getGridPath() {
        if (typeof (o.config("config.getGridPath")) === "function") {
            return o.config("config.getGridPath").apply(control, [o.configInfo.addonPath]);
        }

        var $meta = jQuery('meta[name="X-Any-Servlet-Path"]');
        var servletPath;

        if ($meta.length == 0) {
            servletPath = document.location.pathname;
            if (any.meta.contextPath != "" && any.meta.contextPath != "/" && any.text.startsWith(servletPath, any.meta.contextPath)) {
                servletPath = servletPath.substr(any.meta.contextPath.length);
            }
        } else {
            servletPath = $meta.attr("content");
        }

        var gridPath = [servletPath, control.id];

        if (o.configInfo.addonPath != null && o.configInfo.addonPath != "") {
            gridPath.push(o.configInfo.addonPath);
        }

        return gridPath.join("::");
    }
};















































// ---------------------------------------------------------------------------------------------------------------------
/**
 * any-dsgrid.js
 *
 * @constructs dsgrid
 */
dsgrid = function () {


    /**
     * 겟 디에스
     * @returns {*}
     *
     * @memberOf dsgrid#
     */
    function getDs() {
        return o.ds;
    }

    function initDataset() {
        if (o.$control.hasAttr("ds")) {
            o.ds = any.ds(o.$control.attr("ds"));
        } else if (control.id.indexOf("_") > 0) {
            o.ds = any.ds("ds_" + control.id.substr(control.id.indexOf("_") + 1));
        } else {
            o.ds = any.ds(control.id);
        }

        o.ds.listData(true);

        o.ds.setBinder(resetData);
    }

    function resetData() {
        o.rowId = 0;
        o.codeDataDisable = true;
        o.dataLoading = true;

        o.$dataTbody.empty();

        for (var i = 0, ii = o.ds.rowCount(); i < ii; i++) {
            addTBodyRow(o.ds.rowData(i), i);
            if (o.ds.jobType(i) == "D") {
                deleteRow(i, true);
            }
        }

        resetCalculation();
        resetCodeData();
        resetDisplay();

        delete (o.dataLoading);

        o.$control.fire("onLoad");
    }

    /**
     * 그룹 헤더 추가(dsGrid, jqGrid 동일 이름)
     *
     * @param {Object} obj
     *
     * @memberOf dsgrid#
     */
    function addGroupHeader(obj) {
        if (o.groupHeaders == null) {
            o.groupHeaders = [];
        }

        o.groupHeaders.push(obj);
    }

    /**
     * 컬럼 추가(dsGrid, jqGrid 동일 이름)
     *
     * @param {object} model
     * @param {} option
     *
     * @memberOf dsgrid#
     */
    function addColumn(colInfo) {
        if (colInfo.name == null || colInfo.name == "") {
            return;
        }

        o.columns.push(colInfo);
    }

    function getColumn(name) {
        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            if (o.columns[i].name == name) {
                return o.columns[i];
            }
        }
    }

    function setColumn(name, propName, propValue) {
        var model = getColumn(name);

        if (model == null) {
            return;
        }

        model[propName] = propValue;

        if (propName == "hidden") {
            getColumnCells(name).showHide(propValue != true);
        } else if (propName == "require") {
            var $ctrls = o.$dataTbody.find('td[name="td_' + name + '"]').find('[name="' + control.id + "_" + name + '"]');
            o.$thead.find('tr > th#th_' + name).children('span.require').showHide(propValue);
            $ctrls.attr("require-enable", propValue);
            if (propValue == true) {
                $ctrls.data("require-name", model.label);
            } else {
                $ctrls.removeData("require-name");
            }
        }
    }

    function getColumnCells(name) {
        return o.$table.find('colgroup > col#col_' + name + ', thead > tr > th#th_' + name + ', tbody > tr > td[name="td_' + name + '"], tfoot > tr > td#tf_' + name);
    }

    /**
     * 포맷 형식 세팅(dsGrid, jqGrid 동일 이름)
     *
     * @param {string} colName
     * @param {function} formatter
     * @param {setFormatter} unformat
     *
     * @memberOf dsgrid#
     */
    function setFormatter(colName, formatter, hiddenValue) {
        var model = getColumn(colName);

        if (model == null) {
            return;
        }

        model.formatter = formatter;
        model.hiddenValue = hiddenValue;
    }

    function setKeys() {
        if (o.keyColumns == null) {
            o.keyColumns = {};
        }

        var keys = Array.prototype.slice.call(arguments);

        for (var i = 0, ii = keys.length; i < ii; i++) {
            o.keyColumns[keys[i]] = true;
        }

        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            if (o.keyColumns[o.columns[i].name] != null) {
                o.keyColumns[o.columns[i].name] = false;
            }
        }

        o.ds.setKeys.apply(o.ds, keys);
    }

    /**
     * 옵션 설정하기(dsGrid, jqGrid 동일 이름)
     *
     * @memberOf dsgrid#
     */
    function setOption() {
        any.copyArguments(o.options, arguments);
    }

    function setRowspan(arg1, arg2, arg3) {
        if (arguments.length >= 2 && typeof (arguments[0]) === "string" && typeof (arguments[1]) === "string") {
            o.rowspan = {startColumnName: arg1, endColumnName: arg2, restrict: arg3};
        } else {
            o.rowspan = {columns: arg1, restrict: arg2};
        }
    }

    function applyRowspan() {
        if (o.rowspan == null) {
            return;
        }

        if (o.rowspan.columns == null) {
            o.rowspan.columns = [];
            for (var i = 0, ii = o.columns.length; i < ii; i++) {
                if (o.columns[i].name == o.rowspan.startColumnName || o.rowspan.columns.length > 0) {
                    o.rowspan.columns.push(o.columns[i].name);
                    if (o.rowspan.columns.length > 0 && o.columns[i].name == o.rowspan.endColumnName) {
                        break;
                    }
                }
            }
        }

        var $rows = o.$dataTbody.children('tr');

        for (var c = 0, cc = o.rowspan.columns.length; c < cc; c++) {
            var spanrow = 0;
            var spannum = 1;
            var tdquery = 'td[name="td_' + o.rowspan.columns[c] + '"]';
            var firstRow = true;

            for (var r = 0, rr = $rows.length; r < rr; r++) {
                var $td = $rows.eq(r).children(tdquery);
                var $prevTd;

                if (c > 0 && o.rowspan.restrict == true) {
                    $prevTd = $td.prev();
                }

                if ($prevTd != null && $prevTd.attr("rowspan") == 1) {
                    $td.attr("rowspan", 1);
                } else {
                    if (firstRow != true && $td.text() == $rows.eq(spanrow).children(tdquery).text() && ($prevTd == null || $prevTd.attr("rowspan") == null)) {
                        $td.hide();
                        spannum++;
                    } else {
                        $rows.eq(spanrow).children(tdquery).attr("rowspan", spannum);
                        spanrow = r;
                        spannum = 1;
                    }
                }

                firstRow = false;
            }

            $rows.eq(spanrow).children(tdquery).attr("rowspan", spannum);
        }
    }

    function setTotal(label, columns) {
        o.totalInfo = {label: label, columns: columns};
    }

    function getTotalValue(colName) {
        if (o.$tfoot == null) {
            return 0;
        }

        var $ctrl = o.$tfoot.find('[totalColumn="' + colName + '"]').children();

        if ($ctrl.length == 0) {
            return 0;
        }

        return $ctrl.val() || 0;
    }

    function setAddButton(func) {
        o.$addButton[0].onclick = function () {
            func.apply(control);
        };

        return o.$addButton;
    }

    function setDelButton(func) {
        o.$delButton[0].onclick = function () {
            func.apply(control);
        };

        return o.$delButton;
    }

    /**
     * 버튼 추가(dsGridHTC, jqGrid 동일 이름)
     * 
     * @param {String} text
     * @param {function} func
     * @returns {*|jQuery}
     * 
     * @memberOf dsgrid#
     */
    function addButton(text, func) {
        var $btn = jQuery('<button>').addClass("space").attr({"size": "small"}).text(text).control("any-button").appendTo(o.$buttons);

        if (o.$buttons.hasClass("any-dsgrid-buttons") == true) {
            o.$buttons.css("margin-left", "-" + $btn.css("margin-left"));
        }

        $btn[0].onclick = function () {
            func.apply(control);
        };

        return $btn;
    }

    function addAction(colName, action, check) {
        o.actions[colName] = {action: action, check: check};
    }

    function addControlEvent(colName, eventName, eventHandler) {
        if (o.events[colName] == null) {
            o.events[colName] = [];
        }

        o.events[colName].push({name: eventName, handler: eventHandler});
    }

    function addControlInitializer(colName, eventHandler) {
        addControlEvent(colName, "any-initialize", eventHandler);
    }

    /**
     * 그리드 로우 추가(jqGrid, dsGrid, dsGridHTC)
     *
     * @param {Object} data
     * @returns {string|*|number}
     *
     * @memberOf dsgrid#
     */
    function addRow(data) {
        if (o.keyColumns != null && data != null) {
            var obj = {};
            for (var name in o.keyColumns) {
                obj[name] = data[name];
            }
            var idx = o.ds.valueRow(obj);
            if (idx != -1) {
                if (o.ds.jobType(idx) == "D") {
                    resetDisplay(idx, restoreRow(idx));
                    return idx;
                }
                return "exists";
            }
        }

        var row = o.ds.addRow(data);

        resetDisplay(row, addTBodyRow(data, row));

        o.$control.fire("onAddRow", [row]);
        o.$control.fire("onChangeRow", [row]);

        return row;
    }

    /**
     * 데이터 모두 삭제(jqGrid, dsGrid 동일 이름)
     *
     * @memberOf dsgrid#
     */
    function clearData() {
        o.$dataTbody.empty();

        o.ds.init();

        resetCalculation();
        resetDisplay();
    }

    function getCheckedData(columnNames) {
        var ds = any.ds("ds_" + control.id + "_checked");

        ds.init();

        o.$dataTbody.children('tr').children('td[name="col_check"]').each(function () {
            var $this = jQuery(this);
            var $check = $this.children('input:checkbox:enabled:visible');
            if ($check.prop("checked") == true) {
                var row = ds.addRow();
                var rowData = o.ds.rowData($this.parent().index());
                if (columnNames == null) {
                    ds.rowData(row, rowData);
                } else {
                    for (var i = 0, ii = columnNames.length; i < ii; i++) {
                        ds.value(row, columnNames[i], rowData[columnNames[i]]);
                    }
                }
            }
        });

        return ds;
    }

    function deleteAll() {
        o.$dataTbody.children('tr').each(function () {
            deleteRow(jQuery(this).index(), true);
        });

        resetCalculation();
        resetDisplay();
    }

    function deleteCheckedRow() {
        var data = [];
        var checkedRowCount = 0;

        o.$dataTbody.children('tr').children('td[name="col_check"]').each(function () {
            var $this = jQuery(this);
            var $check = $this.children('input:checkbox:enabled:visible');
            if ($check.prop("checked") == true) {
                $check.prop("checked", false);
                var row = $this.parent().index();
                data.push(o.ds.rowData(row));
                deleteRow(row, true);
                checkedRowCount++;
            }
        });

        o.$headCheck.prop("checked", false);

        resetCalculation();
        resetDisplay();

        o.$control.fire("onDeleteRow", [data]);
        o.$control.fire("onChangeRow");

        if (checkedRowCount == 0) {
            if (getRowCount(true) > 0) {
                if (o.config("message.rowDelete.noSelectedRow") != null) {
                    alert(o.config("message.rowDelete.noSelectedRow"));
                }
            } else {
                if (o.config("message.rowDelete.noDeleteData") != null) {
                    alert(o.config("message.rowDelete.noDeleteData"));
                }
            }
        }
    }

    /**
     * 로우 삭제
     *
     * @param {Object} row
     * @param {Boolean} forMulti
     *
     * @memberOf dsgrid#
     */
    function deleteRow(row, forMulti) {
        var rowData = o.ds.rowData(row);
        var data = [rowData];

        if (o.options.checkDeleteRowBefore != null && typeof (o.options.checkDeleteRowBefore) === "function") {
            if (o.options.checkDeleteRowBefore.apply(o.control, [row, rowData]) !== true) {
                return;
            }
        }

        var $tr = o.$dataTbody.children('tr').eq(row);

        if (o.ds.deleteRow(row) == true) {
            $tr.remove();
        } else {
            $tr.data("delete", 1).hide().find('[require-enable]').removeAttr("require-enable");
        }

        if (forMulti == true) {
            return;
        }

        resetCalculation();
        resetDisplay();

        o.$control.fire("onDeleteRow", [data]);
        o.$control.fire("onChangeRow");
    }

    function restoreRow(row) {
        var $tr = o.$dataTbody.children('tr').eq(row);

        o.ds.restoreRow(row);

        $tr.show();

        return $tr;
    }

    function getDataCell(row, colName) {
        return o.$dataTbody.children('tr').eq(row).children('td[name="td_' + colName + '"]');
    }

    function getControl(row, colName) {
        var $controls = getDataCell(row, colName).children();

        if ($controls.length == 0) {
            return null;
        }

        return $controls.get(0);
    }

    function setControl(row, colName, controlInfo, rowData) {
        var colInfo = {};

        any.object.copyFrom(colInfo, getColumn(colName));
        any.object.copyFrom(colInfo, controlInfo);

        return createControl(getDataCell(row, colName).empty(), colInfo, rowData);
    }

    function getJobType(row) {
        return o.ds.jobType(row);
    }

    /**
     * 로우 인덱스 넘버 가져오기(dsGrid, jqGrid 동일 이름)
     *
     * @param rowVar
     * @returns {number|*}
     *
     * @memberOf dsgrid#
     */
    function getRowIndex(rowVar) {
        if (typeof (rowVar) === "number") {
            return rowVar;
        }

        var $tr = o.$dataTbody.children('tr#' + rowVar);

        if ($tr == null || $tr.length == 0) {
            return -1;
        }

        return $tr.index();
    }

    /**
     * 해당 로우의 데이터 가져오기(jqGrid, dsGrid, dsGridHTC 동일 이름)
     *
     * @param {Number} row
     * @returns {*}
     *
     * @memberOf dsgrid#
     */
    function getRowData(row) {
        return o.ds.rowDataWithBind(row);
    }

    function setRowData(row, data) {
        o.ds.rowData(row, data);
    }

    function setRowDeletable(func) {
        o.rowDeletableFunction = func;
    }

    function setRowEditable(func) {
        o.rowEditableFunction = func;
    }

    /**
     * 테이블 정렬 조건 세팅
     *
     * @param {array} colNames
     * @param {String} orderColName
     *
     * @memberOf dsgrid#
     */
    function setTableDnD(colNames, orderColName) {
        o.tableDnD = {colNames: colNames, orderColName: orderColName};
    }

    function setMessageTbodyShowHide(func) {
        o.messageTbodyShowHide = func;
    }

    function showHideMessageTbody() {
        o.$messageTbody.showHide(o.messageTbodyShowHide());
    }

    /**
     * 밸류 값 가져오기(jqGrid, dsGrid, dsGridHTC 동일 이름)
     *
     * @param {Number} rowVar
     * @param {String} colName
     * @returns {*|jQuery|null}
     *
     * @memberOf dsgrid#
     */
    function getValue(rowVar, colName) {
        var row = getRowIndex(rowVar);

        if (row == -1) {
            return null;
        }

        var ctrl = getControl(row, colName);

        if (ctrl == null) {
            return o.ds.value(row, colName);
        }

        return jQuery(ctrl).val();
    }

    /**
     * 밸류 값 세팅
     *
     * @param {Number} rowVar
     * @param {String} colName
     * @param {String} value
     *
     * @memberOf dsgrid#
     */
    function setValue(rowVar, colName, value) {
        var row = getRowIndex(rowVar);

        if (row == -1) {
            return;
        }

        o.ds.value(row, colName, value);
    }

    function initialize() {
        var $headTr = jQuery('<tr>').appendTo(o.$thead);
        var $footTr = null;

        if (o.totalInfo != null && o.totalInfo.columns != null && o.totalInfo.columns.length > 0) {
            o.$tfoot = jQuery('<tfoot>').appendTo(o.$table);
            $footTr = jQuery('<tr>').appendTo(o.$tfoot);
        }

        function addRowNum() {
            if (o.options.rownumbers == true) {
                jQuery('<col>').attr({"width": o.options.rownumWidth}).appendTo(o.$colgroup);
                jQuery('<th>').addClass("ui-widget-header").appendTo($headTr).text("No");
                if ($footTr != null) {
                    jQuery('<th>').addClass("ui-widget-header").appendTo($footTr).prop("innerText", o.totalInfo.label);
                }
            }
        }

        function addRowCheck() {
            if (o.rowCheckVisible == true) {
                jQuery('<col>').attr({"name": "col_check", "width": "30px"}).appendTo(o.$colgroup);
                jQuery('<th>').attr({"name": "col_check"}).addClass("ui-widget-header").appendTo($headTr);
                if ($footTr != null) {
                    jQuery('<th>').addClass("ui-widget-header").appendTo($footTr).prop("innerText", o.totalInfo.label);
                }
                o.$headCheck = jQuery('<input>').attr({"type": "checkbox"}).appendTo($headTr.children('th:last')).click(function () {
                    o.$dataTbody.children('tr').children('td[name="col_check"]').children('input:checkbox:enabled:visible').prop("checked", this.checked);
                });
            }
        }

        if (o.config("column.rowNumCheckReverse") != true) {
            addRowNum();
            addRowCheck();
        } else {
            addRowCheck();
            addRowNum();
        }

        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            var colInfo = o.columns[i];

            if (colInfo.hidden != true || !(jQuery.browser.msie && Number(jQuery.browser.version) < 8)) {
                var $col = jQuery('<col>').attr({
                    "id": "col_" + colInfo.name,
                    "width": colInfo.width
                }).appendTo(o.$colgroup);

                if (colInfo.width == "*") {
                    $col.css({"width": "100%"});
                }
            }

            var $th = jQuery('<th>').attr({"id": "th_" + colInfo.name}).data({"colInfo": colInfo}).addClass("ui-widget-header").html('<div style="display:inline;">' + colInfo.label + '</div>').appendTo($headTr);

            $th.attr("title", $th.text());

            if (colInfo.nowrap == "both" || colInfo.nowrap == "head") {
                setEllipsis($th);
            }

            if (o.edit == true && colInfo.require == true) {
                $th.prepend(jQuery('<span>').addClass("require").text("*"));
            }

            if ($footTr == null) {
                continue;
            }

            if (jQuery.inArray(colInfo.name, o.totalInfo.columns) != -1) {
                var $control = jQuery('<div>').attr({"readOnly": true}).control("any-number");
                jQuery('<td>').attr({
                    "id": "tf_" + colInfo.name,
                    "totalColumn": colInfo.name
                }).appendTo($footTr).append($control);
                if (colInfo.controlattr != null) {
                    if (colInfo.controlattr.thousandsSeparator != null) {
                        $control.prop("thousandsSeparator", colInfo.controlattr.thousandsSeparator);
                    }
                    if (colInfo.controlattr.digits != null) {
                        $control.prop("digits", colInfo.controlattr.digits);
                    }
                }
            } else if ($footTr.children('td[totalColumn]').length == 0) {
                jQuery('<th>').addClass("ui-widget-header").appendTo($footTr).prop("innerText", o.totalInfo.label);
            } else {
                jQuery('<td>').attr({"id": "tf_" + colInfo.name}).css({"text-align": "center"}).text("-").appendTo($footTr);
            }
        }

        if (o.groupHeaders != null) {
            var $groupHeadTr = jQuery('<tr>').prependTo(o.$thead);
            var $headThs = $headTr.children('th');
            for (var i = 0, ii = $headThs.length; i < ii; i++) {
                var $th = jQuery('<th>').addClass($headThs.eq(i).attr("class")).appendTo($groupHeadTr);
                if ($headThs.eq(i).attr("name") == "col_check") {
                    $th.append($headThs.eq(i).children('input:checkbox'));
                } else {
                    $th.html($headThs.eq(i).html());
                    var colInfo = $headThs.eq(i).data("colInfo");
                    if (colInfo != null) {
                        $th.attr("title", $th.text());
                    }
                }
            }
            var $groupHeadThs = $groupHeadTr.children('th');
            for (var i = 0, ii = o.groupHeaders.length; i < ii; i++) {
                var gh = o.groupHeaders[i];
                var start = $headTr.children('th#th_' + gh.start).index();
                var end = $headTr.children('th#th_' + gh.end).index();
                for (var j = start; j <= end; j++) {
                    $groupHeadThs.eq(j).attr("grouping-column", "true").html('<div style="display:inline;">' + gh.label + '</div>').attr("colspan", j == start ? end - start + 1 : 1).showHide(j == start);
                    $groupHeadThs.eq(j).attr("title", $groupHeadThs.eq(j).text());
                }
            }
            for (var i = $groupHeadThs.length - 1; i >= 0; i--) {
                if ($groupHeadThs.eq(i).attr("grouping-column") == "true") {
                    continue;
                }
                $groupHeadThs.eq(i).attr("rowspan", 2);
                $headThs.eq(i).remove();
            }
        }

        resetDisplay();
    }

    function addTBodyRow(data, dsIndex) {
        o.rowId++;

        var row = o.$dataTbody.children('tr').length;
        var $tr = jQuery('<tr>').attr({"id": o.rowId}).appendTo(o.$dataTbody);

        if (o.tableDnD != null) {
            $tr.data("tableDnD", true);
        }

        if (o.ds.rowCount() <= row) {
            dsIndex = o.ds.addRow(data);
        }

        $tr.data("ds-index", dsIndex);

        function addRowNum() {
            if (o.options.rownumbers == true) {
                var $th = jQuery('<th>').attr({"name": "=ROW-NUM="}).addClass("ui-widget-header").appendTo($tr).text(function () {
                    return row + 1;
                }());
                if (o.tableDnD != null && jQuery.inArray(true, o.tableDnD.colNames) != -1) {
                    $th.data("tableDnD", true);
                }
            }
        }

        function addRowCheck() {
            if (o.rowCheckVisible == true) {
                jQuery('<td>').attr({
                    "name": "col_check",
                    "align": "center"
                }).appendTo($tr).html('<input type="checkbox">');
            }
        }

        if (o.config("column.rowNumCheckReverse") != true) {
            addRowNum();
            addRowCheck();
        } else {
            addRowCheck();
            addRowNum();
        }

        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            var colInfo = o.columns[i];
            var $td = jQuery('<td>').attr({
                "name": "td_" + colInfo.name,
                "align": colInfo.align
            }).data({"colInfo": colInfo}).appendTo($tr);
            createControl($td, colInfo, data);
            $td.keydown(function (event) {
                var $this = jQuery(this);
                if (event.keyCode == 38) {
                    $this.parent().prev().children('td[name="' + $this.attr("name") + '"]').children().focus();
                } else if (event.keyCode == 40) {
                    $this.parent().next().children('td[name="' + $this.attr("name") + '"]').children().focus();
                }
            });
            if (o.tableDnD != null && jQuery.inArray(colInfo.name, o.tableDnD.colNames) != -1) {
                $td.data("tableDnD", true);
            }
        }

        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            var colInfo = o.columns[i];
            if (colInfo.calculate == null) {
                continue;
            }
            var $td = $tr.children('td[name="td_' + colInfo.name + '"]');
            var colInfo = $td.data("colInfo");
            var colNames = colInfo.calculate.split("+");
            for (var j = 0, jj = colNames.length; j < jj; j++) {
                var colName = any.text.trim(colNames[j]);
                $td.parent().children('td[name="td_' + colName + '"]').children().on("onChange", function () {
                    doCalculation(jQuery(this).parent().parent());
                }).keyup(function () {
                    doCalculation(jQuery(this).parent().parent());
                });
            }
        }

        for (var name in o.keyColumns) {
            if (o.keyColumns[name] == true) {
                $tr.prepend(jQuery('<input>').attr({
                    "type": "hidden",
                    "name": control.id + "_" + name,
                    "bind": o.ds.id + ":" + name,
                    "value": data == null ? null : data[name]
                }));
            }
        }

        if (o.totalInfo == null || o.totalInfo.columns == null) {
            return $tr;
        }

        for (var i = 0, ii = o.totalInfo.columns.length; i < ii; i++) {
            $tr.children('td[name="td_' + o.totalInfo.columns[i] + '"]').children().on("onChange", function () {
                resetTotal(jQuery(this).parent().data("colInfo"));
            }).keyup(function () {
                resetTotal(jQuery(this).parent().data("colInfo"));
            });
        }

        resetCalculation();

        return $tr;
    }

    function createControl($td, colInfo, rowData) {
        var attr = {"name": control.id + "_" + colInfo.name, "bind": o.ds.id + ":" + colInfo.name};

        attr.id = attr.name + "_" + (o.rowId - 1);

        var row = $td.parent().index();

        if (String(colInfo.control).toLowerCase() == "radio") {
            return addEvent(jQuery('<input>').attr({
                "type": "radio",
                "checked": (rowData != null && rowData[colInfo.name] == o.checkValue)
            }).attr(attr).appendTo($td)
                .defineProperty("value", {
                    get: function () {
                        return this.checked == true ? o.checkValue : o.uncheckValue;
                    }
                }));
        }

        if (String(colInfo.control).toLowerCase() == "check") {
            return addEvent(jQuery('<input>').attr({
                "type": "checkbox",
                "checked": (rowData != null && rowData[colInfo.name] == o.checkValue)
            }).attr(attr).appendTo($td)
                .defineProperty("value", {
                    get: function () {
                        return this.checked == true ? o.checkValue : o.uncheckValue;
                    }
                }));
        }

        if (colInfo.style != null) {
            $td.css(any.object.parse({}, colInfo.style, ";", ":"));
        }

        var $control;

        if (colInfo.control == null && o.actions[colInfo.name] != null && (o.actions[colInfo.name].check == null || o.actions[colInfo.name].check.apply(control, [rowData, $td.parent().attr("id"), colInfo.name]) == true)) {
            $control = jQuery('<span>').addClass("link").click(function () {
                var $tr = jQuery(this).parents('tr').eq(0);
                o.actions[colInfo.name].action.apply(control, [getRowData($tr.index()), $tr.attr("id"), colInfo.name]);
            });
        } else {
            $control = jQuery('<' + (colInfo.controltag == null ? 'div' : colInfo.controltag) + '>');
        }

        $control.attr(attr).data({"grid": control, "grid-row-id": String(o.rowId), "grid-column": colInfo});

        if (colInfo.controlattr != null) {
            for (var name in colInfo.controlattr) {
                if (o.codeDataDisable != true) {
                    $control.attr(name, colInfo.controlattr[name]);
                    continue;
                }

                if (name.toLowerCase() == "depend") {
                    continue;
                }

                if (name.toLowerCase() != "codedata" || rowData == null) {
                    $control.attr(name, colInfo.controlattr[name]);
                    continue;
                }

                var codeData = colInfo.controlattr[name];

                for (var key in rowData) {
                    codeData = any.text.replaceAll(codeData, "{#" + key + "}", rowData[key]);
                }

                if (colInfo.controlattr.depend != null) {
                    var depends = colInfo.controlattr.depend.split(",");
                    for (var i = 0, ii = depends.length; i < ii; i++) {
                        codeData += ("," + rowData[any.text.trim(depends[i])]);
                    }
                }

                $control.attr("dsgridCodeData_" + control.id + "_" + o.controlIndex, codeData);
            }
        }

        if ((o.edit != true || colInfo.edit != true) && colInfo.editForced != true) {
            $control.attr("readOnly", true);
            if (colInfo.nowrap == "both" || colInfo.nowrap == "data") {
                setEllipsis($control);
            }
        }

        addEvent($control);

        if (rowData != null) {
            rowData[$control.get(0).id] = rowData[colInfo.name];
        }

        $control.appendTo($td).control(colInfo.control, function (event, controlName) {
            if (controlName != null && controlName != colInfo.control) {
                return;
            }
            if (colInfo.align != null && colInfo.align != "left" && $control.element() != null && $control.element().tag() != "SELECT") {
                $control.element().css("text-align", colInfo.align);
            }
            if (rowData != null) {
                $control.val($control.get(0).isObjectValueSet == true ? rowData : rowData[colInfo.name]);
            }
            if (colInfo.controlinit != null) {
                colInfo.controlinit.apply($control.get(0), [row]);
            }
            if (((o.edit == true && colInfo.edit == true) || colInfo.editForced == true) && o.keyColumns != null && colInfo.name in o.keyColumns) {
                if (colInfo.control == "any-text") {
                    $control.element().on("blur", function () {
                        var $this = jQuery(this).parent();
                        if (checkKeyValues($this.parent().parent()) != true) {
                            $this.val("");
                        }
                    });
                }
                if (colInfo.control == "any-select" || colInfo.control == "any-search") {
                    $control.on("onChange", function () {
                        var $this = jQuery(this);
                        if (checkKeyValues($this.parent().parent()) != true) {
                            $this.val("");
                        }
                    });
                }
            }
        });

        if ($control.controlName() == null) {
            $control.defineProperty("value", {
                get: function () {
                    if (colInfo.formatter != null && typeof (colInfo.formatter) === "function" && colInfo.hiddenValue === true) {
                        return jQuery(this).children('input:hidden[name="' + colInfo.name + '.value"]').val();
                    }
                    return jQuery(this).prop("innerText");
                },
                set: function (val) {
                    if (colInfo.formatter != null && typeof (colInfo.formatter) === "function") {
                        jQuery(this).html(colInfo.formatter(rowData, row, colInfo.name)).controls();
                        $td.attr("title", jQuery(this).prop("innerText"));
                        if (colInfo.hiddenValue === true) {
                            jQuery('<input>').attr({
                                type: "hidden",
                                name: colInfo.name + ".value"
                            }).appendTo(this).val(val);
                        }
                    } else {
                        jQuery(this).prop("innerText", val).attr("title", val);
                        $td.attr("title", val);
                    }
                }
            });
            if (rowData != null) {
                $control.val(rowData[colInfo.name]);
            }
        }

        if (o.edit == true && colInfo.require == true) {
            $control.attr("require-enable", true).data("require-name", colInfo.label);
        }

        $control.on("onChange", function () {
            o.$control.fire("onChange", {control: this, row: row, colName: colInfo.name, colInfo: colInfo});
        });

        return $control;

        function addEvent($control) {
            var events = o.events[colInfo.name];

            if (events != null) {
                for (var i = 0, ii = events.length; i < ii; i++) {
                    $control.on(events[i].name, {handler: events[i].handler}, function (event) {
                        event.data.handler.apply(this, [event, event.data.row = row]);
                    });
                }
            }

            return $control;
        }
    }

    function setEllipsis($elem) {
        $elem.css({
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "-o-text-overflow": "ellipsis"
        });
    }

    function checkKeyValues($tr) {
        var result = true;
        var values = {};

        for (var name in o.keyColumns) {
            values[name] = $tr.children('td[name="td_' + name + '"]').children().val();
            if (values[name] == "") {
                return true;
            }
        }

        o.$dataTbody.children('tr').each(function () {
            var $this = jQuery(this);
            if ($this[0] == $tr[0] || !$this.is(':visible')) {
                return true;
            }
            for (var name in o.keyColumns) {
                if ($this.children('td[name="td_' + name + '"]').children().val() != values[name]) {
                    return true;
                }
            }
            result = false;
            return false;
        });

        return result;
    }

    function getEdit() {
        return o.edit;
    }

    /**
     * 불능화 가져오기
     * 
     * @returns {*|boolean}
     *
     * @memberOf dsgrid#
     */
    function getDisabled() {
        return o.disabled;
    }

    /**
     * 불능화 세팅
     * 
     * @param {String} val
     *
     * @memberOf dsgrid#
     */
    function setDisabled(val) {
        o.disabled = (String(val).toLowerCase() == "disabled" || any.object.toBoolean(val, true));

        o.ds.disabled = o.disabled;

        if (o.disabled != true && o.$disabledDiv == null) {
            return;
        }

        if (o.$disabledDiv == null) {
            o.$disabledDiv = jQuery('<div>').css({
                "position": "absolute",
                "left": "0px",
                "top": "0px",
                "width": "100%",
                "height": "100%",
                "display": "none"
            });
            o.$disabledDiv.css({"background-color": "#dddddd", "opacity": "0.6"});
            o.$disabledDiv.appendTo(control);
        }

        o.$control.css({"position": "relative"});

        o.$disabledDiv.showHide(o.disabled);
    }

    function getRowCount(visible) {
        if (o.disabled == true) {
            return -1;
        }

        if (visible == true) {
            return o.$dataTbody.children('tr:visible').length;
        }

        return o.$dataTbody.children('tr').length;
    }

    function getJsonObject() {
        if (o.disabled == true) {
            return null;
        }

        return o.ds.toJSON();
    }

    function setJsonObject(val) {
        if (o.disabled == true) {
            return;
        }

        if (o.$control.data("grid") == null) {
            o.ds.loadData(val, true);
        } else {
            window.setTimeout(function () {
                o.ds.loadData(val, true);
            });
        }
    }

    function getJsonString() {
        if (o.disabled == true) {
            return null;
        }

        return o.ds.jsonString();
    }

    function setJsonString(val) {
        if (o.disabled == true) {
            return;
        }

        if (o.$control.data("grid") == null) {
            o.ds.load(val);
        } else {
            window.setTimeout(function () {
                o.ds.load(val);
            });
        }
    }

    function getCheckRequire() {
        return getRowCount(true) > 0;
    }

    function isCodeDataDisable() {
        return o.codeDataDisable == true;
    }

    function isDataLoading() {
        return o.dataLoading == true;
    }

    function doCalculation($tr) {
        $tr.children('td').each(function () {
            var $td = jQuery(this);
            var colInfo = $td.data("colInfo");

            if (colInfo == null || colInfo.calculate == null) {
                return true;
            }

            var colNames = colInfo.calculate.split("+");
            var maxDigits = 0;

            for (var i = 0, ii = colNames.length; i < ii; i++) {
                var digits = getColumnDigits(getColumn(colNames[i]), 0);
                if (digits > maxDigits) {
                    maxDigits = digits;
                }
            }

            var pow = Math.pow(10, maxDigits);
            var value = 0;

            for (var i = 0, ii = colNames.length; i < ii; i++) {
                value += Number($tr.children('td[name="td_' + any.text.trim(colNames[i]) + '"]').children().val()) * pow;
            }

            $td.children().val(String((value / pow).toFixed(getColumnDigits(colInfo, 0))));

            resetTotal(colInfo);
        });
    }

    function resetTotal(colInfo) {
        if (colInfo == null) {
            return;
        }

        var digits = getColumnDigits(colInfo, 0);
        var pow = Math.pow(10, digits);
        var total = 0;

        o.$dataTbody.find('td[name="td_' + colInfo.name + '"]').each(function () {
            var $this = jQuery(this);
            if ($this.parent().data("delete") != 1) {
                total += Number($this.children().val()) * pow;
            }
        });

        o.$tfoot.find('td#tf_' + colInfo.name).children().val(String((total / pow).toFixed(digits)));

        o.$control.fire("onResetTotal", [colInfo]);
    }

    function getColumnDigits(colInfo, defaultValue) {
        if (colInfo == null) {
            return defaultValue;
        }
        if (colInfo.controlattr == null) {
            return defaultValue;
        }
        if (colInfo.controlattr.digits == null) {
            return defaultValue;
        }

        return colInfo.controlattr.digits;
    }

    function resetCalculation() {
        o.$dataTbody.children('tr').each(function () {
            doCalculation(jQuery(this));
        });

        if (o.totalInfo == null) {
            return;
        }

        for (var i = 0, ii = o.totalInfo.columns.length; i < ii; i++) {
            resetTotal(getColumn(o.totalInfo.columns[i]));
        }
    }

    function resetCodeData() {
        var columns = [];

        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            var colInfo = o.columns[i];

            if (colInfo.controlattr == null) {
                continue;
            }

            if (colInfo.controlattr.depend != null || colInfo.controlattr.codeData != null || colInfo.controlattr.codedata != null) {
                columns.push(colInfo);
            }
        }

        if (columns.length == 0) {
            o.codeDataDisable = null;
            return;
        }

        any.loading(true).show();

        any.ready().check(function () {
            any.codedata("dsgridCodeData_" + control.id + "_" + o.controlIndex).initialize(function () {
                for (var i = 0, ii = columns.length; i < ii; i++) {
                    var colInfo = columns[i];

                    if (colInfo.controlattr.depend == null || colInfo.controlattr.depend == "") {
                        continue;
                    }

                    o.$dataTbody.find('[name="' + control.id + '_' + colInfo.name + '"]').each(function () {
                        this.setDepend(colInfo.controlattr.depend, colInfo.controlattr.codeData);
                    });
                }

                o.codeDataDisable = null;

                any.loading(true).hide();
            });
        });
    }

    function resetRowNumbers(tr) {
        if (o.options.rownumbers == true) {
            o.$dataTbody.find('th[name="=ROW-NUM="]:visible').each(function (index) {
                jQuery(this).text(index + 1);
            });
        }

        if (o.tableDnD != null && o.tableDnD.orderColName != null) {
            if (tr != null) {
                var $tr = jQuery(tr);
                o.ds.moveRow($tr.data("ds-index"), $tr.index());
                o.$dataTbody.children('tr').each(function (index) {
                    jQuery(this).data("ds-index", index);
                });
            }

            var orderNo = 1;

            o.$dataTbody.children('tr').each(function (index) {
                if (jQuery(this).is(':visible')) {
                    o.ds.value(index, o.tableDnD.orderColName, orderNo++);
                }
            });
        }
    }

    function resetDisplay(row, $tr) {
        o.$control.attr("any--proxy--grid", o.edit == true);

        o.$buttons.showHide(o.buttonVisible);

        var colspans = {};

        if (jQuery.browser.msie && Number(jQuery.browser.version) < 9) {
            var colspanName = null;
            for (var i = 0, ii = o.columns.length; i < ii; i++) {
                if (o.columns[i].hidden != true) {
                    colspanName = o.columns[i].name;
                    colspans[colspanName] = 1;
                } else if (colspanName != null) {
                    colspans[colspanName]++;
                }
            }
        }

        if (o.edit == true) {
            ($tr == null ? o.$dataTbody.children('tr') : $tr).each(function () {
                var $this = jQuery(this);
                var rowData = o.ds.rowData(row == null ? $this.index() : row);
                var rowId = $this.attr("id");
                var rowEditable = (o.rowEditableFunction == null || o.rowEditableFunction.apply(control, [rowData, rowId]) == true);
                var $checkTd = $this.children('td[name="col_check"]');

                $this.data({"rowEditable": rowEditable});

                if ($checkTd.length == 0) {
                    return;
                }

                var rowDeletable = (o.rowDeletableFunction == null || o.rowDeletableFunction.apply(control, [rowData, rowId]) == true);
                var showHide = (rowDeletable && rowEditable);

                $checkTd.children('input:checkbox').prop("disabled", !showHide).showHide(showHide);
                $this.data({"rowDeletable": rowDeletable});
            });
        }

        for (var i = 0, ii = o.columns.length; i < ii; i++) {
            var colInfo = o.columns[i];
            var $column = getColumnCells(colInfo.name);
            $column.showHide(colInfo.hidden != true);
            if (colspans[colInfo.name] != null && colspans[colInfo.name] > 1) {
                $column.attr("colspan", colspans[colInfo.name]);
            }
            ($tr == null ? o.$dataTbody.find('td[name="td_' + colInfo.name + '"]') : $tr.children('td[name="td_' + colInfo.name + '"]')).each(function () {
                var $this = jQuery(this);
                var $ctrl = $this.children();
                if ($ctrl.length == 0) {
                    return true;
                }
                var readOnly = ((o.edit != true || colInfo.edit != true || $this.parent().data("rowEditable") != true || $ctrl.prop("readOnly") == true) && colInfo.editForced != true);
                if ($ctrl[0].type == "radio" || $ctrl[0].type == "checkbox") {
                    $ctrl.prop("disabled", readOnly && $ctrl[0].checked != true);
                } else {
                    $ctrl.prop("readOnly", readOnly);
                }
                if (readOnly && $ctrl[0].type == "checkbox" && $ctrl[0].checked == true) {
                    $ctrl.click(function () {
                        this.checked = true;
                    });
                }
            });
        }

        var messageTbodyEmpty = (o.$messageTbody.children().length == 0);

        if (messageTbodyEmpty == true) {
            jQuery('<tr>').appendTo(o.$messageTbody).append(jQuery('<td>').css({
                "text-align": "center",
                "color": "gray"
            }).text("(No data)"));
        }

        o.$messageTbody.find('td').attr("colspan", function () {
            var colspan = 0;
            o.$thead.children('tr:first').children('th').each(function () {
                if (jQuery(this).css("display") == "none") {
                    return true;
                }
                var cols = parseInt(jQuery(this).attr("colspan"), 10);
                colspan += (isNaN(cols) ? 1 : cols);
            });
            return Math.max(colspan, 1);
        }());

        if (messageTbodyEmpty != true) {
            showHideMessageTbody();
        }

        resetRowNumbers();

        if (o.$tfoot != null) {
            var $firstTh;
            var theadThCount = 0;
            var tfootTdCount = 0;

            o.$tfoot.find('th').each(function () {
                var $this = $(this);

                if ($firstTh == null && $this.css("display") != "none") {
                    $firstTh = $this;
                } else if ($firstTh != null) {
                    $this.hide();
                }
            });

            o.$thead.find('th:not([grouping-column="true"])').each(function () {
                var $this = $(this);

                if ($this.css("display") != "none") {
                    theadThCount++;
                }
            });

            o.$tfoot.find('td').each(function () {
                var $this = $(this);

                if ($this.css("display") != "none") {
                    tfootTdCount++;
                }
            });

            $firstTh.attr("colspan", theadThCount - tfootTdCount);
        }

        applyRowspan();

        if (o.tableDnD != null) {
            any.loadScript(any.home + "/controls/any-dsgrid/any-dsgrid.tablednd.js", function () {
                o.$table.dsgridDnD({
                    onDrop: function (table, tr) {
                        resetRowNumbers(tr);
                        o.$control.fire("onTableDnD", [table, tr]);
                    }
                });
            });
        }
    }
};




















































// ---------------------------------------------------------------------------------------------------------------------

/**
 * 디에스 그리드 에이치티씨
 *
 * @constructs dsgridHTC
 */
dsgridHTC = function () {

    var element;

    var gControlIdSuffix = "_" + element.id + "_" + (window.dynamicControlIndex++);

    var gHeaderInfo = [];
    var gSortingInfo = [];
    var gDefaultSortingInfo = [];
    var gGridActions = {};
    var gCheckColumns = {};
    var gImageColumns = {};
    var gImageObjects = {};
    var gPagingParams = {};
    var gConfigInfo = {};
    var gMouseDown = {};
    var gBeforeSort = {};
    var gBeforeCheck = {};
    var gAutoHeight = false;
    var gDisableMessage = false;
    var gDisableRowHilight = false;

    var gAutoColumn = true;
    var gUserResized = false;
    var gFixedColumns = {};

    var gCheckColumnIcon = { 0:"□", 1:"■" };

    var gSortTypeMarker = { ASC:"▲", DESC:"▼" };
    var gHilightRow;

    var gConfigLoaded = { column:false, sorting:false };
    var gGridPath;
    var gGridId;

    var gContextMenu;
    var gTooltip;

    var gMessageFrame = { fg:{} };
    var gLoadingFrame;
    var gDisableFrame;
    var gHeaderArea;
    var gOutlineInfo;
    var gEditable;
    var gResizeHeight;
    var gLoader;


    /**
     * 겟 헤드 아레아
     *
     * @returns {*}
     *
     * @memberOf dsgridHTC#
     */
    function getHeaderArea() {
        return gHeaderArea;
    }

    function setHeaderArea(vArea) {
        if (typeof (vArea) == "string") {
            gHeaderArea = element.document.getElementById(vArea);
        } else {
            gHeaderArea = vArea;
        }

        if (gHeaderArea == null) return;

        gHeaderArea.style.whiteSpace = "nowrap";

        gHeaderArea.messageLabel = gHeaderArea.appendChild(element.document.createElement('<label>'));
        gHeaderArea.messageLabel.style.display = (gHeaderArea.hideMessageLabel == "true" ? "none" : "");

        if (element.pagingType != 0) {
            var pagingSizeOptions = [10, 15, 20, 30, 50, 100, 200];
            gHeaderArea.pagingSizeSelector = gHeaderArea.appendChild(element.document.createElement('<select class="combo last">'));
            for (var i = 0; i < pagingSizeOptions.length; i++) {
                gHeaderArea.pagingSizeSelector.options.add(new Option(cfGetMessage(Message.grid.message.pageRows, [pagingSizeOptions[i]]), pagingSizeOptions[i]));
            }
            gHeaderArea.pagingSizeSelector.onchange = function () {
                resetPagingSize(this.value);
            }
        }

        gHeaderArea.iconArea = gHeaderArea.appendChild(element.document.createElement('<div class="icon">'));

        var btn;

        btn = gHeaderArea.iconArea.appendChild(element.document.createElement('<button type="button" style="margin-left:0px;">'));
        btn.appendChild(element.document.createElement('<img src="' + any.meta.contextPath + '/ui/img/button/btn_excel_down.gif">'));
        btn.onclick = openExcelDownload;

        if (element.configType != 0) {
            btn = gHeaderArea.iconArea.appendChild(element.document.createElement('<button type="button" style="margin-left:1px;">'));
            btn.appendChild(element.document.createElement('<img src="' + any.meta.contextPath + '/ui/img/button/btn_setting.gif">'));
            btn.onclick = openConfig;
        }
    }

    function addHeaderRow() {
        if (element.fg.FixedRows > gHeaderInfo.length) return;

        element.fg.Rows++;
        element.fg.FixedRows++;
        // element.fg.RowHeight(element.fg.FixedRows - 1) = 350;
        // element.fg.MergeRow(element.fg.FixedRows - 1) = true;
    }

    function addHeader(arr) {
        if (element.fg.FixedRows > gHeaderInfo.length) return;

        var header = [];

        for (var i = 0; i < arr.length; i++) {
            header.push(arr[i] == "" ? header[i - 1] : arr[i]);
        }

        gHeaderInfo.push(header);

        addHeaderRow();
    }

    function addColumn(obj) {
        if (obj.id == null) return;

        gAutoColumn = false;

        addHeaderRow();

        element.fg.Cols++;

        var c = element.fg.Cols - 1;
        var enum_align = { left: 1, center: 4, right: 7 };
        var enum_dataType = { check: 11, string: 8, number: 3, date: 8, image: -40 };

        // element.fg.ColData(c) = { info: {} };

        for (var item in obj) {
            element.fg.ColData(c).info[item] = obj[item];
        }

        element.fg.ColData(c).info.index = c;
        element.fg.ColData(c).info.id2 = (obj.id2 == null ? obj.id : obj.id2);
        element.fg.ColData(c).info.name = (obj.name == null ? obj.id : obj.name);
        element.fg.ColData(c).info.align = (obj.align == null ? "left" : obj.align).toLowerCase();
        element.fg.ColData(c).info.type = (obj.type == null ? "string" : obj.type).toLowerCase();
        element.fg.ColData(c).info.nouse = (obj.nouse == null ? false : obj.nouse);
        element.fg.ColData(c).info.hide = (obj.hide == null ? false : obj.hide);
        element.fg.ColData(c).info.sort = (obj.sort == null ? false : obj.sort);
        element.fg.ColData(c).info.rownum = (obj.rownum == null ? "ASC" : obj.rownum);
        element.fg.ColData(c).info.editMask = obj.editMask;

        switch (element.fg.ColData(c).info.id) {
            case "rowNum":
                element.fg.ColData(c).info.sort = false;
                break;
            case "rowChk":
                if (element.fg.ColData(c).info.checkToRadio != true) {
                    element.fg.ColData(c).info.name = gCheckColumnIcon[0];
                }
                element.fg.ColData(c).info.sort = false;
                break;
        }

        if (typeof (element.fg.ColData(c).info.text) == "string") {
            element.fg.ColData(c).info.textString = element.fg.ColData(c).info.text;
            element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return element.fg.ColData(c).info.textString; }
        }

        if (element.fg.ColData(c).info.text == null) {
            if (element.fg.ColData(c).info.id == "rowNum") {
                if (element.pagingType == 0) {
                    element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return getRowNum(row); }
                } else {
                    element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return value; }
                }
            } else if (element.fg.ColData(c).info.type == "check") {
                element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return (Number(value) == 1 ? 1 : 0); }
            } else if (element.fg.ColData(c).info.type == "date") {
                element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return cfGetFormatDate(value); }
            } else if (element.fg.ColData(c).info.type == "number") {
                element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return (isNaN(parseInt(value, 10)) ? "" : Number(value)); }
            } else if (element.fg.ColData(c).info.format != null && element.fg.ColData(c).info.format.indexOf("X") != -1) {
                element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) {
                    if (element.fg.ColIndex(colId) != -1) {
                        return cfGetFormatString(value, element.fg.ColData(element.fg.ColIndex(colId)).info.format);
                    }
                    return value;
                }
            } else {
                element.fg.ColData(c).info.text = function (gr, fg, row, colId, value) { return value; }
            }
        }

        // for (var r = 0; r < gHeaderInfo.length; r++) {
        //     element.fg.TextMatrix(r, c) = (gHeaderInfo[r][c] == null ? element.fg.ColData(c).info.name : gHeaderInfo[r][c]);
        //     if (element.fg.TextMatrix(element.fg.FixedRows - 1, c) == element.fg.TextMatrix(element.fg.FixedRows - (gHeaderInfo.length - r), c)) {
        //         element.fg.MergeCol(c) = true;
        //     }
        // }
        //
        // element.fg.ColKey(c) = element.fg.ColData(c).info.id;
        // element.fg.TextMatrix(element.fg.FixedRows - 1, c) = element.fg.ColData(c).info.name;
        // if (element.fg.ColData(c).info.width != null) {
        //     element.fg.ColWidth(c) = element.fg.ColData(c).info.width * 15;
        // }
        // element.fg.ColAlignment(c) = enum_align[element.fg.ColData(c).info.align];
        // element.fg.ColDataType(c) = enum_dataType[element.fg.ColData(c).info.type];
        // element.fg.ColHidden(c) = (element.fg.ColData(c).info.nouse == true || element.fg.ColData(c).info.hide == true);
        // if (element.fg.ColData(c).info.format != null && element.fg.ColData(c).info.format.indexOf("X") == -1) {
        //     element.fg.ColFormat(c) = element.fg.ColData(c).info.format;
        // }
        //
        // if (element.fg.ColData(c).info.sort == true) {
        //     for (var r = 0; r < element.fg.FixedRows; r++) {
        //         if (element.fg.TextMatrix(r, c) != element.fg.ColData(c).info.name) continue;
        //         element.fg.Cell(flexcpForeColor, r, c, r, c) = "&H800000";
        //     }
        // }
        //
        // if (element.fg.ColData(c).info.codeData != null) {
        //     var codeDatas = any.getCodeData(element.fg.ColData(c).info.codeData);
        //     if (codeDatas != null) {
        //         var comboList = [];
        //         if (element.fg.ColData(c).info.firstName != null) {
        //             comboList.push("#;");
        //         }
        //         for (var i = 0; i < codeDatas.length; i++) {
        //             comboList.push("#" + codeDatas[i].data.CODE + ";" + any.getCodeName(codeDatas[i].data));
        //         }
        //         element.fg.ColComboList(c) = comboList.join("|");
        //     }
        // }
        //
        // element.fg.Cell(flexcpAlignment, 0, c, element.fg.FixedRows - 1, c) = flexAlignCenterCenter;
        // element.fg.Cell(flexcpPictureAlignment, 0, c, element.fg.FixedRows - 1, c) = flexPicAlignCenterCenter;
    }

    function setFixedColumn(sFixedColId, sFrozenColId) {
        gFixedColumns = { fixedColId: sFixedColId, frozenColId: sFrozenColId };

        if (sFixedColId != null && element.fg.ColIndex(sFixedColId) != -1) {
            element.fg.FixedCols = element.fg.ColIndex(sFixedColId) + 1;
        }
        if (sFrozenColId != null && element.fg.ColIndex(sFrozenColId) != -1) {
            element.fg.FrozenCols = element.fg.ColIndex(sFrozenColId) + 1 - element.fg.FixedCols;
        }
    }

    function setSorting(sName, sType) {
        gSortingInfo = [];

        addSorting(sName, sType, true);
    }


    /**
     * 정렬 기능(jqGrid, dsGridHTC 동일 이름)
     *
     * @param {String} name
     * @param {String} order
     *
     * @memberOf dsgridHTC#
     */
    function addSorting(sName, sType, bNotDefault) {
        if (sName == null || sName == "") return;

        try {
            if (element.fg.ColIndex(sName) != -1 && element.fg.ColData(element.fg.ColIndex(sName)).info.sort != true) return;
        } catch (ex) {
        }

        add(gSortingInfo);

        if (bNotDefault != true) {
            add(gDefaultSortingInfo);
        }

        function add(arr) {
            arr.push({ name: sName.trim(), type: (sType == null || sType == "" ? "ASC" : sType.trim().toUpperCase()) });
        }
    }

    function doSort(moveToFirst) {
        if (gSortingInfo.length == 0) return;

        for (var i = gSortingInfo.length - 1; i >= 0; i--) {
            vbSortGrid(element.fg.ColIndex(gSortingInfo[i].name), gSortingInfo[i].type, moveToFirst);
        }
    }

    function addAction(sColKey, oAction, iType, oCheck) {
        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx > -1 && element.fg.ColData(iColIdx) != null && element.fg.ColData(iColIdx).info.type == "check") {
            alert('Check column "' + sColKey + '" action is not available!');
            return;
        }

        gGridActions[sColKey] = { type: (iType == null ? 1 : iType), action: oAction, check: oCheck };

        putAction(sColKey);
    }

    /**
     * 액션 삭제(dsGridHTC, jqGrid 동일 이름)
     *
     * @param {String} sColKey
     */
    function delAction(sColKey) {
        gGridActions[sColKey] = null;

        if (element.fg.FixedRows == element.fg.Rows) return;

        var c = element.fg.ColIndex(sColKey);

        if (c == -1) return;

        // element.fg.Cell(flexcpForeColor, element.fg.FixedRows, c, element.fg.Rows - 1, c) = "&H000000";
    }

    function putAction(sColKey) {
        if (gMessageFrame.isShow == true) return;

        if (element.fg.FixedRows == element.fg.Rows) return;

        var gridAction = gGridActions[sColKey];

        if (gridAction == null) return;

        var c = element.fg.ColIndex(sColKey);

        if (c == -1) return;

        if (gridAction.check == null) {
            setActionStyle(element.fg.FixedRows, element.fg.Rows - 1, c);
            return;
        }

        for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
            if (gridAction.check(element, fg, r, sColKey) == false) continue;
            setActionStyle(r, r, c);
        }

        function setActionStyle(startRow, endRow, col) {
            // element.fg.Cell(flexcpForeColor, startRow, col, endRow, col) = "&HCA3C04";
        }
    }

    function getAction(sColKey) {
        return gGridActions[sColKey];
    }

    function setOutline(sRootName, sOutlineColKey, sLevelColKey, iExtendLevel) {
        gOutlineInfo = { rootName: sRootName, outlineColKey: sOutlineColKey, levelColKey: sLevelColKey, extendLevel: iExtendLevel };
    }

    function addCheck(sColKey, oCheckFunc) {
        gCheckColumns[sColKey] = oCheckFunc;

        putCheck(sColKey);
    }

    function putCheck(sColKey) {
        if (gMessageFrame.isShow == true) return;

        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx == -1) return;
        if (gCheckColumns[sColKey] == null) return;

        setPictureAlignment(iColIdx);

        var cpChecked;

        for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
            cpChecked = gCheckColumns[sColKey](element, fg, r, sColKey);
            if (cpChecked == null) cpChecked = flexNoCheckbox;
            if (cpChecked != flexNoCheckbox) element.fg.ColData(iColIdx).info.checkBoxExists = true;
            // element.fg.Cell(flexcpChecked, r, iColIdx) = cpChecked;
        }
    }

    function addImage(sColKey, oImageFunc) {
        gImageColumns[sColKey] = oImageFunc;
    }

    function getImage(src) {
        if (src == null) return null;

        if (gImageObjects[src] == null) {
            gImageObjects[src] = new Image();
            gImageObjects[src].src = src;
            gImageObjects[src].onerror = function () {
                this.isError = true;
            }
        }

        return gImageObjects[src];
    }

    function putImage(sColKey) {
        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx == -1) return;
        if (element.fg.Rows == element.fg.FixedRows) return;

        setPictureAlignment(iColIdx);

        if (element.fg.ColData(iColIdx) != null && element.fg.ColData(iColIdx).info != null && element.fg.ColData(iColIdx).info.image != null) {
            var img = getImage(element.fg.ColData(iColIdx).info.image);
            if (img == null) return;
            try {
                // element.fg.Cell(flexcpPicture, element.fg.FixedRows, iColIdx, element.fg.Rows - 1, iColIdx) = img.src;
            } catch (ex) {
                alert("[ERROR] Invalid Image!\n\n" + img.src);
            }
        } else if (gImageColumns[sColKey] != null) {
            for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                loadImage(r, sColKey);
            }
        }
    }

    function loadImage(iRowIdx, sColKey) {
        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx == -1) return;

        var img = getImage(gImageColumns[sColKey](element, fg, iRowIdx, sColKey));

        if (img == null) return;
        if (img.isError == true) return;

        try {
            // element.fg.Cell(flexcpPicture, iRowIdx, iColIdx) = img.src;
        } catch (ex) {
            window.setTimeout('document.getElementById("' + element.id + '").loadImage(' + iRowIdx + ', "' + sColKey + '");', 1);
        }
    }

    function loadData(vData) {
        var ds = (typeof (vData) == "object" ? vData : element.document.getElementById(vData));

        element.fg.ReDraw = 0;

        element.fg.Rows = element.fg.FixedRows;

        for (var i = 0; i < ds.rowCount; i++) {
            setRowData(addRow(), ds.rowData(i));
        }

        element.fg.ReDraw = 2;
    }

    function setBind(vData) {
        var ds = (typeof (vData) == "object" ? vData : element.document.getElementById(vData));

        ds.init();

        if (gMessageFrame.isShow == true) return;

        for (var c = 0; c < element.fg.Cols; c++) {
            ds.addCol(element.fg.ColKey(c));
        }

        for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
            var row = ds.addRow();
            for (var c = 0; c < element.fg.Cols; c++) {
                // ds.value(row, c) = getValue(r, element.fg.ColKey(c));
            }
            if (element.fg.RowData(r) == null || element.fg.RowData(r).data == null) continue;
            for (var item in element.fg.RowData(r).data) {
                // if (element.fg.ColIndex(item) == -1) ds.value(row, item) = getValue(r, item);
            }
        }
    }

    function setPictureAlignment(iColIdx) {
        if (element.fg.Rows == element.fg.FixedRows) return;

        // element.fg.Cell(flexcpPictureAlignment, element.fg.FixedRows, iColIdx, element.fg.Rows - 1, iColIdx) = element.fg.ColAlignment(iColIdx);
    }

    function doAction(iType) {
        if (gMessageFrame.isShow == true) return;

        var row = element.fg.MouseRow;
        var col = element.fg.MouseCol;

        if (row == -1) return;
        if (col == -1) return;

        for (var item in gGridActions) {
            if (gGridActions[item] == null) continue;
            if (gGridActions[item].type != iType) continue;
            if (element.fg.ColKey(col) == item && (gGridActions[item].check == null || gGridActions[item].check(element, fg, row, element.fg.ColKey(col)) == true)) {
                gGridActions[item].action(element, fg, row, element.fg.ColKey(col));
                break;
            }
        }
    }

    function toggleCheckBox(allCheck) {
        if (gMessageFrame.isShow == true) return;

        var row = element.fg.MouseRow;
        var col = element.fg.MouseCol;

        if (row == -1) return;
        if (col == -1) return;

        if (element.fg.ColData(col) == null) return;
        if (element.fg.ColData(col).info == null) return;
        if (element.fg.ColData(col).info.checkToRadio == true && allCheck == true) return;

        if (element.fg.ColData(col).info.id == "rowChk") {
            if (allCheck == true) {
                element.fg.ReDraw = 0;
                if (element.fg.ColData(col).info.type == "check") {
                    var value = (element.fg.TextMatrix(element.fg.FixedRows - 1, col) == gCheckColumnIcon[0] ? 1 : 0);
                    for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                        // element.fg.TextMatrix(r, col) = value;
                        if (element.fg.RowData(r) != null && element.fg.RowData(r).data != null) {
                            element.fg.RowData(r).data["rowChk"] = value;
                        }
                    }
                } else {
                    var check = (element.fg.TextMatrix(element.fg.FixedRows - 1, col) == gCheckColumnIcon[0] ? flexChecked : flexUnchecked);
                    for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                        if (element.fg.Cell(flexcpChecked, r, col) == flexNoCheckbox) continue;
                        // element.fg.Cell(flexcpChecked, r, col) = check;
                        if (element.fg.RowData(r) != null && element.fg.RowData(r).data != null) {
                            element.fg.RowData(r).data["rowChk"] = (check ? flexChecked : 0);
                        }
                    }
                }
                element.fg.ReDraw = 2;
            } else {
                setChecked(row, element.fg.ColKey(col), (getChecked(row, element.fg.ColKey(col)) == false));
            }
            setCheckHeader(col);
        } else if (element.fg.Cell(flexcpChecked, row, col) != 0) {
            setChecked(row, element.fg.ColKey(col), (getChecked(row, element.fg.ColKey(col)) == false));
        }
    }

    function getHeaderName(sColKey) {
        return element.fg.ColData(element.fg.ColIndex(sColKey)).info.name;
    }

    function setHeaderName(sColKey, sValue) {
        // element.fg.TextMatrix(element.fg.FixedRows - 1, element.fg.ColIndex(sColKey)) = sValue;
        element.fg.ColData(element.fg.ColIndex(sColKey)).info.name = sValue;
    }

    function getColumnInfo(sColKey) {
        var c = element.fg.ColIndex(sColKey);

        if (c != -1) return element.fg.ColData(c).info;
    }


    /**
     * 로더 가져오기 (jqGrid, dsgridHTC 동일 이름) (미사용)
     *
     * @returns {dataLoader}
     *
     * @memberOf dsgridHTC#
     */
    function getLoader() {
        if (gLoader == null) gLoader = new dataLoader();

        return gLoader;
    }

    function dataLoader() {
        var xhr;
        var params;
        var datas;
        var reloadObj;

        this.loading = false;
        this.executed = false;

        this.path;
        this.result;
        this.loadStartTime;
        this.loadEndTime;
        this.renderStartTime;
        this.renderEndTime;
        this.onStart;
        this.onSuccess;
        this.onFail;

        this.error = {};

        this.error.show = function () {
            xhr.error.show();
        }

        this.init = function () {
            if (this.loading == true) return;

            xhr = null;
            params = [];
            datas = [];
            reloadObj = null;

            this.path = null;
            this.result = null;
            this.loadStartTime = null;
            this.loadEndTime = null;
            this.onStart = null;
            this.onSuccess = null;
            this.onFail = null;

            for (var item in this.error) {
                if (item == "show") continue;
                this.error[item] = null;
            }

            try {
                new any.viewer().initialize();
            } catch (ex) {
            }
        }

        this.isReloading = function () {
            return (reloadObj != null);
        }

        this.addParam = function (sName, sValue) {
            if (this.loading == true) return;

            params.push({ name: sName, value: sValue });
        }

        this.addParamData = function (vDs) {
            if (this.loading == true) return;

            var ds = (typeof (vDs) == "object" ? vDs : element.document.getElementById(vDs));

            for (var i = 0; i < ds.colCount; i++) {
                this.addParam(ds.colId(i), ds.value(0, i));
            }
        }

        this.setParam = function (sName, sValue) {
            if (this.loading == true) return;

            for (var i = 0; i < params.length; i++) {
                if (params[i].name != sName) continue;
                params[i].value = sValue;
                return;
            }

            this.addParam(sName, sValue);
        }

        this.setParamData = function (vDs) {
            if (this.loading == true) return;

            var ds = (typeof (vDs) == "object" ? vDs : element.document.getElementById(vDs));

            for (var i = 0; i < ds.colCount; i++) {
                this.setParam(ds.colId(i), ds.value(0, i));
            }
        }

        this.getParam = function (sName) {
            if (params == null) return null;

            var values = [];

            for (var i = 0; i < params.length; i++) {
                if (params[i].name == sName) values.push(params[i].value);
            }

            return values;
        }

        this.addData = function (vData, sId) {
            var data;

            if (typeof (vData) == "object") {
                data = vData;
            } else {
                data = element.document.getElementById(vData);
                if (data == null) data = vData;
            }

            datas.push({ data: data, id: sId });
        }

        this.execute = function (keepPagingNo) {
            if (this.loading == true) return;
            if (this.path == null) return;

            for (var item in this.error) {
                if (item == "show") continue;
                this.error[item] = null;
            }

            this.loading = true;

            this.result = null;

            setMessage();
            setCheckHeader(element.fg.ColIndex("rowChk"));

            if (gLoader.onStart != null) {
                gLoader.onStart(element, fg);
            }

            xhr = new any.xmlHttp();

            xhr.path = this.path;

            if (element.pagingType != 0) {
                if (keepPagingNo != true) gPagingParams.no = 1;

                var pagingSort = [];

                for (var i = 0; i < gSortingInfo.length; i++) {
                    pagingSort.push(gSortingInfo[i].name + ":" + gSortingInfo[i].type);
                }

                xhr.addParam("_PAGING_TYPE_", element.pagingType);
                xhr.addParam("_PAGING_SIZE_", gPagingParams.size);
                xhr.addParam("_PAGING_NO_", gPagingParams.no);
                xhr.addParam("_PAGING_SORT_", pagingSort.join(","));
            }

            for (var i = 0; i < params.length; i++) {
                xhr.addParam(params[i].name, params[i].value);
            }

            var condXMLAvail = true;

            for (var i = 0; i < datas.length; i++) {
                if (datas[i].condXML == null) {
                    condXMLAvail = false;
                    break;
                }
            }

            if (reloadObj == null && (keepPagingNo != true || condXMLAvail != true)) {
                for (var i = 0; i < datas.length; i++) {
                    datas[i].condXML = datas[i].data.xml;
                    xhr.addData(datas[i].data, datas[i].id);
                }
            } else if (datas.length > 0) {
                var dataSetXML = [];

                dataSetXML.push('<?xml version="1.0" encoding="utf-8"?>');
                dataSetXML.push('<root>');
                for (var i = 0; i < datas.length; i++) {
                    dataSetXML.push(datas[i].condXML);
                }
                dataSetXML.push('</root>');

                xhr.addParam("_DATA_SET_XML_", dataSetXML.join("\n"));
            }

            this.loadStartTime = new Date();

            xhr.send();

            xhr.req.onreadystatechange = function () {
                if (xhr == null) return;
                if (xhr.req == null) return;
                if (xhr.req.readyState != 4) return;

                if (xhr.error() == true) {
                    for (var item in xhr.error) {
                        if (typeof (xhr.error[item]) != "function") gLoader.error[item] = xhr.error[item];
                    }
                    if (gLoader.onFail != null) {
                        gLoader.onFail(element, fg);
                    }
                    setGrid();
                    return;
                }

                var resText = xhr.req.responseText;

                gLoader.loadEndTime = new Date();

                xhr.req = null;
                xhr = null;

                if (resText == "") {
                    setGrid();
                    return;
                }

                try {

                    var resData = eval("(" + resText + ")");

                    try {
                        gLoader.result = resData.info;
                    } catch (ex) {
                    }

                    element.fg.ReDraw = 0;

                    if (gAutoColumn == true) {
                        setAutoColumn(resData.data.header);
                        gAutoColumn = true;
                    }

                    var limitCount = 8000;

                    if (resData.data.data.length > limitCount) {
                        element.fg.ReDraw = 2;
                        alert(cfGetMessage(Message.grid.message.limitCountOver, [cfGetFormatNumber(resData.data.data.length), cfGetFormatNumber(limitCount)]));
                        element.fg.ReDraw = 0;
                    }

                    gLoader.renderStartTime = new Date();

                    element.fg.Rows = element.fg.FixedRows + Math.min(resData.data.data.length, limitCount);

                    setAutoHeight();

                    for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                        // element.fg.RowData(r) = { data: resData.data.data[r - element.fg.FixedRows].data };
                    }

                    if (gOutlineInfo != null && gOutlineInfo.rootName != null) {
                        element.fg.Rows++;
                        // element.fg.RowPosition(element.fg.Rows - 1) = element.fg.FixedRows;
                        // element.fg.RowData(element.fg.FixedRows) = { data: createRowData([{ id: gOutlineInfo.outlineColKey, value: gOutlineInfo.rootName }, { id: gOutlineInfo.levelColKey, value: 0 }]) };
                        element.fg.Row = element.fg.FixedRows;
                    }

                    vbBindGrid();

                    if (gOutlineInfo != null) {
                        element.fg.MergeCells = flexMergeOutline;
                        element.fg.OutlineBar = flexOutlineBarSimpleLeaf;
                        element.fg.OutlineCol = element.fg.ColIndex(gOutlineInfo.outlineColKey);
                        for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                            // element.fg.RowOutlineLevel(r) = getValue(r, gOutlineInfo.levelColKey);
                            // element.fg.IsSubtotal(r) = true;
                            // element.fg.IsCollapsed(r) = flexOutlineCollapsed;
                        }
                        element.fg.Outline(gOutlineInfo.extendLevel);
                        element.fg.MergeCellsFixed = flexMergeFree;
                    }

                    if (gAutoColumn == true) {
                        for (var c = 0; c < element.fg.Cols; c++) {
                            setAutoColSize(c);
                        }
                    }

                    if (element.pagingType == 0) {
                        doSort();
                    }

                    setGrid();

                    if (gLoader.onSuccess != null) {
                        gLoader.onSuccess(element, fg);
                    }

                    if (gMessageFrame.isShow == true) {
                        element.fg.Subtotal(flexSTClear);
                    }

                } catch (ex) {
                    setGrid();
                    throw (ex);
                } finally {
                    element.fg.ReDraw = 2;
                }
            }
        }

        this.reload = function () {
            if (this.loading == true) return;

            reloadObj = {};
            reloadObj.row = element.fg.Row;
            reloadObj.topRow = element.fg.TopRow;
            reloadObj.col = element.fg.Col;
            reloadObj.leftCol = element.fg.LeftCol;

            this.execute(true);
        }

        this.download = function () {
            if (this.loading == true) return;

            var win = new any.window();
            win.path = "/ipms/com/control/grid/excel/ExcelDownload.jsp";
            win.arg.gr = element;
            win.arg.headerListDs = ds_headerList;
            win.arg.columnListDs = ds_columnList;
            win.arg.pagingType = element.pagingType;
            win.arg.pagingParams = gPagingParams;
            win.arg.gridSorting = gSortingInfo;
            win.arg.params = params;
            win.arg.datas = datas;
            win.arg.rowNumDir = element.rowNumDir;
            win.arg.checkTotalCount = function () {
                if (gLoader == null) return true;
                if (gLoader.result == null) return true;
                if (gLoader.result.totalCount == null) return true;

                // var maxCount = <%= NConfig.getString(NConfig.DEFAULT_CONFIG + "/max-fetch-size", "10000") %>;

                if (gLoader.result.totalCount > maxCount) {
                    alert(cfGetMessage(Message.grid.excel.maxCountOver, [cfGetFormatNumber(maxCount)]));
                    return false;
                }

                return true;
            }
            win.opt.width = 300;
            win.opt.height = 115;
            win.opt.edge = "raised";
            win.show();
        }

        this.cancel = function () {
            try {
                xhr.req.abort();
            } catch (ex) {
            }

            setGrid();
        }

        function setGrid() {
            gLoader.loading = false;

            if (gLoader.result == null) {
                gLoader.result = {};
            }

            setMessage(parseInt(gLoader.result.totalCount, 10));

            if (element.fg.Rows > element.fg.FixedRows) {
                for (var c = 0; c < element.fg.Cols; c++) {
                    putAction(element.fg.ColKey(c));
                    putCheck(element.fg.ColKey(c));
                    putImage(element.fg.ColKey(c));
                }
            }

            setCheckHeader(element.fg.ColIndex("rowChk"));
            setPagingHeader();

            if (reloadObj != null) {
                element.fg.Row = Math.min(reloadObj.row, element.fg.Rows - 1);
                element.fg.TopRow = reloadObj.topRow;
                element.fg.Col = Math.min(reloadObj.col, element.fg.Cols - 1);
                element.fg.LeftCol = reloadObj.leftCol;
                reloadObj = null;
            } else {
                element.fg.Row = Math.min(0, element.fg.Rows - 1);
                element.fg.TopRow = 0;
            }

            if (gFixedColumns.fixedColId != null && element.fg.ColIndex(gFixedColumns.fixedColId) != -1) {
                var fixedCols = element.fg.ColIndex(gFixedColumns.fixedColId) + 1;
                if (fixedCols <= element.fg.FrozenCols) {
                    element.fg.FixedCols = fixedCols;
                }
            }

            gLoader.executed = true;
        }
    }

    function createRowData(datas) {
        var rowData = {};

        for (var i = 0; i < datas.length; i++) {
            rowData[datas[i].id] = datas[i].value;
        }

        return rowData;
    }

    function setAutoColumn(oCols) {
        var colId;
        var colId2;
        var colAlign;
        var colType;
        var colFormat;

        element.fg.Cols = 0;
        element.fg.FixedRows = 0;
        element.fg.ColWidthMax = 500 * 15;

        function getFormat(scale) {
            var format = "#,##0";

            if (scale == null || scale == "0" || scale == "255") return format;

            format += ".";

            for (var i = 0; i < scale; i++) {
                format += "#";
            }

            return format;
        }

        var dataTypeEnum = {
            adEmpty: 0
            , adTinyInt: 16
            , adSmallInt: 2
            , adInteger: 3
            , adBigInt: 20
            , adUnsignedTinyInt: 17
            , adUnsignedSmallInt: 18
            , adUnsignedInt: 19
            , adUnsignedBigInt: 21
            , adSingle: 4
            , adDouble: 5
            , adCurrency: 6
            , adDecimal: 14
            , adNumeric: 131
            , adBoolean: 11
            , adError: 10
            , adUserDefined: 132
            , adVariant: 12
            , adIDispatch: 9
            , adIUnknown: 13
            , adGUID: 72
            , adDate: 7
            , adDBDate: 133
            , adDBTime: 134
            , adDBTimeStamp: 135
            , adBSTR: 8
            , adChar: 129
            , adVarChar: 200
            , adLongVarChar: 201
            , adWChar: 130
            , adVarWChar: 202
            , adLongVarWChar: 203
            , adBinary: 128
            , adVarBinary: 204
            , adLongVarBinary: 205
            , adChapter: 136
            , adFileTime: 64
            , adPropVariant: 138
            , adVarNumeric: 139
        };

        for (var c = 0; c < oCols.length; c++) {
            colId = oCols[c].id;
            colId2 = oCols[c].id;

            if (colId == null) colId = colId2;

            if (colId == "rowNum") continue;

            switch (Number(oCols[c].type)) {
                case dataTypeEnum.adTinyInt:
                case dataTypeEnum.adSmallInt:
                case dataTypeEnum.adInteger:
                case dataTypeEnum.adBigInt:
                case dataTypeEnum.adUnsignedTinyInt:
                case dataTypeEnum.adUnsignedSmallInt:
                case dataTypeEnum.adUnsignedInt:
                case dataTypeEnum.adUnsignedBigInt:
                case dataTypeEnum.adSingle:
                case dataTypeEnum.adDouble:
                case dataTypeEnum.adCurrency:
                case dataTypeEnum.adDecimal:
                case dataTypeEnum.adNumeric:
                case dataTypeEnum.adNumeric:
                case dataTypeEnum.adVarNumeric:
                    colAlign = "right";
                    colType = "number";
                    colFormat = getFormat(oCols[c].numericScale);
                    break;
                default:
                    colAlign = "left";
                    colType = "string";
                    colFormat = null;
                    break;
            }

            addColumn({ id: colId, id2: colId2, align: colAlign, type: colType, sort: true, format: colFormat });
        }
    }

    function setMessage(iTotCnt) {
        var html;

        if (iTotCnt == null) {
            gLoadingFrame.show();
            gMessageFrame.hide();
            if (gHeaderArea != null && gHeaderArea.messageLabel != null) {
                gHeaderArea.messageLabel.innerText = "Loading...";
                gHeaderArea.messageLabel.title = "";
            }
            element.fg.Rows = element.fg.FixedRows;
            gPagingParams.totPageCnt = null;
        } else {
            gLoadingFrame.hide();
            if (iTotCnt == 0) {
                gMessageFrame.show(Message.grid.message.noResult);
            }
            gPagingParams.totPageCnt = parseInt((iTotCnt - 1) / gPagingParams.size + 1, 10);
            if (gPagingParams.totPageCnt == 0) gPagingParams.totPageCnt = 1;
            if (gHeaderArea != null && gHeaderArea.messageLabel != null) {
                if (iTotCnt >= 0) {
                    if (element.pagingType == 0) {
                        if (gMessageFrame.isShow == true) {
                            gHeaderArea.messageLabel.innerText = cfGetMessage(Message.grid.message.totalCount, [0]);
                        } else {
                            gHeaderArea.messageLabel.innerText = cfGetMessage(Message.grid.message.totalCount, [cfGetFormatNumber(element.fg.Rows - element.fg.FixedRows)]);
                        }
                    } else {
                        gHeaderArea.messageLabel.innerText = cfGetMessage(Message.grid.message.totalCount, [cfGetFormatNumber(iTotCnt)]);
                    }
                    if (gLoader != null && gLoader.loadStartTime != null && gLoader.loadEndTime != null) {
                        var endTime = new Date();
                        var message = [];
                        message.push("Data Loading time : " + ((gLoader.loadEndTime - gLoader.loadStartTime) / 1000) + " sec");
                        message.push("Grid Rendering time : " + ((endTime - gLoader.renderStartTime) / 1000) + " sec");
                        message.push("Total Elapsed time : " + (((endTime - gLoader.renderStartTime) + (gLoader.loadEndTime - gLoader.loadStartTime)) / 1000) + " sec");
                        gHeaderArea.messageLabel.title = message.join("\n");
                    }
                } else {
                    gHeaderArea.messageLabel.innerText = "";
                }
            }
        }

        if (element.pagingType != 0) {
            createPagination();
        }
    }

    function createPagination() {
        var div = div_pagingArea.firstChild;

        var pagingNo = parseInt(gPagingParams.no, 10);
        var pagingStart = ((Math.ceil(gPagingParams.no / gPagingParams.scale) - 1) * gPagingParams.scale) + 1;
        var pagingEnd = Math.min(pagingStart + gPagingParams.scale - 1, gPagingParams.totPageCnt);
        var linkId = "pagingNoSelector_" + gControlIdSuffix;
        var html = [];

        if (gPagingParams.totPageCnt != null && isNaN(gPagingParams.totPageCnt) != true && gPagingParams.no != 1) {
            html.push('<a id="' + linkId + '" href="javascript:;" class="first" pagingNo="1" title="' + Message.grid.message.pageToFirst + '"></a>');
        } else {
            html.push('<span class="first" title="' + Message.grid.message.pageToFirst + '"></span>');
        }

        if (gPagingParams.totPageCnt != null && isNaN(gPagingParams.totPageCnt) != true && pagingStart != 1) {
            html.push('<a id="' + linkId + '" href="javascript:;" class="prev" pagingNo="' + (pagingStart - 1) + '" title="' + Message.grid.message.pageToPrev10 + '"></a>');
        } else {
            html.push('<span class="prev" title="' + Message.grid.message.pageToPrev10 + '"></span>');
        }

        for (var i = pagingStart; i <= pagingEnd; i++) {
            if (gPagingParams.no == i) {
                html.push('<strong>' + i + '</strong>');
            } else {
                html.push('<a id="' + linkId + '" href="javascript:;" pagingNo="' + i + '">' + i + '</a>');
            }
        }

        if (gPagingParams.totPageCnt != null && isNaN(gPagingParams.totPageCnt) != true && gPagingParams.totPageCnt > pagingEnd) {
            html.push('<a id="' + linkId + '" href="javascript:;" class="next" pagingNo="' + (pagingEnd + 1) + '" title="' + Message.grid.message.pageToNext10 + '"></a>');
        } else {
            html.push('<span class="next" title="' + Message.grid.message.pageToNext10 + '"></span>');
        }

        if (gPagingParams.totPageCnt != null && isNaN(gPagingParams.totPageCnt) != true && gPagingParams.totPageCnt != gPagingParams.no) {
            html.push('<a id="' + linkId + '" href="javascript:;" class="final" pagingNo="' + gPagingParams.totPageCnt + '" title="' + Message.grid.message.pageToLast + '"></a>');
        } else {
            html.push('<span class="final" title="' + Message.grid.message.pageToLast + '"></span>');
        }

        div.innerHTML = html.join("\n");

        var links = document.getElementsByName(linkId);

        for (var i = 0; i < links.length; i++) {
            links[i].onclick = function () {
                resetPagingNo(this.pagingNo);
            }
        }
    }

    function resetPagingSize(pagingSize) {
        gPagingParams.size = pagingSize;
        gPagingParams.no = 1;

        if (gLoader != null) {
            gLoader.execute(true);
        }
    }

    function resetPagingNo(pagingNo) {
        gPagingParams.no = parseInt(pagingNo, 10);

        if (gLoader != null) {
            gLoader.execute(true);
        }
    }

    function setCheckHeader(col) {
        if (gMessageFrame.isShow == true) return;

        if (col == -1) return;

        var icon = 1;

        if (element.fg.ColData(col).info.type == "check") {
            if (element.fg.Rows == element.fg.FixedRows || element.fg.FindRow(0, element.fg.FixedRows, col, true, true) > -1) {
                icon = 0;
            } else {
                for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                    if (element.fg.TextMatrix(r, col) != "") continue;
                    icon = 0;
                    break;
                }
            }
        } else {
            if (element.fg.Rows == element.fg.FixedRows || element.fg.ColData(col).info.checkBoxExists != true) {
                icon = 0;
            } else {
                element.fg.ColData(col).info.checkBoxExists = false;
                for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                    if (element.fg.Cell(flexcpChecked, r, col) != flexNoCheckbox) element.fg.ColData(col).info.checkBoxExists = true;
                    if (element.fg.Cell(flexcpChecked, r, col) != flexUnchecked) continue;
                    icon = 0;
                    break;
                }
                if (element.fg.ColData(col).info.checkBoxExists != true) {
                    icon = 0;
                }
            }
        }

        if (element.fg.ColData(col).info.checkToRadio == true) return;

        for (var r = 0; r < element.fg.FixedRows; r++) {
            if (element.fg.TextMatrix(r, col) != element.fg.TextMatrix(element.fg.FixedRows - 1, col)) continue;
            // element.fg.TextMatrix(r, col) = gCheckColumnIcon[icon];
        }
    }

    function setPagingHeader() {
        for (var c = 0; c < element.fg.Cols; c++) {
            if (element.fg.ColData(c) == null || element.fg.ColData(c).info == null || element.fg.ColData(c).info.id == "rowChk") continue;
            for (var r = 0; r < element.fg.FixedRows; r++) {
                if (element.fg.TextMatrix(r, c) != element.fg.TextMatrix(element.fg.FixedRows - 1, c)) continue;
                if (gSortingInfo.length > 0 && element.fg.ColKey(c) == gSortingInfo[0].name && element.fg.ColData(c).info.sort == true) {
                    // element.fg.TextMatrix(r, c) = gSortTypeMarker[gSortingInfo[0].type.toUpperCase()] + " " + element.fg.ColData(c).info.name;
                } else {
                    // element.fg.TextMatrix(r, c) = element.fg.ColData(c).info.name;
                }
            }
            setAutoColSize(c);
        }
    }

    /**
     * 밸류 값 가져오기(jqGrid, dsGrid, dsGridHTC 동일 이름)
     *
     * @param {Number} iRowIdx
     * @param {String} sColKey
     * @returns {string|null|*}
     *
     * @memberOf dsgridHTC#
     */
    function getValue(iRowIdx, sColKey) {
        if (iRowIdx < element.fg.FixedRows) return null;
        if (iRowIdx > element.fg.Rows - 1) return null;

        if (sColKey == "rowNum" && element.pagingType == 0) {
            return getRowNum(iRowIdx);
        }

        var oRowData = element.fg.RowData(iRowIdx);
        var sValue;

        if (oRowData == null || oRowData.data == null || oRowData.data[sColKey] == null) {
            var colIndex = element.fg.ColIndex(sColKey);
            if (colIndex == -1) {
                sValue = null;
            } else {
                sValue = element.fg.TextMatrix(iRowIdx, colIndex);
                if (element.fg.ColData(colIndex).info.type == "date") {
                    sValue = cfGetUnformatDate(sValue);
                } else {
                    var sFormat = element.fg.ColData(colIndex).info.format;
                    if (sFormat != null && sFormat.indexOf("X") != -1) {
                        sValue = cfGetUnformatString(sValue, sFormat);
                    }
                }
            }
        } else {
            sValue = oRowData.data[sColKey];
        }

        if (sValue == null && element.useNull != true) return "";

        return sValue;
    }

    /**
     * 밸류 값 세팅
     *
     * @param {Number} iRowIdx
     * @param {String} sColKey
     * @param {String} sValue
     *
     * @memberOf dsgridHTC#
     */
    function setValue(iRowIdx, sColKey, sValue) {
        gMessageFrame.hide(true);

        if (iRowIdx < element.fg.FixedRows) return;
        if (iRowIdx > element.fg.Rows - 1) return;

        if (sColKey == "rowNum") {
            // element.fg.TextMatrix(iRowIdx, iColIdx) = getRowNum(iRowIdx);
            return;
        }

        if (element.fg.RowData(iRowIdx) == null) {
            // element.fg.RowData(iRowIdx) = {};
        }

        if (element.fg.RowData(iRowIdx).data == null) {
            element.fg.RowData(iRowIdx).data = {};
        }

        element.fg.RowData(iRowIdx).data[sColKey] = sValue;

        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx != -1 && sColKey != "") {
            // element.fg.TextMatrix(iRowIdx, iColIdx) = element.fg.ColData(iColIdx).info.text(element, fg, iRowIdx, sColKey, (sValue == null ? "" : sValue));
        }
    }

    function getChecked(iRowIdx, sColKey) {
        if (iRowIdx < 0) return null;
        if (iRowIdx >= element.fg.Rows) return null;

        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx == -1) return null;

        if (element.fg.ColData(iColIdx).info.type == "check") {
            return (element.fg.TextMatrix(iRowIdx, iColIdx) == 1);
        } else {
            var cpChecked = element.fg.Cell(flexcpChecked, iRowIdx, iColIdx);
            if (cpChecked != 0) return (cpChecked == 1);
        }

        return null;
    }

    function setChecked(iRowIdx, sColKey, bValue) {
        if (gMessageFrame.isShow == true) return;

        if (iRowIdx < 0) return;
        if (iRowIdx >= element.fg.Rows) return;

        if (gBeforeCheck[sColKey] != null) {
            if (eval(gBeforeCheck[sColKey])(iRowIdx) != true) return;
        }

        var iColIdx = element.fg.ColIndex(sColKey);

        if (element.fg.ColData(iColIdx).info.checkToRadio == true) {
            element.fg.ReDraw = 0;
            // element.fg.Cell(0, element.fg.FixedRows, iColIdx, element.fg.Rows - 1, iColIdx) = 0;
            for (var r = element.fg.FixedRows; r < element.fg.Rows; r++) {
                if (element.fg.RowData(r) != null && element.fg.RowData(r).data != null) {
                    element.fg.RowData(r).data[sColKey] = 0;
                }
            }
            element.fg.ReDraw = 2;
        }

        if (iColIdx == -1) return;

        if (element.fg.ColData(iColIdx).info.type == "check") {
            // element.fg.TextMatrix(iRowIdx, iColIdx) = (bValue == true ? 1 : 0);
            if (element.fg.RowData(iRowIdx) != null && element.fg.RowData(iRowIdx).data != null) {
                element.fg.RowData(iRowIdx).data[sColKey] = (bValue == true ? 1 : 0);
            }
        } else {
            var cpChecked = element.fg.Cell(flexcpChecked, iRowIdx, iColIdx);
            // if (cpChecked != 0) element.fg.Cell(flexcpChecked, iRowIdx, iColIdx) = (bValue == true ? 1 : 2);
        }
    }

    function getEditable() {
        return gEditable;
    }

    function setEditable(iEditable) {
        gEditable = iEditable;
    }

    function getEnable() {
        return (gDisableFrame == null);
    }

    function setEnable(bool) {
        if (bool != true && gDisableFrame == null) {
            gDisableFrame = document.createElement('<iframe frameBorder="0" style="position:absolute; left:0px; top:0px; width:100%; height:100%; filter:alpha(opacity=50);">');
            document.body.appendChild(gDisableFrame);
        } else if (bool == true && gDisableFrame != null) {
            document.body.removeChild(gDisableFrame);
            gDisableFrame = null;
        }
    }

    function resizeGrid() {
        if (div_pagingArea.style.display != "none") {
            div_gridArea.style.height = Math.max(parseInt(element.style.height, 10) - 13 - 9, 0);
        } else {
            div_gridArea.style.height = "100%";
        }

        setAutoHeight();
    }

    function getText(iRowIdx, sColKey) {
        if (iRowIdx < 0) return null;
        if (iRowIdx >= element.fg.Rows) return null;

        var iColIdx = element.fg.ColIndex(sColKey);

        if (iColIdx == -1) return null;

        return element.fg.Cell(flexcpTextDisplay, iRowIdx, iColIdx);
    }

    /**
     * 해당 로우의 데이터 가져오기(jqGrid, dsGrid, dsGridHTC 동일 이름)
     *
     * @param {Number} iRowIdx
     * @returns {{}|*}
     *
     * @memberOf dsgridHTC#
     */
    function getRowData(iRowIdx) {
        if (element.fg.RowData(iRowIdx) == null) return {};
        if (element.fg.RowData(iRowIdx).data == null) return {};

        return element.fg.RowData(iRowIdx).data;
    }

    function setRowData(iRowIdx, oRowData) {
        if (element.fg.RowData(iRowIdx) == null) {
            // element.fg.RowData(iRowIdx) = {};
        }

        element.fg.RowData(iRowIdx).data = oRowData;

        vbBindGridRow(iRowIdx);
    }

    function setCell() {
        switch (arguments.length) {
            case 3:
                do1(arguments[0], arguments[1], arguments[2]);
                break;
            case 4:
                do2(arguments[0], arguments[1], arguments[2], arguments[3]);
                break;
        }

        function do1(iProp, iRowIdx, sValue) {
            // element.fg.Cell(iProp, iRowIdx, 0, iRowIdx, element.fg.Cols - 1) = sValue;
        }

        function do2(iProp, iRowIdx, sColId, sValue) {
            // element.fg.Cell(iProp, iRowIdx, element.fg.ColIndex(sColId)) = sValue;
        }
    }

    function setBeforeSort(colId, func) {
        gBeforeSort[colId] = func;
    }

    function setBeforeCheck(colId, func) {
        gBeforeCheck[colId] = func;
    }

    function getAutoHeight() {
        return gAutoHeight;
    }

    function setAutoHeight(val) {
        if (val != null) {
            gAutoHeight = (String(val) == "" || String(val).toLowerCase() == "true");
        }

        if (gAutoHeight != true) return;

        var totRowHeight = 0;

        for (var i = 0; i < element.fg.Rows; i++) {
            totRowHeight += element.fg.RowHeight(i);
        }

        var minHeight = 0;

        if (element.minHeight != null && element.minHeight != "") {
            minHeight = parseInt(element.minHeight, 10);
        }

        div_gridArea.style.height = Math.max(totRowHeight / 15 + element.fg.Rows * 4 + (any.scrollBarWidth == null ? 0 : any.scrollBarWidth) - 2, minHeight);

        element.style.height = document.body.scrollHeight;

        bfSetTabFrameHeight(true);
    }

    function getDisableMessage() {
        return gDisableMessage;
    }

    function setDisableMessage(val) {
        gDisableMessage = (String(val) == "" || String(val).toLowerCase() == "true");
    }

    function getDisableRowHilight() {
        return gDisableRowHilight;
    }

    function setDisableRowHilight(val) {
        gDisableRowHilight = (String(val) == "" || String(val).toLowerCase() == "true");
    }

    function getRowCount() {
        if (gMessageFrame.isShow == true) return 0;

        return element.fg.Rows - element.fg.FixedRows;
    }

    function moveRowSelection(dir, colId) {
        if (element.fg.Row + dir < element.fg.FixedRows) {
            element.fg.Row = Math.min(element.fg.FixedRows, element.fg.Rows - 1);
        } else if (element.fg.Row + dir > element.fg.Rows - 1) {
            element.fg.Row = element.fg.Rows - 1;
        } else {
            element.fg.Row = element.fg.Row + dir;
        }

        if (colId != null) {
            element.fg.Select(element.fg.Row, element.fg.ColIndex(colId));
        }

        element.fg.ShowCell(element.fg.Row, element.fg.Col);
    }

    function moveRowData(dir) {
        if (element.fg.SelectedRow(0) < element.fg.FixedRows) return;
        if (dir == -1 && element.fg.SelectedRow(0) == element.fg.FixedRows) return;
        if (dir == 1 && element.fg.SelectedRow(element.fg.SelectedRows - 1) == element.fg.Rows - 1) return;

        try {

            element.fg.ReDraw = 0;

            if (dir == -1) {
                for (var r = 0; r < element.fg.SelectedRows; r++) {
                    // element.fg.RowPosition(element.fg.SelectedRow(r)) = element.fg.SelectedRow(r) + dir;
                }
            } else {
                for (var r = element.fg.SelectedRows - 1; r >= 0; r--) {
                    // element.fg.RowPosition(element.fg.SelectedRow(r)) = element.fg.SelectedRow(r) + dir;
                }
            }

        } catch (ex) {
        } finally {
            element.fg.ReDraw = 2;
        }
    }

    function clearAll() {
        element.fg.Rows = element.fg.FixedRows;

        setAutoHeight();

        if (gHeaderArea != null && gHeaderArea.messageLabel != null) {
            gHeaderArea.messageLabel.innerText = "(Ready)";
        }

        if (element.pagingType != 0) {
            gPagingParams.totPageCnt = null;
            gPagingParams.no = 1;
            createPagination();
        }
    }

    /**
     * 그리드 로우 추가(jqGrid, dsGrid, dsGridHTC)
     *
     * @returns {number}
     *
     * @memberOf dsgridHTC#
     */
    function addRow() {
        gMessageFrame.hide();

        try {
            element.fg.ReDraw = 0;
            element.fg.Rows++;
            if (element.fg.Rows > element.fg.FixedRows) {
                for (var c = 0; c < element.fg.Cols; c++) {
                    putAction(element.fg.ColKey(c));
                    putCheck(element.fg.ColKey(c));
                    putImage(element.fg.ColKey(c));
                }
            }
        } catch (ex) {
        } finally {
            element.fg.ReDraw = 2;
        }

        return element.fg.Rows - 1;
    }

    /**
     * 로우 삭제
     *
     * @param {Number} iRowIdx
     *
     * @memberOf dsgridHTC#
     */
    function deleteRow(iRowIdx) {
        element.fg.RemoveItem(iRowIdx);
    }

    function initPopup() {
        tr_command_N.style.display = (element.configType == "0" ? "none" : "block");

        gContextMenu = window.createPopup();
        gContextMenu.document.createStyleSheet();
        gContextMenu.document.styleSheets[0].addRule("td", '{font-family:돋움,Dotum,굴림,Gulim,Verdana,Arial,sans-serif; font-size:12px;}');
        gContextMenu.document.body.onselectstart = function () { return false; }
        gContextMenu.document.body.ondragstart = function () { return false; }
        gContextMenu.document.body.oncontextmenu = function () { return false; }
        gContextMenu.document.body.innerHTML = div_popupMenu.innerHTML;

        var tds = gContextMenu.document.getElementById("tbl_popupMenu").getElementsByTagName("TD");

        for (var i = 0; i < tds.length; i++) {
            if (tds[i].command == null) {
                tds[i].height = "8px";
                continue;
            }

            tds[i].noWrap = true;
            tds[i].style.cursor = "default";
            tds[i].style.padding = "1px 4px 2px 4px";

            tds[i].onmouseover = function () {
                hilightTd(this, true);
            }

            tds[i].onmouseout = function () {
                hilightTd(this, false);
            }

            tds[i].onclick = function () {
                hilightTd(this, false);

                execPopupCommand(this.command);
            }
        }

        function hilightTd(td, bool) {
            if (td.command == null) return;
            if (td.parentElement.style.display == "none") return;
            if (td.parentElement.disabled == true) return;

            td.style.backgroundColor = (bool == true ? "#316AC5" : "");
            td.style.color = (bool == true ? "white" : "");
        }
    }

    function showPopup(iX, iY) {
        if (gLoader != null && gLoader.loading == true) return;

        element.focus();
        element.fg.focus();

        var tbl = gContextMenu.document.getElementsByTagName("TABLE")[0];
        var tds = gContextMenu.document.getElementById("tbl_popupMenu").getElementsByTagName("TD");

        for (var i = 0; i < tds.length; i++) {
            tds[i].style.backgroundColor = "";
            tds[i].style.color = "";
        }

        var row;
        var col;

        if (gMouseDown == null) {
            row = element.fg.MouseRow;
            col = element.fg.MouseCol;
        } else {
            row = gMouseDown.mouseRow;
            col = gMouseDown.mouseCol;
        }

        gContextMenu.document.mouseRow = row;
        gContextMenu.document.mouseCol = col;

        if (row == -1 || col == -1) {
            gContextMenu.document.getElementById("spn_copyCellText").innerText = "";
        } else {
            gContextMenu.document.getElementById("spn_copyCellText").innerText = replaceCrLf(element.fg.Cell(0, gContextMenu.document.mouseRow, gContextMenu.document.mouseCol));
        }

        if (row == -1) {
            gContextMenu.document.getElementById("spn_copyRowText").innerText = "";
        } else {
            gContextMenu.document.getElementById("spn_copyRowText").innerText = replaceCrLf(element.fg.Cell(0, gContextMenu.document.mouseRow, 0, gContextMenu.document.mouseRow, element.fg.Cols - 1));
        }

        if (col == -1) {
            gContextMenu.document.getElementById("spn_copyColText").innerText = "";
        } else {
            gContextMenu.document.getElementById("spn_copyColText").innerText = function () {
                if (element.fg.ColData(col) == null || element.fg.ColData(col).info == null) {
                    if (element.fg.FixedRows > 0) return replaceCrLf(element.fg.TextMatrix(element.fg.FixedRows - 1, col)) + "...";
                } else {
                    return replaceCrLf(element.fg.ColData(col).info.name) + "...";
                }
                return "";
            }();
        }

        gContextMenu.document.getElementById("tr_command_R").disabled = (gLoader == null);
        gContextMenu.document.getElementById("tr_command_X").disabled = (gLoader == null);

        gContextMenu.show(0, 0, 0, 0, document.body);
        gContextMenu.show(iX / 15, iY / 15, tbl.offsetWidth, tbl.offsetHeight, document.body);

        function replaceCrLf(val) {
            return val.replaceAll("\r\n", " ").replaceAll("\r", " ").replaceAll("\n", " ");
        }
    }

    function execPopupCommand(cmd) {
        if (gContextMenu == null) return;
        if (gContextMenu.isOpen != true) return;

        var td = gContextMenu.document.getElementById("tr_command_" + cmd);

        if (td != null && td.style.display == "none") return;
        if (td != null && td.disabled == true) return;

        var clipText;

        gContextMenu.hide();

        switch (cmd) {
            case "C":
                if (gContextMenu.document.mouseRow == -1 || gContextMenu.document.mouseCol == -1) {
                    clipText = "";
                } else {
                    clipText = element.fg.Cell(0, gContextMenu.document.mouseRow, gContextMenu.document.mouseCol);
                }
                break;
            case "W":
                if (gContextMenu.document.mouseRow == -1) {
                    clipText = "";
                } else {
                    clipText = element.fg.Cell(0, gContextMenu.document.mouseRow, 0, gContextMenu.document.mouseRow, element.fg.Cols - 1);
                }
                break;
            case "O":
                if (gContextMenu.document.mouseCol == -1) {
                    clipText = "";
                } else {
                    clipText = element.fg.Cell(0, 0, gContextMenu.document.mouseCol, element.fg.Rows - 1, gContextMenu.document.mouseCol);
                }
                break;
            case "S":
                clipText = element.fg.Clip;
                break;
            case "A":
                if (element.fg.Rows == 0 || element.fg.Cols == 0) {
                    clipText = "";
                } else {
                    clipText = element.fg.Cell(0, 0, 0, element.fg.Rows - 1, element.fg.Cols - 1);
                }
                break;
            case "N":
                openConfig();
                break;
            case "R":
                if (gLoader != null) gLoader.reload();
                break;
            case "F":
                var win = new any.window(1);
                win.path = "/ipms/com/control/getGridFinder.do";
                win.arg.gr = element;
                win.opt.width = 380;
                win.opt.height = 125;
                win.opt.left = 100;
                win.opt.top = 80;
                win.opt.edge = "raised";
                win.show(false);
                break;
            case "X":
                openExcelDownload();
                break;
            case "P":
                element.fg.PrintGrid(true, 2, 500, 500);
                break;
            default:
                return;
        }

        if (clipText != null) {
            window.clipboardData.setData("Text", clipText);
        }
    }

    function openExcelDownload() {
        if (gLoader == null || gLoader.result == null || gLoader.result.totalCount == 0) {
            alert(Message.grid.excel.noData);
            return;
        }

        ds_headerList.init();
        ds_columnList.init();

        for (var r = 0; r < element.fg.FixedRows; r++) {
            var row = ds_headerList.addRow();
            for (var c = 0; c < element.fg.Cols; c++) {
                if (element.fg.ColData(c).info.nouse == true) continue;
                if (r < element.fg.FixedRows - 1) {
                    // ds_headerList.value(row, element.fg.ColKey(c)) = element.fg.Cell(0, r, c);
                } else {
                    // ds_headerList.value(row, element.fg.ColKey(c)) = getHeaderName(element.fg.ColKey(c));
                }
            }
        }

        for (var c = 0; c < element.fg.Cols; c++) {
            var columnInfo = element.fg.ColData(c).info;
            if (columnInfo.nouse == true) continue;
            row = ds_columnList.addRow();
            // ds_columnList.value(row, "ID") = element.fg.ColKey(c);
            // ds_columnList.value(row, "ALIGN") = columnInfo.align;
            // ds_columnList.value(row, "TYPE") = columnInfo.type;
            // ds_columnList.value(row, "FORMAT") = columnInfo.format;
            // ds_columnList.value(row, "WIDTH") = parseInt(element.fg.ColWidth(c) * 1.3, 10) * 2;
            // ds_columnList.value(row, "HIDE") = (element.fg.ColHidden(c) == true ? 1 : 0);
        }

        if (getRealEditable() != true) {
            if (gLoader != null) gLoader.download();
            return;
        }

        var frm = document.body.appendChild(document.createElement('<form style="display:none;" autocomplete="off">'));
        var ifr = element.document.body.appendChild(document.createElement('<iframe name="ifr_excelDownload_' + window.dynamicControlIndex + '" style="display:none;">'));

        frm.action = any.getServletPath("ipms.com.control.grid.excel.GridExcelDownloadAct::download");
        frm.method = "POST";
        frm.target = ifr.name;

        var dataSetXML = new Array();

        dataSetXML.push('<?xml version="1.0" encoding="utf-8"?>');
        dataSetXML.push('<root>');
        dataSetXML.push(ds_headerList.xml);
        dataSetXML.push(ds_columnList.xml);
        dataSetXML.push(gDs.xml);
        dataSetXML.push('</root>');

        addHidden("_DOWNLOAD_MODE_", "1");
        addHidden("_DOWNLOAD_TITLE_", element.title == null || element.title == "" ? element.document.title : element.title);
        addHidden("_ROW_NUM_DIR_", element.rowNumDir);
        addHidden("_DATA_SET_XML_", dataSetXML.join("\n"));
        addHidden("_RESULT_DS_ID_", gDs.id);

        frm.submit();

        document.body.removeChild(frm);

        function getRealEditable() {
            if (gEditable != true) return false;

            for (var i = 0; i < gColumnInfo.length; i++) {
                if (gColumnInfo[i].edit == true) return true;
            }

            return false;
        }

        function addHidden(name, value) {
            frm.appendChild(document.createElement('<input type="hidden" name="' + name + '">')).value = value;
        }
    }

    function openConfig() {
        if (gConfigInfo.gridPath == null || gConfigInfo.gridPath == "") {
            alert("그리드 경로가 정의되지 않았습니다.");
            return;
        }

        var win = new any.window();
        win.path = "/ipms/com/control/getGridConfig.do";
        win.arg.gr = element;
        win.arg.sortingInfo = gSortingInfo;
        win.arg.defaultSortingInfo = gDefaultSortingInfo;
        win.arg.configInfo = gConfigInfo;
        win.opt.width = 600;
        win.opt.height = 500;
        if (win.show() == "OK") {
            setConfig(gConfigInfo == null ? null : gConfigInfo.addonId);
        }
    }

    function setConfig(addonId, noReload, postAction) {
        if (addonId != null) gConfigInfo.configId = null;

        gConfigInfo.gridPath = element.document.location.pathname + "::" + element.id + (addonId == null ? "" : "::" + addonId);
        gConfigInfo.addonId = addonId;

        if (any.startsWith(gConfigInfo.gridPath, any.meta.contextPath)) {
            gConfigInfo.gridPath = gConfigInfo.gridPath.substr(any.meta.contextPath.length);
        }

        var prx = new any.proxy();
        prx.path = "trade.tma.com.control.grid.config.GridConfigAjax::retrieve";
        prx.addParam("CONFIG_ID", gConfigInfo.configId);
        prx.addParam("GRID_PATH", gConfigInfo.gridPath);
        prx.addParam("ID_SUFFIX", gControlIdSuffix);
        prx.hideMessage = true;

        prx.onSuccess = function () {
            gConfigInfo.configId = gConfigInfo.configDs.value(0, "CONFIG_ID");

            setColumnConfig();
            setSortingConfig();

            any.event.call(element, "onChangeConfig");

            if (postAction != null) {
                postAction();
            }
        }

        prx.onFail = function () {
            this.error.show();
        }

        prx.onComplete = function () {
            element.isReady = true;
            any.event.call(element, "onReady");
        }

        prx.execute();

        function setColumnConfig() {
            try {

                if (gConfigInfo.configDs.rowCount == 0 || gConfigInfo.configDs.value(0, "COLUMN_YN") != "Y") {
                    gConfigInfo.columnDs.init();
                    for (var i = 0; i < element.fg.Cols; i++) {
                        gConfigInfo.columnDs.addRow();
                        // gConfigInfo.columnDs.value(i, "COL_ID") = element.fg.ColData(i).info.id;
                        // gConfigInfo.columnDs.value(i, "COL_INDEX") = element.fg.ColData(i).info.index + 1;
                        // gConfigInfo.columnDs.value(i, "COL_SHOW") = (element.fg.ColData(i).info.nouse == true || element.fg.ColData(i).info.hide == true ? 0 : 1);
                        // gConfigInfo.columnDs.value(i, "COL_FROZEN") = (element.fg.ColData(i).info.id == gFixedColumns.frozenColId ? 1 : 0);
                        // gConfigInfo.columnDs.value(i, "COL_NAME") = element.fg.ColData(i).info.name;
                        // gConfigInfo.columnDs.value(i, "COL_WIDTH") = element.fg.ColData(i).info.width;
                    }
                }

                element.fg.ReDraw = 0;
                element.fg.FrozenCols = 0;

                for (var i = 0; i < element.fg.Cols; i++) {
                    element.fg.ColData(i).info.positioning = false;
                    if (element.fg.ColData(i).info.id == "rowChk" && element.fg.ColData(i).info.nouse != true) continue;
                    if (gConfigInfo.columnDs.valueRow(["COL_ID", element.fg.ColData(i).info.id]) != -1) continue;
                    // element.fg.ColPosition(i) = element.fg.Cols - 1;
                    // element.fg.ColHidden(i) = true;
                }

                for (var i = 0; i < gConfigInfo.columnDs.rowCount; i++) {
                    var col1 = element.fg.ColIndex(gConfigInfo.columnDs.value(i, "COL_ID"));
                    if (col1 == -1) continue;
                    element.fg.ColData(col1).info.positioning = true;
                    var col2 = gConfigInfo.columnDs.value(i, "COL_INDEX") - 1;
                    if (col2 >= element.fg.Cols) col2 = element.fg.Cols - 1;
                    // element.fg.ColPosition(col1) = col2;
                    // element.fg.ColHidden(col2) = (element.fg.ColData(col1).info.nouse == true || gConfigInfo.columnDs.value(i, "COL_SHOW") != "1");
                    // element.fg.ColWidth(col2) = gConfigInfo.columnDs.value(i, "COL_WIDTH") * 15;
                }

                for (var i = 0; i < element.fg.Cols; i++) {
                    if (element.fg.ColData(i).info.positioning == true) continue;
                    // element.fg.ColPosition(i) = element.fg.ColData(i).info.index;
                }

                if (gFixedColumns.fixedColId != null) {
                    var fixedColIndex = element.fg.ColIndex(gFixedColumns.fixedColId);
                    if (fixedColIndex != -1 && element.fg.ColHidden(fixedColIndex) == true) {
                        element.fg.FixedCols = 0;
                    }
                }

                for (var item in gGridActions) {
                    var col = element.fg.ColIndex(item);
                    if (col == -1) continue;
                    // element.fg.ColHidden(col) = false;
                }

                setExtendColumnWidth();

                for (var i = 0; i < gConfigInfo.columnDs.rowCount; i++) {
                    if (gConfigInfo.columnDs.value(i, "COL_FROZEN") != "1") continue;
                    var frozenCols = element.fg.ColIndex(gConfigInfo.columnDs.value(i, "COL_ID")) + 1;
                    if (gMessageFrame.isShow == true) {
                        gMessageFrame.fg.frozenCols = frozenCols - gMessageFrame.fg.fixedCols;
                        element.fg.FrozenCols = 0;
                    } else {
                        element.fg.FrozenCols = frozenCols - element.fg.FixedCols;
                    }
                    break;
                }

            } catch (ex) {
                element.fg.ReDraw = 2;
                throw (ex);
            } finally {
                element.fg.ReDraw = 2;
            }
        }

        function setSortingConfig() {
            if (gConfigInfo.configDs.rowCount == 0 || gConfigInfo.configDs.value(0, "SORTING_YN") != "Y") {
                gConfigInfo.sortingDs.init();
                for (var i = 0; i < gDefaultSortingInfo.length; i++) {
                    gConfigInfo.sortingDs.addRow();
                    // gConfigInfo.sortingDs.value(i, "COL_ID") = gDefaultSortingInfo[i].name;
                    // gConfigInfo.sortingDs.value(i, "SORT_INDEX") = i + 1;
                    // gConfigInfo.sortingDs.value(i, "SORT_TYPE") = gDefaultSortingInfo[i].type;
                }
            }

            gSortingInfo = [];

            for (var i = 0; i < gConfigInfo.sortingDs.rowCount; i++) {
                addSorting(gConfigInfo.sortingDs.value(i, "COL_ID"), gConfigInfo.sortingDs.value(i, "SORT_TYPE"), true);
            }

            setPagingHeader();

            if (element.pagingType == 0) {
                doSort(true);
            } else if (gLoader != null && noReload != true) {
                gLoader.reload();
            }
        }
    }

    function setExtendColumnWidth() {
        if (gUserResized == true) return;
        if (gAutoColumn == true) return;

        var extendColKey;

        for (var c = 0; c < element.fg.Cols; c++) {
            if (element.fg.ColHidden(c) == true) continue;
            if (extendColKey == null || element.fg.ColData(c).info.width >= element.fg.ColData(element.fg.ColIndex(extendColKey)).info.width) {
                extendColKey = element.fg.ColData(c).info.id;
            }
        }

        if (extendColKey == null) return;

        var extendColIdx = element.fg.ColIndex(extendColKey);

        if (extendColIdx == -1) return;

        var totWidth = 0;

        for (var c = 0; c < element.fg.Cols; c++) {
            if (element.fg.ColKey(c) == extendColKey) continue;
            if (element.fg.ColHidden(c) == true) continue;
            totWidth += element.fg.ColWidth(c);
        }

        for (var i = 0; i < 2; i++) {
            try {
                // element.fg.ColWidth(extendColIdx) = Math.max(element.fg.ColData(extendColIdx).info.width * 15, (element.fg.offsetWidth - (gAutoHeight == true ? 0 : any.scrollBarWidth)) * 15 - totWidth);
            } catch (ex) {
            }
        }
    }

    function setAutoColSize(col) {
        if (element.fg.ColData(col).info.width != null) return;

        element.fg.AutoSizeMode = 0;
        element.fg.AutoSize(col);
        // element.fg.ColWidth(col) = Math.min(5000, element.fg.ColWidth(col));
    }

    function resetEditable(col) {
        if (gEditable == null) return;
        if (gAutoColumn == true) return;
        if (col == -1) return;

        try {
            element.fg.ReDraw = 0;
            if (element.fg.ColData(col).info.edit == true) {
                element.fg.Editable = gEditable;
            } else {
                element.fg.Editable = flexEDNone;
            }
        } catch (ex) {
            element.fg.ReDraw = 2;
            throw (ex);
        } finally {
            element.fg.ReDraw = 2;
        }
    }

    function getCellText(row, colId) {
        var cellText = element.fg.RowData(row).data[colId];

        return (cellText == null ? "" : cellText);
    }

    function getRowNum(iRowIdx) {
        if (element.rowNumDir.toUpperCase() == "ASC") return iRowIdx - element.fg.FixedRows + 1;

        return element.fg.Rows - iRowIdx;
    }


}