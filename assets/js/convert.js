'use strict';
P({
    id: 'convert.js',
    key: 'MyPlayer',
    Init: function(me){
        me.Load('api.js', Init)
        function Init(){
            var f = me.fn,
                o = me.option,
                api = me.GetPlugin('api.js')
            o('data_sign', 'data-mp-sign')
            if (!o('query_parent')) {
                o.query_parent = f.qs('.post') ? '.post' : f.qs('.entry-content') ? '.entry-content' : ''
            }
            var mode = o('mode')
            o.mode = {
                ALL: mode == 'all',
                CLICK: mode == 'click',
                FIRST: mode == 'first',
            }
            var _b = {
                'flash': {
                    'attributes': {
                        'mimetype': 'application/x-shockwave-flash',
                        'pluginspage': 'http://www.adobe.com/go/getflashplayer',
                        'wmode': 'transparent',
                        'quality': 'high',
                        'allowFullScreen': true,
                        'allowScriptAccess': 'always',
                        'width': 480,
                        'height': 400
                    },
                    'tag': 'embed'
                },
                'iframe': {
                    'attributes': {
                        'frameborder': '0',
                        'framespacing': '0',
                        'width': 480,
                        'height': 400
                    },
                    'tag': 'iframe'
                },
                 'jplayer': {
                    'attributes': {
                        'class': 'jplayer',
                        'width': 240,
                        'height': 36
                    },
                    'tag': 'div'
                },
                'audio': {
                    'attributes': {
                        'controls': 'controls',
                        'autoplay': 'autoplay',
                        'loop': 'loop',
                        'width': 300,
                        'height': 30
                    },
                    'tag': 'audio'
                },
                'video': {
                    'attributes': {
                        'controls': 'controls',
                        'autoplay': 'autoplay',
                        'width': 480,
                        'height': 400
                    },
                    'tag': 'video'
                }
            }
            var Ck = me.CheckMode = function(el) {
                    var data_sign = o('data_sign'),
                        mode = el.getAttribute(data_sign)
                    if (mode === 'false') return false
                    if (mode) return mode
                    f.each(api.option.apis, function(key, item) {
                        if (item.check.call(el, el.href, el.getAttribute('data-type'))) {
                            mode = key
                            return false
                        }
                    })
                    el.setAttribute(data_sign, mode || 'false')
                    return mode
                },
                Co = me.Convert2Player = function(el) {
                    var mode = Ck(el)
                    if (mode) {
                        var bind = {
                            api: api.option.apis[mode],
                            element: el,
                            attributes: {},
                            childs: [],
                            width: el.getAttribute('data-width'),
                            height: el.getAttribute('data-height'),
                            lyrics: el.getAttribute('data-lyrics'),
                            type: el.getAttribute('data-type'),
                            options: el.getAttribute('data-options'),
                        }
                        var m =  api.option.apis[mode],
                            c = false,
                            jsonp = m.jsonp,
                            loading = f.element('span', {'class': 'loading'}),
                            url
                        if(jsonp && (url = jsonp.call(el, el.href, bind.type))){
                            f.text(loading, '尝试载入：')
                            f.prepend(el, loading)
                            f.jsonp({
                                url: url,
                                success: function(data){
                                    if(m.create.call(bind, data)){
                                        callback.call(bind)
                                        c = true
                                    }
                                }
                            })
                            setTimeout(function(){
                                if(!c){
                                    f.remove(loading)
                                }
                            }, 10000);
                        } else {
                            m.create.call(bind, el.href)
                            callback.call(bind)
                            c = true
                        }
                    }

                    function callback() {
                        var attributes = this.attributes,
                            base = _b[this.base] || {}
                        f.extend(attributes, base.attributes, false)
                        var player = f.element(base.tag, attributes, this.childs)
                        f.after(el, player)
                        f.remove(el)
                        if(this.triger && typeof this.triger == 'function') this.triger(player)
                    }
                }

                // 初始化完毕


            var link_list = f.qa(o.query_parent + ' a'),
                conv = o.mode.ALL || o.mode.FIRST,
                click = function(event) {
                    event.preventDefault()
                    var target = event.target,
                        converted = Co(target)
                        f.off(target, 'click', click)
                }
            f.each(link_list, function() {
                var link = this,
                    mode = Ck(link)
                if(mode){
                    if(!!api.option.apis[mode].silence){
                        Co(link)
                    } else if (conv && o.mode.FIRST){
                        Co(link)
                        conv = false
                    } else {
                        link.setAttribute(api.option.auto_sign, 'true')
                        f.on(link, 'click', click)
                    }
                }
            })
        }
    }
})