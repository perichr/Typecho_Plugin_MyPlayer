'use strict';
P({
    id: 'api.js',
    key: 'MyPlayer',
    Init: function(me){
        var o = me.option, f = me.fn, Add = function(key, item) {
            o.apis[key] = item
        }, AddRange = function(list) {
            me.fn.each(list, Add)
        }
        o('apis', {})
        o('auto_sign', 'data-auto-play')
        AddRange({
            '虾米': {
                'check': function(href) {
                    return href && /^http:\/\/www\.xiami\.com\/(song|album|artist|collect)\/\d/.test(href)
                },
                'jsonp': function(href) {
                    var el = this
                    el.xiami = href.replace(/.*\/(\d+)\/?/, '$1')
                    el.type = href.replace(/.*(song|album|artist|collect).*/, '$1')
                    el.single = el.type === 'song'
                    el.offical = el.single ? o('xiami_single') == '0' : o('xiami_multi') == '0'
                    if(!el.single && el.offical){
                        return 'http://perichr.jd-app.com/xiami.php?type=' + el.type + '&id=' + el.xiami
                    }
                    return false
                },
                'create': function(data) {
                    var bind = this,
                        el = bind.element
                    if(el.single && el.offical){
                        bind.base = 'flash'
                        bind.attributes.width = 257
                        bind.attributes.height = 33
                        bind.attributes.src = 'http://www.xiami.com/widget/0_' + el.xiami + '/singlePlayer.swf'
                    } else if(el.single && !el.offical) {
                        var op = {theme: f.trim(o('theme')), media: []}
                        op.media.push({
                            xiami: el.xiami,
                        })
                        if(bind.element.getAttribute(o.auto_sign)){
                            op.autoplay = true
                        }
                        bind.base = 'iframe'
                        bind.attributes.src = me.GetPath('../../player/#') + JSON.stringify(op)
                        bind.attributes.width = 223
                        bind.attributes.height = 24
                    } else if(!el.single && el.offical) {
                        if (data) {
                            var list = []
                            f.each(data, function(i, s){
                                list.push(s.song_id)
                            })
                            var theme = f.trim(o('theme')).split('|')
                            bind.base = 'flash'
                            bind.attributes.width = 235
                            bind.attributes.height = 346
                            bind.attributes.src = 'http://www.xiami.com/widget/0_' + list.join() + ',_' + bind.attributes.width + '_' + bind.attributes.height + '_' + theme[0] + '_' + theme[1] + '/multiPlayer.swf'
                            return true
                        }
                    } else if(!el.single && !el.offical) {
                        bind.base = 'iframe'
                        var op = {theme: f.trim(o('theme')), type: el.type, id: el.xiami}
                        if(el.getAttribute(o.auto_sign)){
                            op.autoplay = true
                        }
                        bind.attributes.src = me.GetPath('../../player/#') + JSON.stringify(op)
                        bind.attributes.width = 223
                        bind.attributes.height = 240
                    }
                }
            },
            '优酷视频': {
                'check': function(href) {
                    return href && 0 == href.indexOf('http://v.youku.com/v_show/id_')
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributes.width = 480
                    this.attributes.height = 400
                    this.attributes.src = href.replace(/^.*id_(.*)\.html$/g, 'http://player.youku.com/player.php/sid/$1/v.swf')
                }
            },
            '土豆视频': {
                'check': function(href) {
                    return href && 0 == href.indexOf('http://www.tudou.com/programs/view/')
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributes.width = 480
                    this.attributes.height = 400
                    this.attributes.src = href.replace('programs\/view', 'v') + 'v.swf'
                }
            },
            '爱奇艺视频': {
                'check': function(href) {
                    return href && 0 == href.indexOf('http://www.iqiyi.com/v_')
                },
                'jsonp': function(href) {
                    return me.GetPath('../../api.php') + '?service=iqiyi&id=' + href.replace(/^.*v_(.*)\.html$/g, '$1')
                },
                'create': function(data) {
                    if (data.url) {
                        this.base = 'flash'
                        this.attributes.width = 480
                        this.attributes.height = 400
                        this.attributes.src = data.url
                        return true
                    }
                }
            },
            '音悦台MV': {
                'check': function(href) {
                    return href && 0 == href.indexOf('http://v.yinyuetai.com/video/')
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributes.width = 480
                    this.attributes.height = 334
                    this.attributes.src = href.replace(/^.*\/(\d*)$/g, 'http://player.yinyuetai.com/video/player/$1/v_0.swf')
                }
            },
            '乐视TV': {
                'check': function(href) {
                    return href && 0 == href.indexOf('http://www.letv.com/ptv/vplay/')
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributes.width = 541
                    this.attributes.height = 450
                    this.attributes.src = href.replace(/^.*\/(\d*)\.html$/g, 'http://i7.imgs.letv.com/player/swfPlayer.swf?autoPlay=0&id=$1')
                }
            },
            '56视频': {
                'check': function(href) {
                    return href && /http:\/\/www.56.com\/[u\d]+\/v_/.test(href)
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributes.width = 480
                    this.attributes.height = 408
                    this.attributes.src = href.replace(/^.*\/v_(.*)\.html$/g, 'http://player.56.com/v_$id.swf')
                }
            },
            '哔哩哔哩': {
                'check': function(href) {
                    return /http:\/\/(www\.bilibili\.com|www\.bilibili\.tv|bilibili\.kankanews\.com)?\/video\/av([0-9]+)\/(?:index_([0-9]+)\.html)?/.test(href)
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributes.width = 544
                    this.attributes.height = 452
                    if (href.indexOf('.html') == -1) href += "/index_1.html"
                    var aid = href.replace(/^.*\/av(\d+)\/.*/g, '$1'),
                        page = href.replace(/^.*\/index_(\d+)\.html$/g, '$1')
                    this.attributes.src = 'http://static.hdslb.com/miniloader.swf?aid=' + aid + '&page=' + page
                }
            },
            '新浪视频': {
                'check': function(href) {
                    return href && (/#\d+$/.test(href) || /^http:\/\/video\.sina\.com\.cn\/.+\d+\.html$/.test(href))
                },
                'jsonp': function(href) {
                    return (/#\d+$/.test(href)) ? false : me.GetPath('../../api.php') + '?service=sina&url=' + encodeURIComeonent(href)
                },
                'create': function(data) {
                    var bind = this, bindWithVid = function( vid ){
                        bind.base = 'flash'
                        bind.attributes.width = 480
                        bind.attributes.height = 370
                        bind.attributes.src = 'http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid=' + vid + '/s.swf'
                    }
                    if(/#\d+$/.test(this.element.href)){
                        bindWithVid( this.element.href.replace(/.+#(\d+)$/g, '$1') )
                    } else if(data.url){
                        bindWithVid( data.url )
                        return true
                    }
                }
            },
            'mp3': {
                'optional': 'type, lyrics',
                'check': function(href, type) {
                    return type ? /^mp3$/.test(type) : (href && /\.(ogg|mp3)$/.test(href))
                },
                'create': function(href) {
                    this.base = 'iframe'
                    var op = {media: [], theme: f.trim(o('theme'))}
                    op.media.push({
                        url: href,
                        title: this.element.innerHTML,
                        lyrics: this.lyrics
                    })
                    if(this.element.getAttribute(o.auto_sign)){
                        op.autoplay = true
                    }
                    this.attributes.src = me.GetPath('../../player/#') + JSON.stringify(op)
                    this.attributes.width = 223
                    this.attributes.height = 24
                }
            },
            'gist': {
                'check': function(href) {
                    return href && /^https\:\/\/gist\.github\.com\/[^\/]+\/\w+/.test(href)
                },
                'create': function(href) {
                    this.base = 'iframe'
                    this.attributes.src = href + '.pibb'
                    this.attributes.height = 200
                }
            },
            'github': {
                'check': function(href) {
                    return href && /^https\:\/\/github\.com\/[^\/]+\/\w+/.test(href)
                },
                'create': function(href) {
                    this.base = 'iframe'
                    this.attributes.src = href.replace(/^https\:\/\/github\.com\/([^\/]+)\/([^\/]+)/, 'http://lab.lepture.com/github-cards/card.html?user=$1&repo=$2')
                    this.attributes.width = 400
                    this.attributes.height = 200
                }
            },
            'html5 audio': {
                'optional': 'type, lyrics',
                'check': function(href, type) {
                    return type ? /^ogg|mp3$/.test(type) : (href && /\.(ogg|mp3)$/.test(href))
                },
                'create': function(href) {
                    this.base = 'audio'
                    this.attributes.src = href
                }
            },
            'html5 video': {
                'optional': 'type, width, height',
                'check': function(href, type) {
                    return type ? /^ogg|mp4$/.test(type) : (href && /\.(ogv|mp4)$/.test(href))
                },
                'create': function(href) {
                    this.base = 'video'
                    this.attributs.width = this.width || 480
                    this.attributs.height = this.height || 400
                    this.attributes.src = href
                }
            },
            'flash': {
                'optional': 'type, width, height',
                'check': function(href, type) {
                    return type ? /^swf$/.test(type) : (href && /\.swf$/.test(href))
                },
                'create': function(href) {
                    this.base = 'flash'
                    this.attributs.width = this.width || 480
                    this.attributs.height = this.height || 400
                    this.attributs.src = href
                }
            },
        })
        
    }
})