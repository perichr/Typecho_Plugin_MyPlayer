'use strict';
P({
    id: 'mplayer.js',
    key: 'MyPlayer',
    Init: function(me){
        setStyle()
        $.extend({
            min:function(a, b){return a < b ? a : b },
            max:function(a, b){return a > b ? a : b }
        })
        $.fn.mp = function(){
            var $this = $(this),
                $ol = $('ol', $this),
                $lists = $('li', $ol),
                list = getList($lists),
                $player = createPlayer().prependTo($this),
                $jplayer = $('.jplayer', $this),
                $img = $('img', $player),
                $progress = $('.progress', $player),
                $played = $('.progressplayed', $player),
                $handle = $('.progresshandle', $player),
                $current = $('.currenttime', $player),
                auto = !!$this.data('autoplay'),
                first = true
            if($jplayer.size() == 0){
                $jplayer = $('<span>')
                    .addClass('jplayer')
                    .appendTo($player)
            }
            if(list.length < 2){
                $ol.css('display', 'none')
            }
            setPlayer()
            $ol.on('click', 'li', function(){
                setPlayer($(this).data('index'))
            })
            $progress.on('click.seek', click_seek)
            $played.on('click.seek', click_seek)
            $handle.on('mousedown.seek', mousedown_seek)
            $img.click(toggle)
            function click_seek(event){
                play(get_duration(event.clientX))
            }
            function mousedown_seek(event){
                pause()
                $('body').on('mousemove.seek', mousemove_seek_with_offset(event.clientX - $handle.offset().left))
                $('body').on('mouseup.seek', mouseup_seek)
            }
            function mousemove_seek_with_offset(offset){
                return function(event){
                    setprogress(event.clientX - offset - $played.offset().left)
                    $current.text(prettytime(get_duration()))
                }
            }
            function mouseup_seek(event){
                $('body').off('mousemove.seek')
                $('body').off('mouseup.seek')
                play(get_duration())
            }
            function get_duration(x){
                var seek_percent = ((x || $handle.offset().left) - $played.offset().left) / ($progress.width() - $handle.width()),
                    seek_duration = $jplayer.data('jPlayer').status.duration * seek_percent
                return seek_duration
            }
            function setPlayer(index){
                if(list.length == 0){ return }
                if(!index || index >= list.length){index = 0}
                var $li = $lists.eq(index)
                if($li.hasClass('playing')){
                    toggle()
                    return
                }
                $('.playing', $ol).removeClass('playing')
                $li.addClass('playing')
                var media = list[index],
                    $li_img =$li.find('img')
                if(media.title){
                    $('.title', $player).text(media.title)
                    $player.attr('title', media.title)
                }
                if($li_img.attr('src')){
                    $img.attr('src',$li_img.attr('src'))
                }
                $img.attr('alt', $li_img.attr('alt'))
                $jplayer.jPlayer('destroy')
                $jplayer.jPlayer({
                        timeupdate: function(event) {
                            var width = $progress.width() - $handle.width(),
                                currrent = event.jPlayer.status.currentPercentAbsolute / 100 * width
                            setprogress(currrent)
                            $current.text(prettytime(event.jPlayer.status.currentTime))
                        },
                        loadeddata :function(event){
                            $('.totaltime', $player).text(prettytime(event.jPlayer.status.duration))
                            $current.text(prettytime(0))
                        },
                        ready:function(){
                            var obj ={}
                            obj[media.type] = media.url
                            $jplayer.jPlayer('setMedia', obj)
                            if(!first || auto){
                                play()
                            }
                            first = false
                        },
                        ended:function(){
                            setprogress(0)
                            if(list.length == 1){
                                play()
                            }else{
                                setPlayer( ++ index)
                            }
                        },
                        consoleAlerts:true,
                        preload: 'none',
                        swfPath: '../assets/swf/'
                        ,supplied: media.type
                    })
            }
            function play(time){
                time ? $jplayer.jPlayer('play', time) : $jplayer.jPlayer('play')
                $player.addClass('playing')
            }
            function pause(){
                $jplayer.jPlayer('pause')
                $player.removeClass('playing')
            }
            function stop(){
                $jplayer.jPlayer('stop')
                $player.removeClass('playing')
            }
            function toggle(){
                $player.hasClass('playing') ? pause() : play()
            }
            function setprogress(width){
                width = $.max(width, 0)
                width = $.min(width, $progress.width() - $handle.width())
                $played.width(width)
                $handle.css('left', width + 'px')
            }
        }
        function prettytime(secends){
            secends = Math.round(secends)
            var minute = Math.floor(secends/60),
                hour = Math.floor(minute/60),
                text = ''
            secends = secends - minute * 60
            minute = minute - hour * 60
            if(hour > 0){
                text += hour < 10 ? ('0' + hour) : hour
                text += ':'
            }
            text += minute < 10 ? ('0' + minute) : minute
            text += ':'
            text += secends < 10 ? ('0' + secends) : secends
            return text
        }
        function getList($list){
            var list = []
            $.each($list, function(index){
                var $this = $(this),
                    $img = $('<img>').prependTo($this),
                    track = {
                        title: $this.text()
                    }
                    
                $this.data('index', index)
                getData($this, track, 'url')
                getData($this, track, 'type')
                getData($this, track, 'lyrics')
                getData($this, track, 'pic')
                getData($this, track, 'album')
                getData($this, track, 'artist')
                var audio = !!~'mp3,'.indexOf(track.type)
                if(track.artist){
                    var aritst = $('<span>').text(track.artist).appendTo($this)
                }
                list.push(track)
                if(track.pic){
                    $img.attr('src', track.pic)
                }
                $img.attr('alt', audio ? 'Audio' : 'Video')
            })
            return list
            function getData($this, track, key, newkey){
                var value = $this.data(key)
                if(!newkey){ newkey = key }
                if(value) {track[newkey] = value}
            }
        }
        function createPlayer(){
            return $('<div class="player"><img /><span class="title"></span><span class="time"><span class="currenttime"></span>/<span class="totaltime"></span></span><span class="progress"></span><span class="progressplayed"></span><span class="progresshandle"></span></div>')
        }
        function createStyleText(style){
            var str = '@keyframes play { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }'
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
            return str
        }
        function setStyle(){
            var theme = me.option('theme').split('|')
            theme = $.extend({
                    'front' : '#CCC',
                    'background' : '#FFF',
                    'text' : '#333',
                    'active' : '#AAA',
                    'activetext' : '#FFF'
                }, {
                    'front' : '#' + theme[0],
                    'background' : '#' + theme[1],
                    'text' : '#' + theme[2],
                    'active' : '#' + theme[3],
                    'activetext' : '#' + theme[4]
                })
            var style = {
                    '.mplayer' : {
                        'margin' : '0 0 0 64px',
                        'width' : '80%',
                        'min-width' : '240px',
                        'max-width' : '600px',
                        'text-align' : 'left',
                        'font-size' : '16px',
                        'color' : theme.text,
                        'background' : theme.background,
                    },
                    '.mplayer .player' : {
                        'position' :'relative',
                        'height' : '70px',
                        'text-shadow': '2px 2px 2px ' + theme.front,
                    },
                    '.mplayer .player img' : {
                        'transition': '.3s ease',
                        'border':'none',
                        'height':'64px',
                        'width':'64px',
                        'position':'absolute',
                        'left':'0',
                        'top':'0',
                        'text-indent':'0',
                        'text-align' : 'center',
                        'vertical-align':'middle',
                        'line-height':'64px',
                        'font-size':'20px',
                        'overflow':'hidden',
                        'cursor': 'pointer',
                        'z-index' : '1'
                    },
                    '.mplayer .player.playing img' : {
                        'background' : theme.active,
                        'color' : theme.activetext,
                        'animation': '5s play linear infinite',
                        'border-radius' : '32px'
                    },
                    '.mplayer .player .progressplayed,.mplayer .player .progresshandle,.mplayer .player .progress' : {
                        'height':'6px',
                        'position':'absolute',
                        'left':'0',
                        'bottom':'0',
                        'transition': '.1s ease',
                    },
                    '.mplayer .player .progress' : {
                        'cursor': 'crosshair',
                        'width':'100%',
                        'background' : theme.front,
                    },
                    '.mplayer .player .progresshandle' : {
                        'cursor': 'e-resize',
                        'width':'12px',
                        'background' : theme.activetext,
                    },
                    '.mplayer .player .progressplayed' : {
                        'cursor': 'crosshair',
                        'width':'0',
                        'background' : theme.activetext,
                        'opacity' : '.6'
                    },
                    '.mplayer .player .title' : {
                        'display':'block',
                        'margin':'0 0 0 64px'
                    },
                    '.mplayer .player .time' : {
                        'display':'block',
                        'margin':'0 0 0 72px'
                    },
                    '.mplayer ol' : {
                        'margin': '0 0 0 0',
                        'list-style-position': 'inside',
                        'max-height': '16em',
                        'overflow-y': 'scroll',
                        'overflow-x': 'hidden',
                        'list-style': 'none'
                    },
                    '.mplayer li' : {
                        'position' :'relative',
                        'cursor': 'pointer',
                        'line-height':'36px',
                        'height':'36px',
                        'margin' : '1px 0',
                        'padding' : '0 0 0 12px',
                    },
                    '.mplayer li span' : {
                        'opacity': '0.5',
                    },
                    '.mplayer li img' : {
                        'position' :'absolute',
                        'vertical-align':'middle',
                        'border':'none',
                        'height':'36px',
                        'width':'36px',
                        'text-align' : 'center',
                        'font-size':'6px',
                        'left':'0',
                        'top':'0',
                        'overflow':'hidden',
                    },
                    '.mplayer li span:before' : {
                        'content': '"by"',
                        'font-size': '12px',
                        'margin' : '6px'
                    },
                    '.mplayer li.playing' : {
                        'background' : theme.active,
                        'color' : theme.activetext,
                        'font-weight': 'bolder'
                    },
                    '.mplayer li:hover' : {
                        'background' : theme.active,
                        'color' : theme.activetext,
                    }
                }
                
            var $style = $('#mp_style')
            if($style.size() == 0){
                $style = $('<style id="mp_style"></style>').appendTo('head')
            }
            $style.text(createStyleText(style))
        }
    }
})
