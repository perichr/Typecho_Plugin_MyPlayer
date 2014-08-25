'use strict';
//MyPlayer 播放页面
(function(root, doc, $, undefined){
    var defaultOptions = {media:[]},
        $jplayer, $player, $list, $state, $title, $progress, $lyric, options = {}, current = -1, length, first = true
    $(function(){
        getOptions()
        init()
        setTheme(options)
        if(options.type && options.id){
            loadXiamis()
        } else {
            startMedias()
        }
    })
    function startMedias(){
        if(options.media && options.media.length > 0 ){
            if(options.media.length>1){
                $('body').append($list)
                $.each(options.media, function(index, value){
                    var id = value.xiami || value.song_id,
                        $li = $('<li>'),
                        $a = $('<a>')
                            .data('id', index)
                            .text(value.title || 'xiami:' + value.xiami)
                            .attr('href', id ? 'http://www.xiami.com/song/' + id : value.url)
                            .appendTo($li)
                    $list.append($li)
                })
                $list.on('click', 'a', function(event){
                    event.preventDefault()
                    var id = $(this).data('id')
                    current = id - 1
                    next()
                })
            }
            next()
        }
    }
    function next(){
        if(current == length -1 ){
            current = -1
        }
        load(options.media[++current])
        $list.find('.playing').removeClass('playing')
        $list.find('li:nth-child(' + (current + 1) + ') a').addClass('playing')
    }
    function setTheme(){
        var style = {
            '.player': {
                'color' : options.text,
                'background-color': options.front
            },
            '.list': {
                'border-top-color': options.text
            },
            '.list a': {
                'color' : options.text,
                'background-color': options.background
            },
            '.list a:hover,.list a.playing': {
                'color' : options.activedtext,
                'background-color': options.actived
            },
            '.state': {
                'border-left-color': options.text,
                'border-right-color': options.text
            },
            '.progress': {
                'background-color': options.actived
            },
        },
        str = ''
        $.each(style, function(tag, rules){
            str += tag
            str += '{'
            $.each(rules, function(key, rule){
                str += key
                str += ':'
                str += rule
                str += ';'
            })
            str += '}'
        })
        $('<style>').text(str).appendTo($('head'))
    }
    function loading(text){
        $title.text(text)
        $player.attr('title',text)
        doc.title = text
    }
    function loadXiamis(){
        $.ajax({
            url: '../api.php',
            data:{service: 'xiami',id: options.id, type: options.type},
            type: 'GET',
            dataType: 'jsonp',
            async: false,
            success: function(data) {
                if(data){
                    options.media = data
                    startMedias()
                }
            }
        })
    }
    function load(media){
        if($jplayer){
            $jplayer.jPlayer('destroy')
            $jplayer.unbind().empty().remove()
            $jplayer = null
        }
        if(media.url){
            setNewMedia(media)
        }else if(media.xiami){
            loading('正在尝试载入虾米音乐……')
            $.ajax({
                url: '../api.php',
                data:{service: 'xiami',id: media.xiami},
                type: 'GET',
                dataType: 'jsonp',
                async: false,
                success: function(data) {
                    if(data[0]){
                        data = data[0]
                        media.url = data.url
                        media.title = data.title
                        media.artist = data.artist
                        media.lyric = data.lyric_url
                        setNewMedia(media)
                    }
                },
                error:function(){
                    options.media.splice(current,1)
                    length--
                    current--
                    next()
                }
            })
        }
    }
    function getType(url){
        var index = url.indexOf('?')
        if(index>0){
            url = url.substring(0,index)
        }
        index = url.lastIndexOf('.')
        return url.substring(index+1)
    }
    function parseLyric(text){
        if(!/\[\d\d\:\d\d\.\d\d\]/.test(text)){
            return false
        }
        text = text.split('\r\n')
        var lyric = []
        $.each(text, function(index, value){
            value = $.trim(value)
            var d = value.match(/^\[\d{2}:\d{2}((\.|\:)\d{2})\]/g)
            if(!d) return
            var dt = String(d).split(':')
            var t = value.split(d)
            var _t = Math.round(parseInt(dt[0].split('[')[1])*60+parseFloat(dt[1].split(']')[0])*100)/100
              lyric.push([_t, t[1]])
        })
        return lyric
    }
    function setNewMedia(media){
        media.type = media.type || getType( media.url ) || 'mp3'
        $jplayer = $('<div>').appendTo($player).attr('id','jplayer')
        .bind($.jPlayer.event.timeupdate, function(e) {
            $progress.width(Math.round(e.jPlayer.status.currentPercentAbsolute / 100 * $player.width()))
        })
        .jPlayer({
            ready:function(){
                $title.text(media.title + (media.artist? ' by ' + media.artist : ''))
                $player.attr('title',media.title)
                doc.title = media.title
                var obj ={}
                obj[media.type] = media.url
                $jplayer.jPlayer('setMedia', obj)
                if(!first || options.autoplay){
                    play()
                }
                first = false
            },
            ended:function(){
                $progress.width('0')
                if(length == 1){
                    play()
                }else{
                    next()
                }                
            },
            consoleAlerts:true,
            preload: 'none',
            swfPath: '../assets/swf/'
            ,supplied: media.type
        })
        if(media.lyric){
            $.ajax({
                url: '../api.php',
                data:{service: 'lyric', url: media.lyric},
                type: 'GET',
                async: false,
                success: function(data) {
                    if(data && data.source){
                        data = parseLyric(data.source)
                        if(data){
                            $jplayer.jPlayer.hasLyric = true
                            var m = 0
                            $jplayer.bind($.jPlayer.event.timeupdate, function(e) {
                                if(e.jPlayer.status.currentTime < 0.5){
                                    m = 0
                                }
                                if ( m < data.length && e.jPlayer.status.currentTime > data[m][0]){
                                    $lyric.text(data[m][1])
                                    $player.attr('title',$lyric.text())
                                    m++
                                }
                            })
                            
                        }
                    }
                }
            })
        }
    }
    function getOptions(){
        options = $.extend(options, defaultOptions)
        try{
            $.extend(options, JSON.parse(document.location.hash.replace(/^#/,'')))
        }catch(e){
        }
        if(options.theme){
            var t = options.theme.split('|')
            if(t[0]){
                options.front = '#' + t[0]
            }
            if(t[1]){
                options.background = '#' + t[1]
            }
            if(t[2]){
                options.text = '#' + t[2]
            }
            if(t[3]){
                options.actived = '#' + t[3]
            }
            if(t[4]){
                options.activedtext = '#' + t[4]
            }
        }
    }
    function init(){
        $player = $('<div>').addClass('player')
        $progress = $('<span>').addClass('progress')
        $state = $('<span>').addClass('state').on('click',toggle)
        $title = $('<span>').addClass('title')
        $lyric = $('<span>').addClass('lyric').hide()
        $list = $('<ol>').addClass('list')
        $player.append($progress, $state, $title, $lyric)
        $('body').append($player)
    }
    function play(){
        if($jplayer){
            $jplayer.jPlayer('play')
            $state.addClass('playing')
            if($jplayer.jPlayer.hasLyric){
                $title.hide()
                $lyric.show()
            }
        }
    }
    function pause(){
        if($jplayer){
            $jplayer.jPlayer('pause')
            $state.removeClass('playing')
            if($jplayer.jPlayer.hasLyric){
                $title.show()
                $lyric.hide()
                $player.attr('title',$title.text())
            }
        }
    }
    function toggle(){
        $state.hasClass('playing') ? pause() : play()
    }
})(window, document, jQuery)

