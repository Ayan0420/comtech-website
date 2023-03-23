(function(window, document) {
    "use strict";
    var $grid;
    var yt_ids = [];
    var yt_players = [];
    var data_storage;
    var original_data;
    var last_key;
    var env_urls = skGetEnvironmentUrls('facebook-page-posts');
    var app_url = env_urls.app_url;
    var app_backend_url = env_urls.app_backend_url;
    var app_file_server_url = env_urls.app_file_server_url;
    var sk_img_url = env_urls.sk_img_url;
    var sk_app_url = env_urls.sk_app_url;
    var sk_api_url = env_urls.sk_api_url;
    var el = document.getElementsByClassName('sk-ww-facebook-page-posts')[0];
    if (el == undefined) {
        var el = document.getElementsByClassName('dsm-ww-facebook-page-posts')[0];
        if (el != undefined) {
            el.className = "sk-ww-facebook-page-posts";
        }
    }
    if (el != undefined) {
        el.innerHTML = "<div class='first_loading_animation' style='text-align:center; width:100%;'><img src='" + app_url + "images/ripple.svg' class='loading-img' style='width:auto !important;' /></div>";
    }
    loadCssFile(app_url + "libs/magnific-popup/magnific-popup.css");
    loadCssFile("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
    loadCssFile(app_url + "libs/swiper/swiper.min.css");

    function loadCssFile(filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
    }
    if (window.jQuery === undefined) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js");
        if (script_tag.readyState) {
            script_tag.onreadystatechange = function() {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    scriptLoadHandler();
                }
            };
        } else {
            script_tag.onload = scriptLoadHandler;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    } else {
        jQuery = window.jQuery;
        scriptLoadHandler();
    }

    function loadScript(url, callback) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);
        scriptTag.setAttribute("defer", "");
        if (url == "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v7.0&appId=679844159512553&autoLogAppEvents=1") {
            scriptTag.setAttribute("id", "facebook_sdk");
            scriptTag.setAttribute("nonce", "1o3d2lue");
        }
        if (typeof callback !== "undefined") {
            if (scriptTag.readyState) {
                scriptTag.onreadystatechange = function() {
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        callback();
                    }
                };
            } else {
                scriptTag.onload = callback;
            }
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }

    function scriptLoadHandler() {
        loadScript(app_url + "libs/magnific-popup/jquery.magnific-popup.js", function() {
            loadScript("https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v7.0&appId=679844159512553&autoLogAppEvents=1", function() {
                loadScript(app_url + "libs/js/moment.js", function() {
                    loadScript(app_url + "libs/js/moment-timezone.js?v=" + (new Date()).getTime(), function() {
                        loadScript("https://unpkg.com/masonry-layout@4.2.0/dist/masonry.pkgd.min.js", function() {
                            loadScript("https://www.youtube.com/player_api", function() {
                                loadScript(app_url + "libs/swiper/swiper.min.js", function() {
                                    main();
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    function applySearchFeature(data_storage, search_term) {
        var new_posts_lists = [];
        jQuery.each(data_storage, function(index, value) {
            if (value.message && value.message.toLowerCase().indexOf(search_term.toLowerCase()) != -1) {
                new_posts_lists.push(value);
            } else if (value.post_id && value.post_id.indexOf(search_term) != -1) {
                new_posts_lists.push(value);
            }
        });
        return new_posts_lists;
    }
    async function showSharedPosts(sk_facebook_feed, to_sync) {
        sk_facebook_feed.find('.sk-meta-data').each(async function() {
            var object_element = jQuery(this);
            if (!object_element.hasClass('sk-meta-done')) {
                var parent_id = object_element.attr('id');
                var object_id = object_element.attr('data-id');
                var embed_id = getDsmEmbedId(sk_facebook_feed);
                var json_url = app_backend_url + "facebook/post?parent_id=" + parent_id + "&embed_id=" + embed_id;
                jQuery.getJSON(json_url, function(data) {
                    if (data.id && data.from) {
                        object_element.addClass('sk-meta-done');
                        var post_items = "<div onclick=\"window.open('" + data.permalink_url + "');\">";
                        post_items += "<div class='sk-meta-data-info'>";
                        post_items += "<img src='https://graph.facebook.com/v5.0/" + data.from.id + "/picture/?type=large&access_token='/>";
                        post_items += "<div><b>" + data.from.name + "</b></div>";
                        post_items += "</div>";
                        if (data.message) {
                            post_items += "<div class='sk-meta-data-content'>";
                            post_items += data.message;
                            post_items += "</div>";
                        }
                        if (data.full_picture) {
                            post_items += "<div class='sk-meta-data-media'>";
                            post_items += "<img src='" + data.full_picture + "'/>";
                            post_items += "</div>";
                        }
                        post_items += "</div>";
                        object_element.html(post_items);
                    } else {
                        var item = data_storage.find(item => item.id === object_id);
                        if (item && item.media_attachments && item.media_attachments[0] && item.media_attachments[0].thumbnail) {
                            var one_data = item.media_attachments[0];
                            object_element.addClass('sk-meta-done');
                            var post_items = "<div onclick=\"window.open('" + one_data.url + "');\">";
                            if (one_data.description) {
                                post_items += "<div class='sk-meta-data-content'>";
                                post_items += one_data.description;
                                post_items += "</div>";
                            } else if (one_data.title) {
                                post_items += "<div class='sk-meta-data-content'>";
                                post_items += one_data.title;
                                post_items += "</div>";
                            }
                            if (one_data.thumbnail) {
                                post_items += "<div class='sk-meta-data-media'>";
                                post_items += "<img src='" + one_data.thumbnail + "'/>";
                                post_items += "</div>";
                            }
                            post_items += "</div>";
                            object_element.html(post_items);
                        }
                    }
                }).fail(function(e) {
                    console.log("Shared content is missing.");
                });
            }
        })
    }

    function applyDateFormat(sk_facebook_feed, data_storage) {
        var date_format = getDsmSetting(sk_facebook_feed, 'date_format');
        var use_24_hour_clock = getDsmSetting(sk_facebook_feed, 'use_24_hour_clock');
        var timezone = getDsmSetting(sk_facebook_feed, 'timezone');
        var show_time_posted = getDsmSetting(sk_facebook_feed, 'show_time_posted');
        var show_post_date = getDsmSetting(sk_facebook_feed, 'show_post_date');
        var format = 'MMM D, YYYY';
        if (date_format == 'M d, Y') {
            format = 'MMM D, YYYY';
        } else if (date_format == 'jS M Y') {
            format = 'Do MMM YYYY';
        } else if (date_format == 'Y M jS') {
            format = 'YYYY MMM Do';
        } else if (date_format == 'Y-m-d') {
            format = 'YYYY-MM-D';
        } else if (date_format == 'm/d/Y') {
            format = 'MM/D/YYYY';
        } else if (date_format == 'd/m/Y') {
            format = 'D/MM/YYYY';
        } else if (date_format == 'd.m.Y') {
            format = 'D.MM.YYYY';
        } else if (date_format == 'd-m-Y') {
            format = 'D-MM-YYYY';
        }
        if (use_24_hour_clock == 1 && show_time_posted == 1) {
            format = format + ' HH:mm';
        } else if (show_time_posted == 1) {
            format = format + ' hh:mm A';
        }
        var new_posts_lists = [];
        jQuery.each(data_storage, function(index, value) {
            if (data_storage[index] && data_storage[index].created_time) {
                var date_time = data_storage[index].created_time;
                if (show_post_date == 1 && timezone) {
                    try {
                        data_storage[index].post_date_time = moment(date_time).tz(timezone).format(format);
                    } catch {
                        data_storage[index].post_date_time = moment(date_time).format(format);
                    }
                } else {
                    data_storage[index].post_date_time = moment(date_time).format(format);
                }
            }
        });
        return data_storage;
    }

    function predefinedPostFeature(data_storage, predefined_search_keyword) {
        var keywords = predefined_search_keyword.split(",");
        console.log(keywords);
        var new_posts_list = [];
        for (let item of data_storage) {
            if (item) {
                for (var i = 0; i < keywords.length; i++) {
                    if (item.message && item.message.toLowerCase().indexOf(keywords[i].trim().toLowerCase()) != -1) {
                        new_posts_list.push(item);
                        break;
                    } else if (item.description && item.description.toLowerCase().indexOf(keywords[i].trim().toLowerCase()) != -1) {
                        new_posts_list.push(item);
                        break;
                    } else if (item.name && item.name.toLowerCase().indexOf(keywords[i].trim().toLowerCase()) != -1) {
                        new_posts_list.push(item);
                        break;
                    }
                }
            }
        };
        return new_posts_list;
    }

    function moderationTabFeature(sk_facebook_feed, data_storage, turnon_preapproval_posts) {
        var preapproved_posts = [];
        var excluded_posts = [];
        if (turnon_preapproval_posts == 1) {
            if (getDsmSetting(sk_facebook_feed, "preapproved_posts") != "") {
                preapproved_posts = getDsmSetting(sk_facebook_feed, "preapproved_posts").split(",");
            }
        } else if (getDsmSetting(sk_facebook_feed, "excluded_posts") != "") {
            excluded_posts = getDsmSetting(sk_facebook_feed, "excluded_posts").split(",");
        }
        var new_posts_list = [];
        for (let item of data_storage) {
            if (item) {
                if (["106330322743688_479124244255671", "106330322743688_478210624347033", "106330322743688_477298584438237"].includes(item.id)) {
                    item.media_attachments = [{
                        "thumbnail": "https://external-ord5-1.xx.fbcdn.net/emg1/v/t13/17436627457658256848?url=https%3A%2F%2Fwww.kalix.se%2Fcontentassets%2Fa2544fcc5e67452aa68428023fc8c1b3%2F304808120_110394221803604_7568028101721080709_n.jpg&fb_obo=1&utld=kalix.se&stp=c0.5000x0.5000f_dst-emg0_p360x360_q75&ccb=13-1&oh=06_AaokQwVvgz9JSNRLmKVsq_-7OCuvVfoXi45SvQAoWUrpKg&oe=6349130D&_nc_sid=834697",
                        "type": "share",
                        "description": "Den 10â€“13 oktober 2022 kan du som vill lÃ¤ra dig mer om psykisk hÃ¤lsa ta del av en rad intressanta fÃ¶relÃ¤sningar â€“ helt kostnadsfritt.",
                        "title": "Norrbottens digitala vecka fÃ¶r psykisk hÃ¤lsa",
                        "source": "",
                        "url": "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.kalix.se%2FAktuellt%2FOmsorg-och-raddning%2Fnorrbottens-digitala-vecka-for-psykisk-halsa%2F&h=AT3D0MDblxZM5hCTmBPGdhq-JDUukHsbGYh9nXDQecR1rurkrVGOxLp3U7wBqMLAItC4rOzATj00oM1PorL5dLETawOzJnUPEn--SJa02H47Zx081idrUQPbE2MhipgH&s=1"
                    }]
                }
                if (turnon_preapproval_posts == 1) {
                    if (preapproved_posts.includes(item.id)) {
                        new_posts_list.push(item);
                    }
                } else {
                    if (turnon_preapproval_posts == 0 && excluded_posts.includes(item.id)) {} else {
                        new_posts_list.push(item);
                    }
                }
            }
        };
        return new_posts_list;
    }

    function removeLinks(sk_facebook_feed) {
        if (getDsmSetting(sk_facebook_feed, "links_clickable") != 1) {
            sk_facebook_feed.find('a').each(function(i, element) {
                var object_element = jQuery(element);
                object_element.removeAttr('href');
            });
            sk_facebook_feed.find('.href_status_trigger_feed').each(function(i, element) {
                var object_element = jQuery(element);
                object_element.removeAttr('onclick');
            });
            sk_facebook_feed.find('a,.href_status_trigger_feed').css({
                'color': getDsmSetting(sk_facebook_feed, "widget_font_color")
            });
        } else {
            sk_facebook_feed.find('a,.href_status_trigger_feed').css({
                'color': getDsmSetting(sk_facebook_feed, "widget_link_color")
            });
        }
    }

    function isIframeLoaded(sk_facebook_feed) {
        jQuery('.mfp-content').find('.fb-video iframe').on("load", function() {
            jQuery('.mfp-content').find(".sk-video-popup-spinner").hide();
            jQuery(".sk-popup-video-content").css({
                "background-color": "transparent"
            });
            jQuery(".sk_media_content_description").css({
                "background-color": getDsmSetting(sk_facebook_feed, "pop_up_bg_color")
            });
            timeInterval();
            setTimeout(function() {
                timeInterval();
            }, 300);
        });
    }

    function loadYTScript() {
        jQuery('iframe').filter(function() {
            return this.src.indexOf('https://www.youtube.com/') == 0
        }).each(function(k, v) {
            if (!this.id) {
                this.id = 'embeddedvideoiframe' + k;
            }
            var my_id = this.id;
            if (yt_ids.indexOf(this.id) != -1) {
                console.log("WARNING: Video exist, no need to initialize.")
            } else {
                yt_ids.push(this.id);
                window.YT.ready(function() {
                    yt_players.push(new YT.Player(my_id, {
                        events: {
                            'onStateChange': function(event) {
                                if (event.data == YT.PlayerState.PLAYING) {
                                    jQuery.each(yt_players, function(k, v) {
                                        if (this.getIframe().id != event.target.getIframe().id) {
                                            this.pauseVideo();
                                        }
                                    });
                                }
                            }
                        }
                    }));
                });
            }
        });
    }

    function loadMoreTextFeature(sk_facebook_feed, content) {
        if (content.parent().find(".sk-post-text-new").length > 0)
            return;
        var minimized_elements = content;
        var character_limit = sk_facebook_feed.find('.character_limit').text();
        var maxchars = character_limit;
        if (content.text().length < maxchars || character_limit == 0) {
            return;
        }
        var $this = minimized_elements;
        $this.hide();
        var children = $this.contents();
        var short_description = jQuery('<div />');
        short_description.addClass("sk-post-text-new");
        var len = children.length;
        var count = 0;
        var i = 0;
        while (i < len) {
            var $elem = jQuery(children[i]).clone();
            var text = $elem.text();
            var l = text.length;
            if (count + l > maxchars) {
                var newText = text.slice(0, maxchars - count);
                if ($elem.get(0).nodeType === 3) {
                    $elem = document.createTextNode(newText);
                } else {
                    $elem.text(newText);
                }
                short_description.append($elem);
                break;
            }
            count += l;
            short_description.append($elem);
            i++;
        }
        short_description.append(jQuery('<span>...</span>'));
        $this.after(short_description);
        short_description.append(jQuery('<a href="#" class="more">' + getDsmSetting(sk_facebook_feed, "show_more_text") + '</a>').on('click', function(ev) {
            ev.preventDefault();
            $this.show();
            if (jQuery(this).parent().parent().find(".sk-post-text").find('.sk_show_less').length < 1) {
                jQuery(this).parent().parent().find(".sk-post-text").append("<br><a class='sk_show_less'>" + getDsmSetting(sk_facebook_feed, "show_less_text") + "</a>");
                jQuery(this).parent().parent().find(".sk-post-text").find('.sk_show_less').on('click', function() {
                    sk_facebook_feed.find('.grid-content').css({
                        "height": "auto"
                    });
                    sk_facebook_feed.find('.grid-item-facebook-page-posts').css({
                        "height": "auto"
                    });
                    jQuery(this).parent().parent().find(".sk-post-text").hide();
                    jQuery(this).parent().parent().find(".sk-post-text-new").show();
                    applyMasonry();
                    setTimeout(function() {
                        applyMasonry();
                    }, 500);
                });
            }
            jQuery(this).parent().parent().find('.sk_show_less').show();
            applyMasonry();
            setTimeout(function() {
                applyMasonry();
            }, 500);
            short_description.hide();
        }));
        sk_facebook_feed.find('.more').css({
            'font-size': getDsmSetting(sk_facebook_feed, "details_font_size") + 'px'
        });
        sk_facebook_feed.find('.sk-post-text-new,.sk-post-text, .post-post-counts, .sk_link_meta, .sk_video_name, .sk_post_description, .sk-link-title').css({
            'color': getDsmSetting(sk_facebook_feed, "details_font_color")
        });
    }

    function nl2br(str, is_xhtml) {
        if (typeof str === 'undefined' || str === null) {
            return '';
        }
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    function replaceContentWithLinks(html, sk_facebook_feed) {
        if (html.hasClass("linkified")) {
            return;
        }
        html.addClass("linkified")
        var text = html.html();
        if (text) {
            text = text.replace(/(\r\n|\n\r|\r|\n)/g, "<br>");
            text = text.split("<br>").join(" <br> ");
            text = replaceHttpToLink(text);
            text = text.split(">https://ess.com<").join(">ess.com<");
            var splitted_text = text.split(' ');
            if (splitted_text && splitted_text.length > 0) {
                jQuery.each(splitted_text, function(key, value) {
                    if (value.charAt(0) == "#") {
                        var original_text = value.replace('#', '');
                        original_text = original_text.replace(/^\,+|\,+$/g, '');
                        original_text = original_text.replace("</div>", '');
                        if (key == splitted_text.length - 1) {
                            text = text.replace(' ' + value, ' <a target="_blank" href="http://facebook.com/hashtag/' + original_text + '">' + value + '</a>');
                        } else {
                            text = text.replace(value + ' ', '<a target="_blank" href="http://facebook.com/hashtag/' + original_text + '">' + value + '</a> ');
                        }
                    } else if (value.charAt(0) == "@") {
                        var original_text = value.replace('@', '');
                        text = text.replace(value + ' ', ' <a target="_blank" href="http://facebook.com/' + original_text + '">' + value + '</a> ');
                    }
                    if (value.indexOf("sec.state") != -1) {
                        text = text.replace(value + ' ', ' <a target="_blank" href="https://' + value + '">' + value + '</a> ');
                    }
                });
            }
            html.html(text);
            if (html.hasClass("more") == false)
                loadMoreTextFeature(sk_facebook_feed, html);
            applyPopUpColors(sk_facebook_feed);
            if (html.hasClass('sk_pop_video_feed_video_description')) {
                html.find('a').css({
                    'color': getDsmSetting(sk_facebook_feed, "pop_up_link_color")
                });
            } else {
                html.find('a').css({
                    'color': getDsmSetting(sk_facebook_feed, "details_link_color")
                });
            }
            jQuery('.sk_post_message').css({
                'word-wrap': 'break-word',
            });
        }
        applyDsmDetailsLinkHoverColor(sk_facebook_feed);
    }

    function replaceHttpToLink(content) {
        content = addHttpsToWord(content);
        var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var element_content = content.replace(exp_match, '<a class="href_status_trigger hide-link" target="_blank" href="$1">$1</a>');
        var new_exp_match = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var new_content = element_content.replace(new_exp_match, '$1<a class="href_status_trigger hide-link" target="_blank" href="https://$2">$2</a>');
        return new_content;
    }

    function addHttpsToWord(content) {
        var temporary = content.split(" ");
        for (var i = 0; i < temporary.length; i++) {
            if (temporary[i].indexOf(".com") != -1 && temporary[i].indexOf("http") == -1) {
                temporary[i] = "https://" + temporary[i];
            }
        }
        temporary = temporary.join(" ");
        return temporary;
    }

    function getDsmEmbedId(sk_facebook_feed) {
        var embed_id = sk_facebook_feed.attr('embed-id');
        if (embed_id == undefined) {
            embed_id = sk_facebook_feed.attr('data-embed-id');
        }
        return embed_id;
    }

    function getDsmSetting(sk_facebook_feed, key) {
        return sk_facebook_feed.find("." + key).text();
    }

    function loadBioInformation(sk_facebook_feed, data, search_term) {
        var post_items = "";
        if (getDsmSetting(sk_facebook_feed, "show_profile_picture") == 0 && getDsmSetting(sk_facebook_feed, "show_profile_username") == 0 && getDsmSetting(sk_facebook_feed, "show_profile_follow_button") == 0 && getDsmSetting(sk_facebook_feed, "show_profile_follower_count") == 0 && getDsmSetting(sk_facebook_feed, "show_profile_name") == 0 && getDsmSetting(sk_facebook_feed, "show_profile_description") == 0 && getDsmSetting(sk_facebook_feed, "show_profile_website") == 0 && getDsmSetting(sk_facebook_feed, "show_search_box") == 0) {} else {
            post_items += "<div class='facebook-page-posts-user-root-container'>";
            if (getDsmSetting(sk_facebook_feed, "show_search_box") == 1) {
                var style = "";
                if (sk_facebook_feed.width() > 500 && (getDsmSetting(sk_facebook_feed, "show_profile_picture") == 1 || getDsmSetting(sk_facebook_feed, "show_profile_name") == 1)) {
                    style = "style='right:30px;'";
                }
                post_items += "<div class='sk-search-container' onclick='void(0);' " + style + ">";
                post_items += "<div class='sk_search_element_container'>";
                post_items += "<div class='container_sk_ww_input_and_icon'>";
                post_items += "<form class='sk_ww_search_facebook_videos_form'>";
                post_items += "<input type='text' class='sk_ww_search_facebook_feed_keyword' placeholder='Search...' value='" + search_term + "'/>";
                if (search_term) {
                    post_items += "<i class='fa fa-times sk_ww_search_icon' aria-hidden='true'></i>";
                } else {
                    post_items += "<i class='fa fa-search sk_ww_search_icon' aria-hidden='true'></i>";
                }
                post_items += "</form>";
                post_items += "</div>";
                post_items += "</div>";
                post_items += "</div>";
            }
            post_items += "<div class='sk-bio-container'>";
            if (getDsmSetting(sk_facebook_feed, "show_profile_picture") == 1) {
                post_items += "<div class='sk-facebook-page-posts-profile-pic-container'>"
                post_items += "<div class='sk-facebook-page-posts-profile-pic' style='background-image:url(" + data.bio.profile_picture + ");'></div>";
                post_items += "</div>";
            }
            post_items += "<div class='sk-facebook-page-posts-profile-info'>";
            post_items += "<div class='sk_facebook_posts_feed_username_follow'>";
            if (getDsmSetting(sk_facebook_feed, "show_profile_name") == 1) {
                post_items += "<span class='sk-facebook-page-posts-profile-usename'><a class='href_status_trigger_feed' target='_blank' style='text-decoration: none;' href='https://www.facebook.com/" + data.bio.id + "'>" + data.bio.name + "</a></span>";
            }
            post_items += "</div>";
            post_items += "<div class='sk-facebook-page-posts-profile-counts'>";
            if (getDsmSetting(sk_facebook_feed, "show_profile_follower_count") == 1) {
                post_items += "<span class='sk-facebook-page-posts-profile-count-item'><span class='f-w-b'>" + formatNumber(data.bio.fan_count) + "</span> " + getDsmSetting(sk_facebook_feed, "likes_text") + "</span>";
            }
            if (getDsmSetting(sk_facebook_feed, "show_profile_followers_count") == 1 && data.bio.followers_count > 0) {
                post_items += "<span class='sk-facebook-page-posts-profile-count-item'><span class='f-w-b'>" + formatNumber(data.bio.followers_count) + "</span> followers</span>";
            }
            if (getDsmSetting(sk_facebook_feed, "show_profile_username") == 1 && typeof data.bio.username != 'undefined' && data.bio.username && data.bio.username != "undefined") {
                if (getDsmSetting(sk_facebook_feed, "show_profile_followers_count") == 1 && data.bio.followers_count > 0) {
                    post_items += " â€¢ ";
                }
                post_items += "<strong><a class='href_status_trigger_feed' target='_blank' style='text-decoration: none;' href='https://www.facebook.com/" + data.bio.id + "'>@" + data.bio.username + "</a></strong> ";
            }
            post_items += "</div>";
            post_items += "</div>";
            post_items += "<div class='sk-facebook-page-posts-profile-info'>";
            post_items += "<div class='href_status_trigger_feed_container sk-facebook-page-posts-profile-description'>";
            if (getDsmSetting(sk_facebook_feed, "show_profile_description") == 1 && data.bio.about) {
                post_items += "<div class='sk-profile-about-container'>" + data.bio.about + "</div> ";
            }
            if (getDsmSetting(sk_facebook_feed, "show_profile_website") == 1 && data.bio.website) {
                var website_url = "";
                if (data.bio.website.indexOf("http") > -1) {
                    website_url = data.bio.website;
                } else {
                    website_url = "https://" + data.bio.website;
                }
                post_items += "<div onclick=\"window.open('" + website_url + "');\" class='sk-profile-description href_status_trigger_feed'>" + data.bio.website + "</div>";
            }
            post_items += "</div>";
            if (getDsmSetting(sk_facebook_feed, "show_profile_follow_button") == 1) {
                post_items += "<button type='button' onclick=\"window.open('https://www.facebook.com/pg/" + data.bio.id + "/posts');\" class='facebook-page-posts-user-container'>";
                post_items += "<i class='fa fa-facebook-official' aria-hidden='true'></i> " + getDsmSetting(sk_facebook_feed, "like_us_on_facebook_text");
                post_items += "</button>";
            }
            post_items += "</div>";
            post_items += "</div>";
            post_items += "</div>";
        }
        return post_items;
    }

    function requestFeedData(sk_facebook_feed) {
        var embed_id = getDsmEmbedId(sk_facebook_feed);
        var json_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
        fetch(json_url, {
            method: 'get'
        }).then(function(response) {
            if (!response.ok || 1 == 1) {
                generateSolutionMessage(sk_facebook_feed, embed_id)
            } else {
                response.json().then(function(data) {
                    original_data = data;
                    loadFeed(sk_facebook_feed);
                });
            }
        }).catch(function(err) {
            console.log(err);
        });
    }

    function loadFeed(sk_facebook_feed) {
        var search_term = sk_facebook_feed.find(".sk_ww_search_facebook_feed_keyword").val();
        var predefined_search_keyword = getDsmSetting(sk_facebook_feed, "predefined_search_keyword");
        var turnon_preapproval_posts = getDsmSetting(sk_facebook_feed, "turnon_preapproval_posts");
        if (original_data.bio && original_data.bio.id) {
            var profile_picture = "https://graph.facebook.com/v5.0/" + original_data.bio.id + "/picture/?type=large&access_token=";
            original_data.bio.profile_picture = original_data.bio.profile_picture ? original_data.bio.profile_picture : profile_picture;
        }
        if (search_term != "" && search_term != undefined) {} else {
            search_term = "";
        }
        var data = original_data;
        if (data.bio && data.bio.error && data.bio.error.message) {
            sk_facebook_feed.html(skErrorMessage());
            return;
        }
        data_storage = data.posts;
        if (data_storage && data_storage.length > 0) {
            if (search_term) {
                data_storage = applySearchFeature(data_storage, search_term);
            }
            if (predefined_search_keyword) {
                data_storage = predefinedPostFeature(data_storage, predefined_search_keyword);
            }
            data_storage = moderationTabFeature(sk_facebook_feed, data_storage, turnon_preapproval_posts)
            data_storage = applyDateFormat(sk_facebook_feed, data_storage);
        }
        sk_facebook_feed.find('.sk-solution-holder').remove();
        var post_items = "<div class='sk-solution-holder'>";
        if (original_data.user_info && !widgetValidation(sk_facebook_feed, data)) {
            return;
        } else {
            sk_facebook_feed.find('.sk-settings').append("<div class='bio_id'>" + data.bio.id + "</div>");
            post_items += "<div id='fb-root'></div>";
            if (data.bio) {
                post_items += loadBioInformation(sk_facebook_feed, data, search_term);
            }
            if (data_storage && data_storage.length < 1 && search_term) {
                post_items += "<ul class='sk_error_message'>";
                post_items += "<li>No posts found with the keyword: " + search_term + "</li>";
                post_items += "</ul>";
            } else {
                if (data.posts && data.posts.error && data.posts.error.message) {
                    post_items += "<div>ACCESS TOKEN IS NOT VALID. Please reconnect your facebook account.</div>";
                } else if (getDsmSetting(sk_facebook_feed, "layout") == 3) {
                    post_items += loadSliderLayout(sk_facebook_feed, data_storage);
                } else {
                    post_items += "<div class='grid-facebook-page-posts'>";
                    post_items += "<div class='grid-sizer-facebook-page-posts'></div>";
                    var enable_button = false;
                    last_key = 6;
                    
                    for (var i = 0; i < last_key; i++) {
                        if (typeof data_storage[i] != 'undefined') {
                            post_items += getFeedItem(data_storage[i], sk_facebook_feed);
                        }
                    }
                    if (data_storage.length > last_key) {
                        enable_button = true;
                    }
                    post_items += "</div>";
                    if (getDsmSetting(sk_facebook_feed, "show_load_more_button") == 1 || getDsmSetting(sk_facebook_feed, "show_bottom_follow_button") == 1) {
                        post_items += "<div class='sk-facebook-page-posts-bottom-btn-container'>";
                        if (getDsmSetting(sk_facebook_feed, "show_load_more_button") == 1 && enable_button) {
                            post_items += "<button type='button' class='sk-facebook-page-posts-load-more-posts'>";
                            post_items += getDsmSetting(sk_facebook_feed, "load_more_posts_text");
                            post_items += "</button>";
                        }
                        post_items += "</div>";
                    }
                }
            }
            post_items += skGetBranding(sk_facebook_feed, data.user_info);
            sk_facebook_feed.append(post_items);
            showSharedPosts(sk_facebook_feed, false);
            if (getDsmSetting(sk_facebook_feed, "layout") == 3) {
                skSliderLayoutSettings(sk_facebook_feed);
            }
            applyCustomUi(jQuery, sk_facebook_feed);
            applyReadmore(sk_facebook_feed, data);
            applyMasonry();
            if (jQuery(".sk-profile-about-container").length > 0) {
                replaceContentWithLinks(jQuery(".sk-profile-about-container"), sk_facebook_feed);
            }
            if (getDsmSetting(sk_facebook_feed, "layout") == 3) {
                skLayoutSliderArrowUI(sk_facebook_feed);
            }
            sk_facebook_feed.find('.sk-links').each(function() {
                if (jQuery(this).find('.sk-gallery__img').length == 0) {
                    jQuery(this).find('.sk-link-description').css('-webkit-line-clamp', 'unset');
                }
            });
            window.setInterval(function() {
                applyMasonry();
            }, 300);
            linkify(sk_facebook_feed.text());
            setTimeout(function() {
                FB.XFBML.parse();
            }, 300);
            removeLinks(sk_facebook_feed);
        }
        if (data.user_info) {
            sk_increaseView(data.user_info);
        }
    }

    function getFeedItem(val, sk_facebook_feed) {
        val.full_picture = val.full_picture ? val.full_picture.replace(/&amp;/g, '&') : val.full_picture;
        val.picture_small = val.full_picture;
        val.picture_large = val.full_picture;
        var access_token = getDsmSetting(sk_facebook_feed, "access_token");
        var show_post_profile_name = getDsmSetting(sk_facebook_feed, "show_post_profile_name");
        var show_post_profile_image = getDsmSetting(sk_facebook_feed, "show_post_profile_image");
        var show_post_likes_count = getDsmSetting(sk_facebook_feed, "show_post_likes_count");
        var show_comments_count = getDsmSetting(sk_facebook_feed, "show_comments_count");
        var show_post_icon = getDsmSetting(sk_facebook_feed, "show_post_icon");
        var show_time_posted = getDsmSetting(sk_facebook_feed, "show_time_posted");
        var show_post_story = getDsmSetting(sk_facebook_feed, "show_post_story");
        var container_overflow = "";
        var media_content = "";
        var profile_name_display = "";
        if (show_post_profile_name == 0) {
            profile_name_display = "style='display: none;'";
        }
        var object_id = val.object_id ? val.object_id : "";
        var post_params = "data-id='" + val.id +
            "' data-post-id='" + getDsmSetting(sk_facebook_feed, "bio_id") + "_" + val.post_id +
            "' data-page-id='" + val.page_id +
            "' data-object_id='" + object_id +
            "' data-caption='" + val.caption +
            "' data-type='" + val.type + "'" +
            "' status-type='" + val.status_type + "'";
        if (val.status_type == 'added_video') {
            jQuery.each(val.media_attachments, function(index, media) {
                var video_id = media.url.split("videos/");
                if (video_id.length > 1) {
                    video_id = video_id[1].replace("/", "");
                    post_params = post_params + "' video-id='" + video_id + "'";
                }
            });
        }
        var post_items = "";
        post_items += "<div class='grid-item-facebook-page-posts' " + post_params + ">";
        post_items += "<div class='grid-content'>";
        post_items += "<div class='grid-content-padding'>";
        post_items += "<div class='hide-in-pop-up'>";
        post_items += "<div class='post-header'>";
        if (show_post_profile_image == 1) {
            post_items += "<div class='post-image'>";
            post_items += "<img src='" + original_data.bio.profile_picture + "' class='img-thumbnail'>";
            post_items += "</div>";
        }
        post_items += "<div class='sk-fb-page-name'>";
        if (val.is_visitor_post == true) {
            post_items += "<strong " + profile_name_display + "><a class='href_status_trigger_post' href='" + val.facebook_link + "' target='_blank'>A visitor</a> posted to <a class='href_status_trigger_post' href='https://www.facebook.com/" + val.page_id + "/posts/' target='_blank'>" + val.page_name + "</a></strong> ";
        } else {
            post_items += "<strong " + profile_name_display + "><a class='href_status_trigger_post' href='https://www.facebook.com/" + val.page_id + "/posts/' target='_blank'>" + val.page_name + "</a></strong> ";
        }
        if (val.story && show_post_story == 1) {
            if (val.story == " added a new photo." && val.name) {
                val.story = val.story.replace('.', ' to the album: ' + val.name)
            }
            post_items += "<span class='sk-story'>" + val.story + "</span>";
        }
        if (getDsmSetting(sk_facebook_feed, "show_post_date") == 1) {
            post_items += "<div><span class='sk-secondary-data'>";
            post_items += val.post_date_time;
            post_items += "</span></div>";
        }
        if (!val.story && show_post_story == 1) {
            post_items += "<span class='sk-story' style='display: none;'>Story</span>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        post_items += "<div class='post-content'>";
        post_items += "<div class='margin-zero'>";
        post_items += "<div class='sk-facebook-page-posts-container'>";
        if (val.status_type == 'added_video') {
            jQuery.each(val.media_attachments, function(index, media) {
                post_items += "<div class='sk-video sk_click_to_pop_content'>";
                if (media.thumbnail && media.thumbnail.indexOf('svg') === -1) {
                    post_items += "<img src='" + media.thumbnail + "' alt='Posts Image' class='sk_post_img'>";
                    post_items += "<div class='sk_play_button'>";
                    post_items += "<i class='fa fa-play-circle' aria-hidden='true'></i>";
                    post_items += "</div>";
                }
                post_items += "</div>";
                media_content += "<video style='width:100%;height:auto;' controls>";
                media_content += "<source src='" + media.source + "' type='video/mp4'>";
                media_content += "<source src='" + media.source + "' type='video/ogg'>";
                media_content += "Your browser does not support the video tag.";
                media_content += "</video>";
            });
            post_items += "<div class='href_status_trigger_post_container sk-post-text sk-post-text-" + val.id + "' " + post_params + ">";
            post_items += val.message;
            post_items += "</div>";
        } else if (val.message) {
            post_items += "<div class='href_status_trigger_post_container sk-post-text sk-post-text-" + val.id + "' " + post_params + ">";
            post_items += val.message;
            post_items += "</div>";
        }
        if ((val.facebook_link.length > 0 && val.page_id == "13460958763") || (val.page_id == "14036040583" && val.type == "status")) {
            container_overflow = "style='overflow-x: scroll !important;'";
        }
        if (val.media_attachments && !val.parent_id) {
            if (val.media_attachments.length == 1 && val.status_type.indexOf('event') == -1 && val.status_type != 'added_photos' && (val.status_type == 'shared_story' || val.status_type == 'mobile_status_update' || val.type == 'shared_link')) {
                jQuery.each(val.media_attachments, function(index, media) {
                    post_items += "<div class='sk-links' onclick=\"window.open('" + media.url + "');\">";
                    if (media.thumbnail && media.thumbnail.indexOf('svg') === -1 && val.status_type != 'added_video' && val.id != "106330322743688_490732623094833") {
                        if (val.full_picture && val.media_attachments.length == 1) {
                            media.thumbnail = val.full_picture;
                        }
                        post_items += "<img src='" + media.thumbnail + "' alt='Posts Image' class='sk-gallery__img'>";
                    }
                    if (media.title && media.title == "This content isn't available right now") {
                        post_items += "<div class='sk-link-description'>";
                        post_items += "View content on facebook. ";
                        post_items += "</div>";
                    } else if (media.title && (val.status_type == 'shared_story' || media.type == 'share')) {
                        post_items += "<div class='sk-link-title'>";
                        post_items += media.title;
                        post_items += "</div>";
                    }
                    if (media.description && media.description != val.message) {
                        post_items += "<div class='sk-link-description'>";
                        media.description = media.description.split(".")[0];
                        post_items += media.description;
                        post_items += "</div>";
                    }
                    post_items += "</div>";
                });
            } else if (val.status_type == 'created_event') {
                jQuery.each(val.media_attachments, function(index, media) {
                    post_items += "<div class='sk-links' onclick=\"window.open('" + media.url + "');\">";
                    if (media.thumbnail && media.thumbnail.indexOf('svg') === -1) {
                        post_items += "<img src='" + media.thumbnail + "' alt='Posts Image' class='sk-gallery__img'>";
                    }
                    var event_description = media.description;
                    var event_description_text = "";
                    if (media.description) {
                        event_description = event_description.split(" Â· ");
                    }
                    if (event_description.length > 0) {
                        if (event_description[0]) {
                            if (parseInt(event_description[0]) == 0) {
                                event_description[0] = "";
                            }
                        }
                        event_description_text = event_description[0];
                    }
                    if (event_description.length > 1) {
                        if (event_description[1]) {
                            if (parseInt(event_description[1]) == 0) {
                                event_description[1] = "";
                            }
                        }
                        if (event_description_text) {
                            event_description_text = event_description_text + " Â· ";
                        }
                        event_description_text = event_description_text + event_description[1];
                    }
                    post_items += "<div class='sk-link-title'>";
                    post_items += media.title;
                    post_items += "</div>";
                    post_items += "<div class='sk-link-description'>";
                    post_items += event_description_text;
                    post_items += "</div>";
                    post_items += "</div>";
                });
            } else {
                post_items += "<div " + container_overflow + " class='sk_post_media'>";
                if (val.status_type == 'added_photos' || val.status_type == 'mobile_status_update' || val.status_type == 'shared_story') {
                    var img_class = "max_photo";
                    var plus = "";
                    if (val.media_attachments.length == 1) {
                        img_class = "single_photo";
                    } else if (val.media_attachments.length == 2) {
                        img_class = "two_photo";
                    } else if (val.media_attachments.length == 3) {
                        img_class = "three_photo";
                    } else if (val.media_attachments.length == 4) {
                        img_class = "max_photo";
                    } else if (val.media_attachments.length >= 5) {
                        plus = "4+";
                    }
                    if (val.media_attachments.length == 1) {
                        var media_attachments = val.media_attachments.slice(0, 3);
                        post_items += "<div class='" + img_class + " href_status_trigger_post_container sk_post_type_photo href_status_trigger_container sk_click_to_pop_content' " + post_params + ">";
                        jQuery.each(media_attachments, function(index, value) {
                            post_items += "<div class='image-item'>";
                            post_items += "<img description= '" + value.description + "' src='" + value.thumbnail + "' class='sk_post_img' />";
                            post_items += "</div>";
                        });
                        post_items += "</div>";
                    }
                    if (val.media_attachments.length == 2) {
                        var media_attachments = val.media_attachments.slice(0, 3);
                        post_items += "<div class='" + img_class + " href_status_trigger_post_container photo-grid-2 sk_post_type_photo href_status_trigger_container sk_click_to_pop_content' " + post_params + ">";
                        jQuery.each(media_attachments, function(index, value) {
                            post_items += "<div class='image-item'>";
                            post_items += "<img description= '" + value.description + "' src='" + value.thumbnail + "' class='sk_post_img' />";
                            post_items += "</div>";
                        });
                        post_items += "</div>";
                    }
                    if (val.media_attachments.length == 3) {
                        var media_attachments = val.media_attachments.slice(0, 3);
                        jQuery.each(media_attachments, function(index, value) {
                            if (index == 0) {
                                post_items += "<div class='" + img_class + " href_status_trigger_post_container photo-grid-3 sk_post_type_photo href_status_trigger_container sk_click_to_pop_content' " + post_params + ">";
                                post_items += "<div class='image-item'>";
                                post_items += "<img description= '" + value.description + "' src='" + value.thumbnail + "' class='sk_post_img' />";
                                post_items += "</div>";
                                post_items += "</div>";
                            }
                        });
                        post_items += "<div class='" + img_class + " href_status_trigger_post_container photo-grid-2 sk_post_type_photo href_status_trigger_container sk_click_to_pop_content' " + post_params + ">";
                        jQuery.each(media_attachments, function(index, value) {
                            if (index != 0) {
                                post_items += "<div class='image-item'>";
                                post_items += "<img description= '" + value.description + "' src='" + value.thumbnail + "' class='sk_post_img' />";
                                post_items += "</div>";
                            }
                        });
                        post_items += "</div>";
                    } else if (val.media_attachments.length > 3) {
                        post_items += "<div class='" + img_class + " href_status_trigger_post_container photo-grid sk_post_type_photo href_status_trigger_container sk_click_to_pop_content' " + post_params + ">";
                        var media_attachments = val.media_attachments.slice(0, 4);
                        jQuery.each(media_attachments, function(index, value) {
                            post_items += "<div class='image-item'>";
                            post_items += "<img description= '" + value.description + "' src='" + value.thumbnail + "' class='sk_post_img' />";
                            if (index == 3) {
                                post_items += "<div class='img-count'> " + plus + " </div>";
                            }
                            post_items += "</div>";
                        });
                        post_items += "</div>";
                    }
                    media_attachments = val.media_attachments;
                    media_content += '<div class="swiper-container swiper-container-single" style="margin-bottom:10px;">';
                    media_content += '<div class="swiper-wrapper">';
                    jQuery.each(media_attachments, function(index, value) {
                        media_content += "<div class='swiper-slide'><img description= '" + value.description + "' style='width: 100%; margin: 0px !important;' src='" + value.thumbnail + "'/></div>";
                    });
                    media_content += '</div>';
                    media_content += '</div>';
                    if (media_attachments.length > 1) {
                        media_content += '<div class="swiper-button-next-single"><i class="mfp-arrow mfp-arrow-right"></i></div>';
                        media_content += '<div class="swiper-button-prev-single"><i class="mfp-arrow mfp-arrow-left"></i></div>';
                    }
                }
                post_items += "</div>";
            }
        } else if (val.parent_id) {
            post_items += "<div class='sk_post_media sk-meta-data' data-id='" + val.id + "' id='" + val.parent_id + "'>";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "<div class='post-post-counts'  " + post_params + ">";
        if (show_post_likes_count == 1 && val.likes_count) {
            post_items += "<span class='sk-post-repost-count'>";
            post_items += "<i class='fa fa-thumbs-up' aria-hidden='true'></i> " + val.likes_count;
            post_items += "</span>";
        }
        if (show_comments_count == 1 && val.comments_count) {
            post_items += "<span class='sk-post-favorite-count'>";
            post_items += "<i class='fa fa-comment' aria-hidden='true'></i> " + val.comments_count;
            post_items += "</span>";
        }
        if (getDsmSetting(sk_facebook_feed, 'show_share_icon') == 1) {
            var post_id = val.post_id.split('_');
            post_id = post_id[1];
            post_items += "<span class='sk-tooltip sk-fb-post-footer-icon' data-id='" + val.post_id + "'>";
            post_items += "<a><i class='fa fa-share' aria-hidden='true'></i></a>";
            post_items += "<span class='sk-tooltiptext sk-tooltip-" + val.post_id + " href_status_trigger_post'>";
            post_items += "<a target='_blank' href='https://www.facebook.com/sharer.php?u=https://www.facebook.com/" + val.page_id + "/posts/" + post_id + "'><i class='fa fa-facebook' aria-hidden='true'></i></a>";
            post_items += "<a target='_blank' href='https://www.linkedin.com/sharing/share-offsite/?url=https://www.facebook.com/" + val.page_id + "/posts/" + post_id + "'><i class='fa fa-linkedin' aria-hidden='true'></i></a>";
            post_items += "<a target='_blank' href='https://twitter.com/intent/tweet?text=" + val.message + "&url=https://www.facebook.com/" + val.page_id + "/posts/" + post_id + "'><i class='fa fa-twitter' aria-hidden='true'></i></a>";
            post_items += "</span>";
            post_items += "</span>";
        }
        if (show_post_icon == 1) {
            post_items += "<span class='sk-fb-post-footer-icon sk_post_view_on_facebook'>";
            post_items += "<a class='tooltip-fb href_status_trigger_post' href='https://www.facebook.com/" + val.post_id + "' target='_blank'>";
            post_items += "<i class='fa fa-facebook-official' aria-hidden='true'></i><span class='tooltip-fbtext fb-text'>" + getDsmSetting(sk_facebook_feed, 'view_on_facebook_text') + "</span>";
            post_items += "</a>";
            post_items += "</span>";
        }
        post_items += "</div>";
        if (val.type != "link") {
            var popup_video_class = "";
            if (val.type == "video") {
                popup_video_class = "sk-popup-video-content";
            }
            post_items += "<div class='white-popup mfp-hide sk-pop-facebook-page-posts-post " + popup_video_class + "' data-type='" + val.type + "'>";
            post_items += "<div class='sk_media_content'>";
            post_items += media_content;
            post_items += "</div>";
            post_items += "<div class='sk_media_content_description'>";
            post_items += "<input type='hidden' id='page_id_pop_up' value='" + val.page_id + "'>";
            post_items += "<div class='post-header'>";
            post_items += "<div " + profile_name_display + " class='post-image-new'>";
            post_items += "<div class='img-thumbnail-new' style='background-image: url(" + original_data.bio.profile_picture + ");'></div>";
            post_items += "</div>";
            post_items += "<div class='sk-fb-page-name'>";
            if (val.is_visitor_post == true) {
                post_items += "<strong " + profile_name_display + "><a class='href_status_trigger_post' href='" + val.facebook_link + "' target='_blank'>A visitor</a> posted to <a class='href_status_trigger_post' href='https://www.facebook.com/" + val.page_id + "/posts/' target='_blank'>" + val.page_name + "</a></strong> ";
            } else {
                post_items += "<strong " + profile_name_display + "><a class='href_status_trigger_post' href='https://www.facebook.com/" + val.page_id + "/posts/' target='_blank'>" + val.page_name + "</a></strong> ";
            }
            if (sk_facebook_feed.width() >= 850) {
                post_items += val.story ? val.story + " " : "";
            }
            if (getDsmSetting(sk_facebook_feed, "show_post_date") == 1) {
                post_items += "<div><span class='sk-secondary-data'>";
                if (getDsmSetting(sk_facebook_feed, "show_time_posted") == 1)
                    post_items += val.post_date_time;
                else
                    post_items += val.post_date;
                post_items += "</span></div>";
            }
            post_items += "</div>";
            post_items += "</div>";
            post_items += "<div class='sk_post_message href_status_trigger_post_container sk_post_message_" + val.id + "'><div class='sk_post_message_content'>" + val.message + "</div></div>";
            post_items += "<div class='post-post-counts' " + post_params + ">";
            if (show_post_likes_count == 1 && val.likes_count) {
                post_items += "<div class='sk-post-repost-count'>";
                post_items += "<i class='fa fa-thumbs-up' aria-hidden='true'></i> " + val.likes_count;
                post_items += "</div>";
            }
            if (show_comments_count == 1 && val.comments_count) {
                post_items += "<div class='sk-post-favorite-count'>";
                post_items += "<i class='fa fa-comment' aria-hidden='true'></i> " + val.comments_count;
                post_items += "</div>";
            }
            post_items += "<div class='sk-share-view-btn-container'>";
            if (show_post_icon == 1) {
                post_items += "<span class='sk-facebook-page-posts-m-r-15px sk_post_view_on_facebook'>";
                post_items += "<a class='tooltip-fb  href_status_trigger_post' href='https://www.facebook.com/" + val.post_id + "' target='_blank'>";
                post_items += "<i class='fa fa-facebook-official' aria-hidden='true'></i><span class='tooltip-fbtext fb-text'>" + getDsmSetting(sk_facebook_feed, 'view_on_facebook_text') + "</span>";
                post_items += "</a>";
                post_items += "</span>";
            }
            if (getDsmSetting(sk_facebook_feed, 'show_share_icon') == 1) {
                var post_id = val.post_id.split('_');
                post_id = post_id[1];
                post_items += "<span class='sk-tooltip sk-fb-post-footer-icon' data-id='" + val.post_id + "'>";
                post_items += "<a><i class='fa fa-share' aria-hidden='true'></i></a>";
                post_items += "<span class='sk-tooltiptext sk-tooltip-" + val.post_id + " href_status_trigger_post'>";
                post_items += "<a target='_blank' href='https://www.facebook.com/sharer.php?u=https://www.facebook.com/" + val.page_id + "/posts/" + post_id + "'><i class='fa fa-facebook' aria-hidden='true'></i></a>";
                post_items += "<a target='_blank' href='https://www.linkedin.com/sharing/share-offsite/?url=https://www.facebook.com/" + val.page_id + "/posts/" + post_id + "'><i class='fa fa-linkedin' aria-hidden='true'></i></a>";
                post_items += "<a target='_blank' href='https://twitter.com/intent/tweet?text=" + val.message + "&url=https://www.facebook.com/" + val.page_id + "/posts/" + post_id + "'><i class='fa fa-twitter' aria-hidden='true'></i></a>";
                post_items += "</span>";
                post_items += "</span>";
            }
            post_items += "</div>";
            post_items += "</div>";
            post_items += "</div>";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        post_items += "</div>";
        return post_items;
    }

    function applyReadmore(sk_facebook_feed, data) {
        var elements = sk_facebook_feed.find('.sk_post_description');
        for (var i = 0; i < elements.length; i++) {
            if (jQuery(elements[i]).closest(".margin-zero").find("a.more").length < 1)
                replaceContentWithLinks(jQuery(elements[i]), sk_facebook_feed);
        }
        elements = sk_facebook_feed.find('.sk_link_description');
        for (var i = 0; i < elements.length; i++) {
            if (jQuery(elements[i]).closest(".margin-zero").find("a.more").length < 1)
                replaceContentWithLinks(jQuery(elements[i]), sk_facebook_feed);
        }
        elements = sk_facebook_feed.find(".sk-popup-video-content").find('.sk_post_message');
        for (var i = 0; i < elements.length; i++) {
            if (jQuery(elements[i]).closest(".margin-zero").find("a.more").length < 1)
                replaceContentWithLinks(jQuery(elements[i]), sk_facebook_feed);
        }
        if (data.posts != undefined) {
            jQuery.each(data.posts, function(key, val) {
                replaceContentWithLinks(sk_facebook_feed.find('.sk-post-text-' + val.id), sk_facebook_feed);
                if (val.type != "video") {
                    replaceContentWithLinks(jQuery('.sk_post_message_' + val.id), sk_facebook_feed);
                }
            });
        } else {
            jQuery.each(data, function(key, val) {
                replaceContentWithLinks(sk_facebook_feed.find('.sk-post-text-' + val.id), sk_facebook_feed);
                if (val.type != "video") {
                    replaceContentWithLinks(jQuery('.sk_post_message_' + val.id), sk_facebook_feed);
                }
            });
        }
    }

    function skErrorMessage() {
        var sk_error_message = "<ul class='sk_error_message'>";
        sk_error_message += "<li>Unable to load Facebook Page Posts.</li>";
        sk_error_message += "<li>Please make sure your Facebook page ID is correct. Try to disconnect and reconnect your account.</li>";
        sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
        sk_error_message += "<li>Make sure you are using a Facebook page. Personal Facebook account will not work.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }

    function applyMasonry() {
        $grid = new Masonry('.grid-facebook-page-posts', {
            itemSelector: '.grid-item-facebook-page-posts',
            columnWidth: '.grid-sizer-facebook-page-posts',
            percentPosition: true,
            transitionDuration: 0
        });
    }

    function loadSliderLayout(sk_facebook_feed, data) {
        var column_count = getDsmSetting(sk_facebook_feed, 'column_count');
        column_count = parseInt(column_count);
        var post_items = "<div id='sk_facebook_feed_slider'  class='swiper-container swiper-layout-slider'>";
        post_items += "<div class='swiper-wrapper'>";
        var last_index = 0;
        var data_slider = data_storage;
        var pages = Math.ceil(data_slider.length / column_count);
        for (var slide = 1; slide <= pages; slide++) {
            post_items += "<div class='swiper-slide' >";
            post_items += "<div class='grid-facebook-page-posts'>";
            post_items += "<div class='grid-sizer-facebook-page-posts'></div>";
            var slide_data = getPaginationResult(sk_facebook_feed, data_slider, slide, column_count);
            jQuery.each(slide_data, function(key, val) {
                post_items += "<span>";
                if (typeof val != 'undefined')
                    post_items += getFeedItem(val, sk_facebook_feed);
                post_items += "</span>";
            });
            post_items += "</div>";
            post_items += "</div>";
        }
        post_items += "</div>";
        post_items += "<button type='button' class='swiper-button-next ' style='pointer-events: all;'>";
        post_items += "<i class='sk_arrow sk_right_arrow'></i>";
        post_items += "</button>";
        post_items += "<button type='button' class='swiper-button-prev' style='pointer-events: all;'>";
        post_items += "<i class='sk_arrow sk_left_arrow'></i>";
        post_items += "</button>";
        post_items += "</div>";
        return post_items;
    }
    
    function getPaginationResult(sk_facebook_feed, user_solutions, page, column_count) {
        var start = 0;
        var end = parseInt(column_count);
        var multiplicand = page - 1;
        var return_user_solutions = [];
        if (page != 1) {
            start = multiplicand * end;
            end = start + end;
        }
        if ((end - 1) > user_solutions.length) {
            end = user_solutions.length;
        }
        for (var i = start; i < end; i++) {
            return_user_solutions.push(user_solutions[i]);
        }
        return return_user_solutions;
    }

    function skSliderLayoutSettings(sk_facebook_feed) {
        var autoplay = false;
        var loop = false;
        if (getDsmSetting(sk_facebook_feed, "autoplay") == 1) {
            var delay = getDsmSetting(sk_facebook_feed, "delay") * 1500;
            autoplay = {
                delay: delay
            };
            loop = true;
        }
        var swiper = new Swiper('.swiper-layout-slider.swiper-container', {
            loop: loop,
            autoplay: autoplay,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    function skLayoutSliderArrowUI(sk_facebook_feed) {
        var arrow_background_color = getDsmSetting(sk_facebook_feed, "arrow_background_color");
        var arrow_color = getDsmSetting(sk_facebook_feed, "arrow_color");
        var arrow_opacity = getDsmSetting(sk_facebook_feed, "arrow_opacity");
        sk_facebook_feed.find(".swiper-button-prev,.swiper-button-next, .sk_arrow").css({
            "opacity": arrow_opacity,
            "color": arrow_color,
            "background-color": "transparent"
        });
        sk_facebook_feed.find(".sk_arrow").css({
            "border": "solid " + arrow_color,
            "border-width": "0 3px 3px 0",
            "opacity": arrow_opacity,
            "color": arrow_color,
            "background-color": "transparent"
        });
        jQuery(".swiper-button-next,.swiper-button-prev, .sk_arrow").mouseover(function() {
            jQuery(this).find(".sk_arrow").css({
                "border": "solid " + arrow_background_color,
                "border-width": "0 3px 3px 0"
            });
            jQuery(this).css({
                "opacity": "1",
                "color": arrow_background_color
            });
        }).mouseout(function() {
            jQuery(this).find(".sk_arrow").css({
                "border": "solid " + arrow_color,
                "border-width": "0 3px 3px 0"
            });
            jQuery(this).css({
                "opacity": arrow_opacity
            });
        });
        skSetSliderLayoutUI(sk_facebook_feed);
        setTimeout(function() {
            skSetSliderLayoutUI(sk_facebook_feed);
        }, 500);
        setTimeout(function() {
            skSetSliderLayoutUI(sk_facebook_feed);
        }, 1000);
    }

    function skSetSliderLayoutUI(sk_facebook_feed) {
        sk_facebook_feed.find('.swiper-button-next').css({
            "right": "22px"
        });
        var grid_height = 0;
        var header_height = 0;
        setEventFeedHeight(sk_facebook_feed);
        var swiper_height = sk_facebook_feed.find(".grid-item-facebook-page-posts").height();
        sk_facebook_feed.find(".swiper-wrapper").height(swiper_height);
        if (jQuery(document).width() <= 750) {
            sk_facebook_feed.find('.swiper-button-prev').css({
                "left": "-1px"
            });
            sk_facebook_feed.find('.swiper-button-next').css({
                "right": "16px"
            });
        }
        if (jQuery(document).width() <= 480) {
            sk_facebook_feed.find('.swiper-button-prev').css({
                "left": "-12px"
            });
            sk_facebook_feed.find('.swiper-button-next').css({
                "right": "6px"
            });
        }
    }

    function hidePopUp() {}

    function showPopUp(jQuery, content_src, clicked_element, sk_facebook_feed) {
        if (typeof jQuery.magnificPopup === "undefined")
            initManificPopupPlugin(jQuery);
        var max_photo = 20;
        jQuery.magnificPopup.open({
            items: {
                src: content_src
            },
            'type': 'inline',
            callbacks: {
                open: function() {
                    jQuery(".white-popup").css({
                        "overflow": "hidden"
                    });
                    jQuery("body").css({
                        height: "auto"
                    });
                    var type = clicked_element.closest('div.grid-item-facebook-page-posts').attr('data-type');
                    var status_type = clicked_element.closest('div.grid-item-facebook-page-posts').attr('status-type');
                    var page_id = clicked_element.closest('div.grid-item-facebook-page-posts').attr('data-page-id');
                    var object_id = clicked_element.closest('div.grid-item-facebook-page-posts').attr('data-object_id');
                    var video_id = clicked_element.closest('div.grid-item-facebook-page-posts').attr('video-id');
                    if (sk_facebook_feed.find(".swiper-button-next-single").length > 0) {
                        sk_facebook_feed.find(".swiper-button-next-single")[0].click();
                    }
                    if (sk_facebook_feed.find(".swiper-button-prev-single").length > 0) {
                        sk_facebook_feed.find(".swiper-button-prev-single")[0].click();
                    }
                    var media_content = "";
                    if (sk_facebook_feed.width() <= 850) {
                        jQuery(".white-popup").css({
                            "max-width": "100%"
                        });
                    }
                    if (type == 'video' || status_type == 'added_video') {
                        jQuery(".sk-popup-video-content").css({
                            "background-color": getDsmSetting(sk_facebook_feed, "pop_up_bg_color")
                        });
                        var media_content = "<i class='sk-video-popup-spinner fa fa-spinner fa-spin' style='min-height=150px;'></i>";
                        media_content += "<div class='fb-video' style='min-height=350px;'";
                        media_content += "data-href='https://www.facebook.com/video.php?v=" + video_id + "'";
                        media_content += "data-allowfullscreen='true' ";
                        media_content += "data-autoplay='true' ";
                        media_content += "data-show-captions='true'>";
                        media_content += "</div>";
                        jQuery('.mfp-content').find('.sk_media_content').html(media_content);
                        if (jQuery(document).width() > 470) {
                            jQuery('.mfp-content .white-popup').css({
                                "height": 350,
                            });
                        }
                    }
                    jQuery('.mfp-content').css({
                        'font-family': getDsmSetting(sk_facebook_feed, "font_family")
                    });
                    FB.XFBML.parse();
                    if (jQuery('.mfp-content .sk_media_content').find('.swiper-container').length > 0) {
                        initializeSwiperSingle(clicked_element);
                    } else if (jQuery('.mfp-content .sk_media_content').find('.sk_post_img').length > 0) {
                        var image = jQuery('.mfp-content .sk_media_content').find('.sk_post_img');
                        jQuery('.mfp-content .white-popup').find('.sk_media_content .sk_post_img').css({
                            "width": "100%"
                        });
                        jQuery('.mfp-content .white-popup').css({
                            "height": image[0].offsetHeight + "px"
                        });
                    }
                    if (type == 'video' || status_type == 'added_video') {
                        isIframeLoaded(sk_facebook_feed);
                    }
                    fixPopup();
                    for (var i = 0; i <= 5; i++) {
                        setTimeout(function() {
                            fixPopup();
                        }, i * 1000);
                    }
                    jQuery(".mfp-content").find(".white-popup").find(".mfp-close").remove();
                    jQuery(".mfp-content").append('<button title="Close (Esc)" type="button" class="mfp-close">Ã—</button>');
                    jQuery(".mfp-content").find(".mfp-close").css({
                        "right": parseInt(jQuery(".mfp-content").find(".white-popup").css("marginRight")) - 8 + "px"
                    });
                    jQuery('.sk-share-view-btn-container').css({
                        "float": "right"
                    });
                },
                close: function() {
                    jQuery('video').each(function() {
                        jQuery(this)[0].pause();
                    });
                    jQuery('#facebook_sdk').remove();
                }
            }
        });
    }

    function initializeSwiperSingle(clicked_element) {
        var singleSwiper = new Swiper('.swiper-container-single', {
            slidesPerView: 1,
            spaceBetween: 30,
            effect: 'fade',
            autoplay: 3000,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            nested: true,
            navigation: {
                nextEl: '.swiper-button-next-single',
                prevEl: '.swiper-button-prev-single',
            },
        });
        var sk_facebook_feed = clicked_element.closest('.sk-ww-facebook-page-posts');
        jQuery('.mfp-content').find('.sk_media_content').find('.swiper-button-next-single,.swiper-button-prev-single').css({
            "top": "50%",
            "background": "none"
        });
        jQuery('.mfp-content').find('.sk_media_content').find('.swiper-slide').css({
            "width": "100%",
            "margin-left": "0"
        });
        var swiper_active_height = jQuery('.mfp-content').find('.swiper-container-single .swiper-slide img').height();
        if (swiper_active_height > jQuery(window).innerHeight()) {
            var margins = 60;
            swiper_active_height = jQuery(window).innerHeight() - margins;
        }
        jQuery('.mfp-container').find('.mfp-content .white-popup').css({
            'height': swiper_active_height
        });
        jQuery('.mfp-content .sk_media_content img').css({
            'height': swiper_active_height
        });
        jQuery('.mfp-content .sk_media_content').css({
            'height': swiper_active_height
        });
    }

    function timeInterval() {
        if (jQuery('.mfp-content .sk_media_content').length > 0) {
            var sk_media_content_height_raw = jQuery('.mfp-content .sk_media_content').height();
            var sk_media_content_height = jQuery('.mfp-content .fb-video iframe').height();
            if (sk_media_content_height == 1000) {
                sk_media_content_height = sk_media_content_height_raw;
            }
            sk_media_content_height = sk_media_content_height ? sk_media_content_height : 300;
            var sk_media_content_description_height = jQuery('.mfp-content .sk_media_content_description').height();
            if (jQuery(document).width() > 470 || jQuery(".mfp-content").width() > 470) {
                sk_media_content_height = sk_media_content_height - 2;
                jQuery('.mfp-content .white-popup,.mfp-content .sk_media_content').css({
                    "height": sk_media_content_height,
                });
            } else {
                jQuery('.mfp-content .sk_media_content').css({
                    "height": sk_media_content_height
                });
                jQuery('.mfp-content .white-popup').css({
                    "height": sk_media_content_height + sk_media_content_description_height
                });
            }
        }
    }

    function showSharePopup(jQuery, clicked_element, sk_facebook_feed) {
        if (typeof jQuery.magnificPopup === "undefined")
            initManificPopupPlugin(jQuery);
        var post_to_share = clicked_element.attr('post-to-share');
        var share_html = "<div style='width: 280px !important;' class='white-popup'>";
        share_html += "<div style='padding:30px;width:100%;'>";
        share_html += "<h3 class='sk-share-this-post-text'>" + getDsmSetting(sk_facebook_feed, 'share_this_post_text') + "</h3>";
        share_html += "<div style='overflow: hidden;'>";
        share_html += "<a class='fa fa-facebook-official sk-btn-share sk-btn-fb-share' target='_blank' href='https://www.facebook.com/sharer/sharer.php?u=" + post_to_share + "'> Share on Facebook</a>";
        share_html += "</div>";
        share_html += "<div style='overflow: hidden;'>";
        share_html += "<a target='_blank' href='https://twitter.com/share?url=" + post_to_share + "' class='fa fa-twitter sk-btn-share sk-btn-twitter-share'> Share on Twitter</a>";
        share_html += "</div>";
        share_html += "</div>";
        share_html += "</div>";
        jQuery.magnificPopup.open({
            items: {
                src: share_html,
                type: 'inline'
            },
            'type': 'inline',
            callbacks: {
                open: function() {
                    jQuery('.mfp-close').css('top', '-30px');
                },
                close: function() {}
            }
        });
    }

    function fixPopup() {
        var description_height = jQuery(".mfp-content").find(".sk_media_content_description").height() - 50;
        var post_header = jQuery(".mfp-content").find(".post-header").height();
        var post_stats = jQuery(".mfp-content").find(".post-post-counts").height();
        description_height = description_height - post_header - post_stats;
        if (jQuery(document).width() >= 550) {
            jQuery(".mfp-content").find(".sk_post_message").css({
                "height": description_height + "px",
                "overflow": "hidden"
            });
        } else {
            jQuery(".mfp-content").find(".sk_post_message").css({
                "height": "auto",
                "overflow": "hidden"
            });
        }
        jQuery(".mfp-content").find(".sk_post_message").mouseover(function() {
            jQuery(this).css({
                "overflow-y": "auto"
            });
        }).mouseout(function() {
            jQuery(this).css({
                "overflow-y": "hidden"
            });
        });
        jQuery(".mfp-content").find(".sk_post_message_content").css({
            "width": jQuery(".mfp-content").find(".sk_post_message").width() - 15 + "px"
        });
    }

    function makeResponsive(jQuery, sk_facebook_feed) {
        var sk_facebook_feed_width = sk_facebook_feed.width();
        var grid_sizer_item = 33;
        if (sk_facebook_feed_width <= 320) {
            grid_sizer_item = 100;
        } else if (sk_facebook_feed_width <= 481) {
            grid_sizer_item = 100;
            gridHeightSizer(sk_facebook_feed, 350);
        } else if (sk_facebook_feed_width <= 641) {
            if (getDsmSetting(sk_facebook_feed, "column_count") == 1) {
                grid_sizer_item = 100;
            } else {
                grid_sizer_item = 50;
            }
            gridHeightSizer(sk_facebook_feed, 280);
        } else if (sk_facebook_feed_width <= 830) {
            gridHeightSizer(sk_facebook_feed, 280);
            if (getDsmSetting(sk_facebook_feed, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 2) {
                grid_sizer_item = 50;
            }
        } else if (sk_facebook_feed_width <= 930) {
            if (getDsmSetting(sk_facebook_feed, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 2) {
                grid_sizer_item = 50;
            } else {
                grid_sizer_item = 33
            }
            gridHeightSizer(sk_facebook_feed, 300);
        } else if (sk_facebook_feed_width >= 930 && sk_facebook_feed_width <= 1030) {
            if (getDsmSetting(sk_facebook_feed, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 2) {
                grid_sizer_item = 50;
            }
            gridHeightSizer(sk_facebook_feed, 330);
        } else if (sk_facebook_feed_width >= 1030 && sk_facebook_feed_width <= 1200) {
            if (getDsmSetting(sk_facebook_feed, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 2) {
                grid_sizer_item = 50;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 4) {
                grid_sizer_item = 25;
            }
            gridHeightSizer(sk_facebook_feed, 370);
        } else {
            if (getDsmSetting(sk_facebook_feed, "column_count") == 1) {
                grid_sizer_item = 100;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 2) {
                grid_sizer_item = 50;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 3) {
                grid_sizer_item = 33;
            } else if (getDsmSetting(sk_facebook_feed, "column_count") == 4) {
                grid_sizer_item = 25;
            }
        }
        jQuery("body .grid-sizer-facebook-page-posts, body .grid-item-facebook-page-posts").css({
            "width": grid_sizer_item + "%"
        });
        if (getDsmSetting(sk_facebook_feed, 'layout') == 1) {
            var imgs = sk_facebook_feed.find('img');
            var len = imgs.length;
            if (len == 0 || imgs.prop('complete')) {
                setEventFeedHeight(sk_facebook_feed);
            }
            var counter = 0;
            [].forEach.call(imgs, function(img) {
                img.addEventListener('load', function() {
                    counter++;
                    if (counter == len || counter == len + 1 || counter >= len) {
                        setEventFeedHeight(sk_facebook_feed);
                    }
                }, false);
            });
        }
        var content_padding = parseInt(getDsmSetting(sk_facebook_feed, 'item_content_padding'));
        sk_facebook_feed.find(".post-post-counts").css('bottom', (content_padding + 3) + 'px');
    }

    function gridHeightSizer(sk_facebook_feed, height) {
        if (getDsmSetting(sk_facebook_feed, 'layout') == 1) {
            sk_facebook_feed.find('.sk-facebook-page-posts-container').css({
                'height': height + 'px'
            });
            var post_container = sk_facebook_feed.find(".grid-content");
            post_container.each(function(index, element) {
                if (jQuery(element).find('.sk-facebook-page-posts-container .sk-links').length > 0) {} else {
                    jQuery(element).find('.sk-facebook-page-posts-container').css({
                        'height': height + 'px'
                    });
                }
            });
        }
    }

    function setEventFeedHeight(sk_facebook_feed) {
        if ((getDsmSetting(sk_facebook_feed, 'layout') == 1 || getDsmSetting(sk_facebook_feed, 'layout') == 3)) {
            sk_facebook_feed.find(".grid-item-facebook-page-posts").css({
                "height": "auto"
            });
            var carousel_post_height = sk_facebook_feed.find(".grid-item-facebook-page-posts").height();
            if ((getDsmSetting(sk_facebook_feed, 'layout') == 3 || getDsmSetting(sk_facebook_feed, 'layout') == 1) && getDsmSetting(sk_facebook_feed, "post_height") > 0) {
                carousel_post_height = getDsmSetting(sk_facebook_feed, "post_height");
            }
            sk_facebook_feed.find('.swiper-button-next').css({
                "right": "22px"
            });
            var post_container = sk_facebook_feed.find(".grid-item-facebook-page-posts");
            var grid_height = 0;
            var header_height = 0;
            post_container.each(function(index, element) {
                var sk_header_height = jQuery(element).find(".post-header").height();
                var sk_title_height = jQuery(element).find(".sk-tweet-title").height();
                var tweet_count_height = jQuery(element).find(".post-tweet-counts").height();
                var total_height = carousel_post_height - sk_header_height;
                jQuery(element).find(".sk-facebook-page-posts-container").css({
                    "height": (total_height - 15) + "px",
                    "overflow-y": "hidden",
                    "overflow-x": "hidden"
                });
                jQuery(element).find(".grid-content-padding").css({
                    "height": (parseInt(carousel_post_height) + 90) + "px",
                });
                if (sk_header_height > header_height) {
                    header_height = sk_header_height;
                }
            });
            sk_facebook_feed.find(".post-post-counts").css({
                "margin-top": 15 + "px",
            });
            var sk_twitter_feed_url_meta_holder_width = sk_facebook_feed.find(".sk-facebook-page-posts-container").width();
            sk_facebook_feed.find(".sk-post-text, .sk_post_media,.sk-links, .sk-video, .sk_click_to_pop_content").css({
                "width": sk_twitter_feed_url_meta_holder_width - 5 + "px"
            });
            var swiper_height = sk_facebook_feed.find(".grid-item-facebook-page-posts").height();
            sk_facebook_feed.find(".swiper-wrapper").height(swiper_height + 10);
            if (jQuery(document).width() <= 480) {
                sk_facebook_feed.find('.swiper-button-prev').css({
                    "left": "-12px"
                });
                sk_facebook_feed.find('.swiper-button-next').css({
                    "right": "6px"
                });
            }
            sk_facebook_feed.find(".sk-post-text-new").css({
                "width": sk_facebook_feed.find(".sk-facebook-page-posts-container").width() - 5 + "px"
            });
            sk_facebook_feed.find(".sk-facebook-page-posts-container").mouseover(function() {
                var container_height = jQuery(this).closest(".grid-content").find(".sk_post_media,.sk-links").height();
                if (jQuery(this).closest(".grid-content").find(".sk-post-text").height() !== undefined && jQuery(this).closest(".grid-content").find(".sk-post-text").height() > 0) {
                    if (jQuery(this).closest(".grid-content").find(".sk-post-text").length > 0) {
                        container_height = container_height + jQuery(this).closest(".grid-content").find(".sk-post-text").height();
                    }
                    if (jQuery(this).closest(".grid-content").find(".sk-video").length > 0) {
                        container_height = container_height + jQuery(this).closest(".grid-content").find(".sk-video").height();
                    }
                    if (jQuery(this).closest(".grid-content").find(".sk-links").length > 0) {
                        container_height = container_height + jQuery(this).closest(".grid-content").find(".sk-links").height();
                    }
                }
                if (jQuery(this).height() < container_height) {
                    jQuery(this).css({
                        "overflow-y": "auto",
                        "overflow-x": "hidden"
                    });
                }
            }).mouseout(function() {
                jQuery(this).css({
                    "overflow-y": "hidden"
                });
            });
        }
    }

    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    function applyCustomUi(jQuery, sk_facebook_feed) {
        sk_facebook_feed.find(".loading-img").hide();
        var sk_facebook_feed_width = sk_facebook_feed.find('.sk_facebook_feed_width').text();
        sk_facebook_feed.css({
            'width': '100%'
        });
        var sk_facebook_feed_width = sk_facebook_feed.innerWidth();
        sk_facebook_feed.css({
            'height': 'auto'
        });
        var column_count = sk_facebook_feed.find('.column_count').text();
        var border_size = 0;
        var background_color = "#555555";
        var space_between_images = sk_facebook_feed.find('.space_between_images').text();
        var margin_between_images = parseFloat(space_between_images).toFixed(2) / 2;
        var total_space_between_images = parseFloat(space_between_images).toFixed(2) * parseFloat(column_count);
        var pic_width = (parseFloat(sk_facebook_feed_width).toFixed(2) - parseFloat(total_space_between_images).toFixed(2)) / parseFloat(column_count).toFixed(2);
        jQuery(".sk-ww-youtube-channel-videos-item").css({
            "width": "200px"
        })
        var sk_ig_all_posts_minus_spaces = parseFloat(sk_facebook_feed_width).toFixed(2) - parseFloat(total_space_between_images).toFixed(2);
        var bottom_button_container_width = parseFloat(sk_facebook_feed_width).toFixed(2) - (parseFloat(space_between_images).toFixed(2) * 2);
        var bottom_button_width = parseFloat(sk_facebook_feed_width).toFixed(2) / parseFloat(2).toFixed(2);
        var sk_facebook_feed_width_minus_space_between_images = parseFloat(sk_facebook_feed_width).toFixed(2) - parseFloat(space_between_images).toFixed(2);
        sk_facebook_feed.css({
            'font-family': getDsmSetting(sk_facebook_feed, "font_family"),
            'width': sk_facebook_feed_width_minus_space_between_images,
            'background-color': getDsmSetting(sk_facebook_feed, "widget_bg_color"),
            'color': getDsmSetting(sk_facebook_feed, "widget_font_color")
        });
        var color = '';
        switch (getDsmSetting(sk_facebook_feed, 'theme')) {
            case 'Maayos Theme':
                color = '#c8c8c8'
                break;
            case 'Matalino Theme':
                color = '#444444'
                break;
            case 'Maagap Theme':
                color = '#C4BFC2'
                break;
            case 'Maganda Theme':
                color = '#fff'
                break;
            case 'Masikap Theme':
                color = '#C4BFC2'
                break;
            case 'Matino Theme':
                color = '#C4BFC2'
                break;
        }
        sk_facebook_feed.find('.sk-fb-page-name .sk-story').css({
            'color': color
        });
        var arrow_background_color = getDsmSetting(sk_facebook_feed, "arrow_background_color");
        var arrow_color = getDsmSetting(sk_facebook_feed, "arrow_color");
        var arrow_opacity = getDsmSetting(sk_facebook_feed, "arrow_opacity");
        jQuery('.sk-pop-ig-post').css({
            'font-family': getDsmSetting(sk_facebook_feed, "font_family")
        });
        sk_facebook_feed.find('.mfp-content').find('.sk-post-text, .sk_post_name, .sk_post_media, .sk_post_media a, .sk_link_meta').css({
            'color': getDsmSetting(sk_facebook_feed, "pop_up_font_color")
        });
        sk_facebook_feed.find(".sk-link-description").css({
            'color': getDsmSetting(sk_facebook_feed, "details_font_color")
        });
        sk_facebook_feed.find('.grid-content').css({
            'background-color': getDsmSetting(sk_facebook_feed, "details_bg_color")
        });
        jQuery(window).resize(function() {
            if (jQuery(document).width() > 450) {
                hidePopUp();
            }
        });
        if (getDsmSetting(sk_facebook_feed, "show_box_shadow") == 1) {
            var posts_shadow_color = "rgba(0,0,0,0.10)";
            if (getDsmSetting(sk_facebook_feed, "posts_shadow_color")) {
                posts_shadow_color = getDsmSetting(sk_facebook_feed, "posts_shadow_color");
            }
            sk_facebook_feed.find('.grid-content').css({
                'box-shadow': "0 2px 5px 0 " + posts_shadow_color,
                '-moz-box-shadow': "0 2px 5px 0 " + posts_shadow_color,
                '-webkit-box-shadow': "0 2px 5px 0 " + posts_shadow_color
            });
        }
        if (getDsmSetting(sk_facebook_feed, "border_radius")) {
            sk_facebook_feed.find('.grid-content').css({
                'border-radius': getDsmSetting(sk_facebook_feed, "border_radius") + 'px'
            });
        }
        sk_facebook_feed.find('.sk-secondary-data').css({
            'color': getDsmSetting(sk_facebook_feed, "details_secondary_font_color"),
            'font-family': getDsmSetting(sk_facebook_feed, "font_family")
        });
        sk_facebook_feed.find('.sk-fb-page-name').css({
            'font-family': getDsmSetting(sk_facebook_feed, "font_family")
        });
        sk_facebook_feed.find('.sk-ww-facebook-page-posts-item').css({
            'color': getDsmSetting(sk_facebook_feed, "details_font_color"),
            'border-top': 'thin solid ' + getDsmSetting(sk_facebook_feed, "post_separator_color")
        });
        sk_facebook_feed.find('.sk-post-text, .post-post-counts, .sk_link_meta, .sk_video_name, .sk_post_description, .sk-link-title').css({
            'color': getDsmSetting(sk_facebook_feed, "details_font_color")
        });
        var margin_bottom_sk_ig_load_more_posts = space_between_images;
        if (margin_bottom_sk_ig_load_more_posts == 0) {
            margin_bottom_sk_ig_load_more_posts = 5;
        }
        sk_facebook_feed.find(".sk-facebook-page-posts-load-more-posts").css({
            'margin-bottom': margin_bottom_sk_ig_load_more_posts + 'px'
        });
        sk_facebook_feed.find(".facebook-page-posts-user-container, .sk-facebook-page-posts-load-more-posts, .sk-facebook-page-posts-bottom-follow-btn").css({
            'background-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
            'border-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
            'color': getDsmSetting(sk_facebook_feed, "button_text_color")
        });
        sk_facebook_feed.find(".facebook-page-posts-user-container, .sk-facebook-page-posts-load-more-posts, .sk-facebook-page-posts-bottom-follow-btn").mouseover(function() {
            jQuery(this).css({
                'background-color': getDsmSetting(sk_facebook_feed, "button_hover_bg_color"),
                'border-color': getDsmSetting(sk_facebook_feed, "button_hover_bg_color"),
                'color': getDsmSetting(sk_facebook_feed, "button_hover_text_color")
            });
        }).mouseout(function() {
            jQuery(this).css({
                'background-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
                'border-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
                'color': getDsmSetting(sk_facebook_feed, "button_text_color")
            });
        });
        jQuery(".mfp-content .sk_view_more_comments, .mfp-content .sk_add_comment").css({
            'background-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
            'border-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
            'color': getDsmSetting(sk_facebook_feed, "button_text_color")
        });
        jQuery(".mfp-content .sk_view_more_comments, .mfp-content .sk_add_comment").mouseover(function() {
            jQuery(this).css({
                'background-color': getDsmSetting(sk_facebook_feed, "button_hover_bg_color"),
                'border-color': getDsmSetting(sk_facebook_feed, "button_hover_bg_color"),
                'color': getDsmSetting(sk_facebook_feed, "button_hover_text_color")
            });
        }).mouseout(function() {
            jQuery(this).css({
                'background-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
                'border-color': getDsmSetting(sk_facebook_feed, "button_bg_color"),
                'color': getDsmSetting(sk_facebook_feed, "button_text_color")
            });
        });
        var padding_sk_ig_bottom_btn_container = margin_between_images;
        if (padding_sk_ig_bottom_btn_container == 0) {
            padding_sk_ig_bottom_btn_container = 5;
        }
        sk_facebook_feed.find(".sk-facebook-page-posts-bottom-btn-container").css({
            'padding': padding_sk_ig_bottom_btn_container + 'px'
        });
        sk_facebook_feed.find(".share-action").css({
            'cursor': 'pointer'
        });
        sk_facebook_feed.find('.sk-facebook-page-posts-profile-description strong').css({
            'color': getDsmSetting(sk_facebook_feed, "widget_font_color")
        });
        fixedMultipleImageHeight(sk_facebook_feed, pic_width);
        applyDsmDetailsLinkHoverColor(sk_facebook_feed);
        applyDsmTitleAllCapitalization(sk_facebook_feed);
        applyDsmDefaultFonts(sk_facebook_feed);
        applyDsmPictureShape(sk_facebook_feed);
        applyDsmFontFamily(sk_facebook_feed);
        applyGridImageLayout(sk_facebook_feed);
        applyPopUpColors(sk_facebook_feed);
        applyDsmPostContentPadding(sk_facebook_feed);
        jQuery('.sk_powered_by a').css({
            'background-color': getDsmSetting(sk_facebook_feed, "details_bg_color"),
            'color': getDsmSetting(sk_facebook_feed, "details_font_color"),
            'font-size': getDsmSetting(sk_facebook_feed, "details_font_size"),
        });
        sk_facebook_feed.find('.sk-fb-event-item, .sk_powered_by').css({
            'margin-bottom': getDsmSetting(sk_facebook_feed, "space_between_events") + 'px'
        });
        makeResponsive(jQuery, sk_facebook_feed);
        if (getDsmSetting(sk_facebook_feed, "layout") == 3) {
            sk_facebook_feed.find(".grid-facebook-page-posts,.facebook-page-posts-user-root-container").css({
                "width": "85%",
                "margin": "0px auto"
            });
        }
        var custom_css = `.sk_post_message::-webkit-scrollbar{width:5px!important;}.sk_post_message::-webkit-scrollbar-track{border-radius:10px!important;-webkit-box-shadow:inset 0 0 5px rgb(128,128,128);}.sk_post_message::-webkit-scrollbar-thumb{border-radius:10px!important;-webkit-box-shadow:inset 0 0 5px rgb(128,128,128);}`;
        jQuery('head').append('<style type="text/css">' + getDsmSetting(sk_facebook_feed, "custom_css") + custom_css + '</style>');
        setTimeout(function() {
            applyDsmDetailsLinkColor(sk_facebook_feed);
            applyPopUpColors(sk_facebook_feed);
        }, 100);
        loadYTScript();
        applyIconsColorTheme(sk_facebook_feed);
    }

    function applyIconsColorTheme(sk_facebook_feed) {
        var theme_color = sk_facebook_feed.find('.sk-fb-post-footer-icon a').css('color');
        sk_facebook_feed.find('.post-post-counts').css('color', theme_color);
    }

    function applyDsmDetailsLinkColor(sk_facebook_feed) {
        sk_facebook_feed.find(".grid-item-facebook-page-posts a").css({
            'color': getDsmSetting(sk_facebook_feed, "details_link_color")
        });
    }

    function applyDsmDetailsLinkHoverColor(sk_facebook_feed) {
        if (getDsmSetting(sk_facebook_feed, "links_clickable") == 1) {
            sk_facebook_feed.find(".grid-item-facebook-page-posts a").hover(function() {
                jQuery(this).css({
                    'color': getDsmSetting(sk_facebook_feed, "details_link_hover_color")
                });
            }, function() {
                jQuery(this).css({
                    'color': getDsmSetting(sk_facebook_feed, "details_link_color")
                });
            });
            jQuery(".mfp-content a").hover(function() {
                jQuery(this).css({
                    'color': getDsmSetting(sk_facebook_feed, "pop_up_link_color")
                });
            }, function() {
                jQuery(this).css({
                    'color': getDsmSetting(sk_facebook_feed, "pop_up_link_color")
                });
            });
        }
    }

    function applyDsmPostContentPadding(sk_facebook_feed) {
        var padding = parseInt(getDsmSetting(sk_facebook_feed, "item_content_padding"));
        if (sk_facebook_feed.width() < 480) {
            padding = 20;
        }
        sk_facebook_feed.find(".grid-content-padding").attr('style', "padding: " + padding + "px !important;");
    }

    function applyDsmTitleAllCapitalization(sk_facebook_feed) {
        var element = sk_facebook_feed.find(".sk-facebook-page-posts-profile-usename");
        if (getDsmSetting(sk_facebook_feed, "title_all_caps") == 1) {
            element.css({
                'text-transform': 'uppercase',
                'font-size': getDsmSetting(sk_facebook_feed, "title_font_size") + 'px'
            });
        } else {
            element.css({
                'font-size': getDsmSetting(sk_facebook_feed, "title_font_size") + 'px'
            });
        }
    }

    function applyDsmDefaultFonts(sk_facebook_feed) {
        var element = sk_facebook_feed.find(".more,.grid-content,.sk-facebook-page-posts-profile-counts,.sk-facebook-page-posts-profile-description,.sk-facebook-page-posts-profile-info button,.sk-facebook-page-posts-load-more-posts,.sk-facebook-page-posts-bottom-follow-btn");
        if (getDsmSetting(sk_facebook_feed, "details_all_caps") == 1) {
            element.css({
                'text-transform': 'uppercase',
                'font-size': getDsmSetting(sk_facebook_feed, "details_font_size") + 'px'
            });
        } else {
            element.css({
                'font-size': getDsmSetting(sk_facebook_feed, "details_font_size") + 'px'
            });
        }
    }

    function applyDsmPictureShape(sk_facebook_feed) {
        if (getDsmSetting(sk_facebook_feed, "show_circular_main_picture") == 1) {
            sk_facebook_feed.find(".sk-facebook-page-posts-profile-pic,.img-thumbnail").css({
                'webkit-border-radius': '50%',
                '-moz-border-radius': '50%',
                'border-radius': '50%'
            });
        } else {
            sk_facebook_feed.find(".sk-facebook-page-posts-profile-pic,.img-thumbnail").css({
                'webkit-border-radius': '0',
                '-moz-border-radius': '0',
                'border-radius': '0'
            });
        }
    }

    function applyDsmFontFamily(sk_facebook_feed) {
        var font = getDsmSetting(sk_facebook_feed, "font_family");
        var splited_string_font = font.split(':');
        sk_facebook_feed.css({
            'font-family': splited_string_font[0],
        });
    }

    function applyGridImageLayout(sk_facebook_feed) {
        var max_photo = sk_facebook_feed.find('.max_photo');
        if (max_photo.length > 0) {
            jQuery.each(max_photo, function(i, v) {
                jQuery(v).find('div:eq(0)').css({
                    "grid-column": "1 ",
                    "grid-row": "1/ 1 1"
                });
                jQuery(v).find('div:eq(0) img').css({
                    "height": "auto !important",
                });
            });
            jQuery('.img-count').closest('div.image-item').css({
                "position": "relative",
                "display": "inline-block"
            });
        }
    }

    function applyPopUpColors(popup_container) {
        var pop_up_bg_color = popup_container.find('.pop_up_bg_color').text();
        var pop_up_font_color = popup_container.find('.pop_up_font_color').text();
        var pop_up_link_color = popup_container.find('.pop_up_link_color').text();
        popup_container.find('.white-popup,.white-popup-sk-fb-feed-video').css({
            'color': pop_up_font_color,
            'background': pop_up_bg_color
        });
        popup_container.find('.white-popup a,.white-popup-sk-fb-feed-video a').css({
            'color': pop_up_link_color
        });
        popup_container.find('.white-popup .sk-secondary-data,.white-popup-sk-fb-feed-video .sk-secondary-data').css({
            'color': pop_up_font_color
        });
        popup_container.find('.white-popup .post-post-counts div,.white-popup-sk-fb-feed-video .post-post-counts div').css({
            'color': pop_up_font_color
        });
        popup_container.find('.href_status_trigger_container.sk_pop_video_feed_video_description a').css({
            'color': pop_up_font_color
        });
        popup_container.find('.white-popup a').hover(function() {
            jQuery(this).css({
                'color': pop_up_link_color
            });
        }, function() {
            jQuery(this).css({
                'color': pop_up_link_color
            });
        });
    }

    function fixedMultipleImageHeight(sk_facebook_feed, pic_width) {
        sk_facebook_feed.find('.single_photo img').css('height', 'auto');
        sk_facebook_feed.find('.two_photo img:eq(1)').css('height', '100%');
        if (sk_facebook_feed.width() <= 480) {
            sk_facebook_feed.find(".two_photo,.three_photo").css({
                "display": "flex",
            });
        } else {
            if (getDsmSetting(sk_facebook_feed, 'column_count') == 1) {
                sk_facebook_feed.find(".two_photo,.three_photo,.max_photo").find("img.sk_post_img").css({
                    "height": "300px"
                });
            } else if (getDsmSetting(sk_facebook_feed, 'column_count') == 4) {
                sk_facebook_feed.find(".two_photo,.three_photo,.max_photo").find("img.sk_post_img").css({
                    "height": "150px"
                });
            } else {
                sk_facebook_feed.find(".two_photo,.three_photo,.max_photo").find("img.sk_post_img").css({
                    "height": "190px"
                });
                sk_facebook_feed.find(".sk_post_media .three_photo:first .image-item").css({
                    "height": "190px"
                });
            }
        }
    }

    function loadGoogleFont(font_family) {
        var web_safe_fonts = ["Inherit", "Impact, Charcoal, sans-serif", "'Palatino Linotype', 'Book Antiqua', Palatino, serif", "Century Gothic, sans-serif", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", "Verdana, Geneva, sans-serif", "Copperplate, 'Copperplate Gothic Light', fantasy", "'Courier New', Courier, monospace", "Georgia, Serif"];
        loadCssFile("https://fonts.googleapis.com/css?family=" + font_family);
    }

    function addDescriptiveTagAttributes(_sk, add_to_img = true) {
        _sk.find('a').each(function(i, v) {
            var title = jQuery(v).text();
            jQuery(v).attr('title', title);
        });
        if (add_to_img) {
            _sk.find('img').each(function(i, v) {
                var src = jQuery(v).attr('src');
                jQuery(v).attr('alt', src);
            });
        }
    }

    function getClientId() {
        var _gaCookie = document.cookie.match(/(^|[;,]\s?)_ga=([^;,]*)/);
        if (_gaCookie) return _gaCookie[2].match(/\d+\.\d+$/)[0];
    }

    function getSkEmbedId(sk_class) {
        var embed_id = sk_class.attr('embed-id');
        if (embed_id == undefined) {
            embed_id = sk_class.attr('data-embed-id');
        }
        return embed_id;
    }

    function getSkSetting(sk_class, key) {
        return sk_class.find("div." + key).text();
    }

    function setCookieSameSite() {
        document.cookie = "AC-C=ac-c;expires=Fri, 31 Dec 2025 23:59:59 GMT;path=/;HttpOnly;SameSite=Lax";
    }
    setCookieSameSite();

    function getIEVersion() {
        var sAgent = window.navigator.userAgent;
        var Idx = sAgent.indexOf("MSIE");
        if (Idx > 0)
            return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));
        else if (!!navigator.userAgent.match(/Trident\/7\./))
            return 11;
        else
            return 0;
    }

    function isSafariBrowser() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') != -1) {
            if (ua.indexOf('chrome') > -1) {
                return 0;
            } else {
                return 1;
            }
        }
    }
    if (getIEVersion() > 0 || isSafariBrowser() > 0) {
        loadIEScript('https://cdn.jsdelivr.net/bluebird/3.5.0/bluebird.min.js');
        loadIEScript('https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.js');
    }

    function loadIEScript(url) {
        var scriptTag = document.createElement('script');
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute("src", url);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
    }

    function kFormatter(num) {
        return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
    }

    function sk_increaseView(user_info) {
        if (!user_info)
            return;
        jQuery.getJSON('https://api.ipify.org?format=json', function(data) {
            jQuery.getJSON('https://api.ipify.org?format=json', function(data) {
                var update_views_url = "https://views.accentapi.com/add_view.php?user_id=" + user_info.id + "&url=" + document.URL + "&ip_address=" + data.ip + "&embed_id=" + user_info.embed_id;
                if (app_url.includes("local") && sk_app_url) {
                    update_views_url = "https://localtesting.com/accentapiviews/add_view.php?user_id=" + user_info.id + "&url=" + document.URL + "&ip_address=" + data.ip + "&embed_id=" + user_info.embed_id;
                }
                jQuery.ajax(update_views_url);
            });
        });
    }

    function isTooDarkColor(hexcolor) {
        var r = parseInt(hexcolor.substr(1, 2), 16);
        var g = parseInt(hexcolor.substr(3, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        if (hexcolor.indexOf('rgb') != -1) {
            let rgbstr = hexcolor;
            let v = getRGB(rgbstr);
            r = v[0];
            g = v[1];
            b = v[2];
        }
        b = isNaN(b) ? 0 : b;
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        if (yiq < 60) {} else {}
        return yiq < 60 ? true : false;
    }

    function linkify(html) {
        var temp_text = html.split("https://www.").join("https://");
        temp_text = temp_text.split("www.").join("https://www.");
        var exp = /((href|src)=["']|)(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return temp_text.replace(exp, function() {
            return arguments[1] ? arguments[0] : "<a href=\"" + arguments[3] + "\">" + arguments[3] + "</a>"
        });
    }

    function skGetEnvironmentUrls(folder_name) {
        var scripts = document.getElementsByTagName("script");
        var scripts_length = scripts.length;
        var search_result = -1;
        var other_result = -1;
        var app_url = "https://widgets.sociablekit.com/";
        var app_backend_url = "https://api.accentapi.com/v1/";
        var app_file_server_url = "https://data.accentapi.com/feed/";
        var sk_app_url = "https://sociablekit.com/app/";
        var sk_api_url = "https://api.sociablekit.com/";
        var sk_img_url = "https://images.sociablekit.com/";
        for (var i = 0; i < scripts_length; i++) {
            var src_str = scripts[i].getAttribute('src');
            if (src_str != null) {
                var other_folder = "";
                if (folder_name == 'facebook-page-playlist') {
                    other_folder = 'facebook-page-playlists';
                } else if (folder_name == 'linkedin-page-posts') {
                    other_folder = 'linkedin-page-post';
                } else if (folder_name == 'linkedin-profile-posts') {
                    other_folder = 'linkedin-profile-post';
                } else if (folder_name == 'facebook-hashtag-posts') {
                    other_folder = 'facebook-hashtag-feed';
                } else if (folder_name == 'facebook-page-events') {
                    other_folder = 'facebook-events';
                } else if (folder_name == 'facebook-page-posts') {
                    other_folder = 'facebook-feed';
                    if (document.querySelector(".sk-ww-facebook-feed")) {
                        var element = document.getElementsByClassName("sk-ww-facebook-feed")[0];
                        element.classList.add("sk-ww-facebook-page-posts");
                    }
                }
                other_result = src_str.search(other_folder);
                search_result = src_str.search(folder_name);
                if (search_result >= 1 || other_result >= 1) {
                    var src_arr = src_str.split(folder_name);
                    app_url = src_arr[0];
                    app_url = app_url.replace("displaysocialmedia.com", "sociablekit.com");
                    if (app_url.search("local") >= 1) {
                        app_backend_url = "http://localhost:3000/v1/";
                        app_url = "https://localtesting.com/SociableKIT_Widgets/";
                        app_file_server_url = "https://localtesting.com/SociableKIT_FileServer/feed/";
                        sk_app_url = "https://localtesting.com/SociableKIT/";
                        sk_api_url = "http://127.0.0.1:8000/";
                        sk_img_url = "https://localtesting.com/SociableKIT_Images/";
                    } else {
                        app_url = "https://widgets.sociablekit.com/";
                    }
                }
            }
        }
        return {
            "app_url": app_url,
            "app_backend_url": app_backend_url,
            "app_file_server_url": app_file_server_url,
            "sk_api_url": sk_api_url,
            "sk_app_url": sk_app_url,
            "sk_img_url": sk_img_url
        };
    }

    function changeBackSlashToBR(text) {
        if (text) {
            for (var i = 1; i <= 10; i++) {
                text = text.replace('\n', '</br>');
            }
        }
        return text;
    }

    function sKGetScrollbarWidth() {
        var outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        var inner = document.createElement('div');
        outer.appendChild(inner);
        var scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }
    async function showUrlData(element, url, post_id, type = "", show_thumbnail = 1) {
        element.hide();
        var free_data_url = app_file_server_url.replace("feed/", "get_fresh_url_tags.php") + '?post_id=' + post_id + '&url=' + url;
        var read_one_url = app_file_server_url.replace("feed", "url-tags") + post_id + ".json?nocache=" + (new Date()).getTime();
        var read_one_url = app_file_server_url.replace("feed", "url-tags") + post_id + ".json";
        fetch(read_one_url, {
            method: 'get'
        }).then(async response => {
            if (response.ok) {
                let data = await response.json();
                if (data && data.status && data.status == 418) {
                    displayUrlData(data, element, type, show_thumbnail);
                    data = await jQuery.ajax(free_data_url);
                }
                return data;
            } else {
                response = await jQuery.ajax(free_data_url);
                displayUrlData(response, element, type, show_thumbnail);
                return response;
            }
        }).then(response => {
            if (response != undefined) {
                displayUrlData(response, element, type, show_thumbnail);
            }
        });
    }
    async function displayUrlData(response, element, type, show_thumbnail = 1) {
        var meta_holder = jQuery(element);
        var html = "";
        if (!response || response.error) {
            if (meta_holder.html()) {
                meta_holder.show();
            }
            return;
        }
        if (response.message && response.message == "Data not available. Please try again.") {
            return;
        }
        if (response.messages && response.messages.length > 0 && response.messages[0] == "PDF files that are over 10Mb are not supported by Google Docs Viewer") {
            var data = response.url;
            if (response.url) {
                data = response.url.replace("https://", "").split("/");
            }
            if (data.length > 0) {
                if (data.length > 1) {
                    response.title = data[data.length - 1];
                }
                response.description = data[0].replace("www.", "");
            }
        }
        html += "<a href='" + response.url + "' link-only target='_blank'>";
        html += "<div class='sk-link-article-container' style='background: #eeeeee;color: black !important; font-weight: bold !important; border-radius: 2px; border: 1px solid #c3c3c3; box-sizing: border-box; word-wrap: break-word;'>";
        if (show_thumbnail == 1) {
            html += "<image alt='No alternative text description for this image' class='sk-link-article-image sk_post_img_link' onerror='this.style.display=\"none\"' src='" + response.thumbnail_url + "'/>";
        }
        if (response.title) {
            html += "<div class='sk-link-article-title' style='padding: 8px;'>" + response.title + "</div>";
        }
        if (type && type == 6) {
            if (response.description && response.description.length > 0) {
                response.description = response.description.length > 140 ? response.description.substring(0, 140) + ' ...' : response.description;
            }
        }
        if (response.description && response.description.indexOf("[vc_row]") !== -1 && response.url) {
            var pathArray = response.url.split('/');
            var protocol = pathArray[0];
            if (pathArray.length > 2) {
                var host = pathArray[2];
                var url = protocol + '//' + host;
                html += "<div class='sk-link-article-description' style='padding: 8px;color: grey;font-weight: 100;font-size: 14px;'>" + url + "</div>";
            }
        } else if (response.description && response.description.indexOf("fb_built") == -1) {
            html += "<div class='sk-link-article-description' style='padding: 8px;color: #000000;font-weight: 100;font-size: 14px;'>" + response.description + "</div>";
        } else if (response.url && response.url.includes('instagram.com/p/')) {
            html += "<image style='padding: 8px;' alt='No alternative text description for this image' class='sk-ig-default' onerror='this.style.display=\"none\"' src='https://i1.wp.com/sociablekit.com/wp-content/uploads/2019/01/instagram.png'/>";
            html += "<div class='sk-link-article-description' style='padding: 8px;margin-left:15%;color: #000000;font-weight: 600;font-size: 14px;'>View this post in instagram</div>";
            html += "<div class='sk-link-article-description' style='padding: 0px 8px ;margin-left:15%;margin-bottom:10px;color: #000000;font-weight: 100;font-size: 10px;'>" + response.url + "</div>";
        }
        html += "</div>";
        html += "</a>";
        meta_holder.html(html);
        meta_holder.css('display', 'block');
        meta_holder.css('margin-bottom', '15px');
        meta_holder.find('.sk-ig-default').closest('.sk-link-article-container').css('display', 'inline-block');
        meta_holder.find('.sk-ig-default').closest('.sk-link-article-container').css('width', '100%');
        meta_holder.find('.sk-ig-default').css('width', '20%');
        meta_holder.find('.sk-ig-default').css('float', 'left');
        applyMasonry();
    }

    function slugifyString(str) {
        str = str.replace(/^\s+|\s+$/g, '');
        str = str.toLowerCase();
        var from = "ÃÃ„Ã‚Ã€ÃƒÃ…ÄŒÃ‡Ä†ÄŽÃ‰ÄšÃ‹ÃˆÃŠáº¼Ä”È†ÃÃŒÃŽÃÅ‡Ã‘Ã“Ã–Ã’Ã”Ã•Ã˜Å˜Å”Å Å¤ÃšÅ®ÃœÃ™Ã›ÃÅ¸Å½Ã¡Ã¤Ã¢Ã Ã£Ã¥ÄÃ§Ä‡ÄÃ©Ä›Ã«Ã¨Ãªáº½Ä•È‡Ã­Ã¬Ã®Ã¯ÅˆÃ±Ã³Ã¶Ã²Ã´ÃµÃ¸Ã°Å™Å•Å¡Å¥ÃºÅ¯Ã¼Ã¹Ã»Ã½Ã¿Å¾Ã¾ÃžÄÄ‘ÃŸÃ†aÂ·/_,:;";
        var to = "AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------";
        for (var i = 0, l = from.length; i < l; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
        str = str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        return str;
    }

    function skGetBranding(sk_, user_info) {
        var html = "";
        if (!user_info)
            return;
        var slugify_string = "";
        if (user_info.solution_name) {
            slugify_string = slugifyString(user_info.solution_name);
            user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string + "-website/";
            if (user_info.website_builder) {
                user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string;
                slugify_string = slugifyString(user_info.website_builder);
                user_info.tutorial_link = user_info.tutorial_link + "-" + slugify_string;
            }
        }
        if (user_info.type == 39) {
            user_info.tutorial_link = "https://www.sociablekit.com/tutorials/embed-google-my-business-photos-website/";
        }
        if (user_info.type == 9) {
            user_info.tutorial_link = "https://www.sociablekit.com/sync-facebook-page-events-to-google-calendar/";
        } else if (user_info.type == 26) {
            user_info.tutorial_link = "https://www.sociablekit.com/how-to-sync-facebook-group-events-to-google-calendar-on-website/";
        }
        if (user_info.show_branding && user_info.show_branding == 1) {
            var fontFamily = getSkSetting(sk_, "font_family");
            var link_color = getSkSetting(sk_, "details_link_color");
            var details_bg_color = getSkSetting(sk_, "details_bg_color");
            if (link_color == "") {
                link_color = "rgb(52, 128, 220)";
            }
            if (details_bg_color && isTooDarkColor(link_color) == false && isTooDarkColor(details_bg_color) == false) {
                link_color = '#3480dc';
            }
            var temporary_tutorial_link = user_info.tutorial_link;
            if (temporary_tutorial_link.endsWith("/") == false) {
                temporary_tutorial_link = temporary_tutorial_link + "/";
            }
            html += "<div class='sk_branding' style='padding:10px; display:block !important; text-align:center; text-decoration: none !important; color:#555; font-family:" + fontFamily + "; font-size:15px;'>";
            html += "<a class='tutorial_link' href='" + temporary_tutorial_link + "' target='_blank' style='text-underline-position:under; color:" + link_color + ";font-size:15px;'>";
            html += "Embed " + user_info.solution_name + " on your ";
            if (user_info.website_builder && user_info.website_builder != "Website") {
                html += user_info.website_builder;
            }
            html += " website";
            html += "</a>";
            html += "</div>";
        }
        return html;
    }

    function getRGB(rgbstr) {
        return rgbstr.substring(4, rgbstr.length - 1).replace(/ /g, '').replace('(', '').split(',');
    }

    function freeTrialEndedMessage(solution_info) {
        var sk_error_message = "";
        sk_error_message += "<ul class='sk_error_message'>";
        sk_error_message += "<li><a href='" + solution_info.tutorial_link + "' target='_blank'>Customized " + solution_info.solution_name + " feed by SociableKIT</a></li>";
        sk_error_message += "<li>If youâ€™re the owner of this website, thereâ€™s something wrong with your account.</li>";
        sk_error_message += "<li>Please contact support now.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }

    function isFreeTrialEnded(start_date) {
        var start_date = new Date(start_date);
        var current_date = new Date();
        var difference = current_date.getTime() - start_date.getTime();
        difference = parseInt(difference / (1000 * 60 * 60 * 24));
        return difference > 7 ? true : false;
    }

    function unableToLoadSKErrorMessage(solution_info, additional_error_messages) {
        var sk_error_message = "<ul class='sk_error_message'>";
        sk_error_message += "<li><a href='" + solution_info.tutorial_link + "' target='_blank'>Customized " + solution_info.solution_name + " feed by SociableKIT</a></li>";
        sk_error_message += "<li>Unable to load " + solution_info.solution_name + ".</li>";
        for (var i = 0; i < additional_error_messages.length; i++) {
            sk_error_message += additional_error_messages[i];
        }
        sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }

    function widgetValidation(_sk, data) {
        if (data.user_info) {
            var user_info = data.user_info;
            user_info.trial_ended = false;
            if (user_info.status == 6 && user_info.start_date) {
                var start_date = new Date(user_info.start_date).getTime();
                var current_date = new Date().getTime();
                var difference = current_date - start_date;
                difference = parseInt(difference / (1000 * 60 * 60 * 24));
                user_info.show_feed = difference > 7 ? false : true;
                user_info.trial_ended = difference > 7 ? true : false;
            } else if (user_info.status == 7 && user_info.cancellation_date) {
                var cancellation_date = new Date(user_info.cancellation_date).setHours(0, 0, 0, 0);
                var current_date = new Date().setHours(0, 0, 0, 0);
                user_info.show_feed = current_date > cancellation_date ? false : true;
                var activation_date = new Date(user_info.activation_date).setHours(0, 0, 0, 0);
                if (activation_date > cancellation_date) {
                    user_info.show_feed = true;
                }
            } else if (user_info.status == 0 || user_info.status == 2 || user_info.status == 10) {
                user_info.show_feed = false;
            }
            if (!user_info.show_feed) {
                var sk_error_message = generateBlueMessage(_sk, user_info);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
            return user_info.show_feed;
        }
    }

    function generateBlueMessage(_sk, user_info) {
        var tutorial_link = "";
        if (user_info.solution_name) {
            var slugify_string = slugifyString(user_info.solution_name);
            tutorial_link = "https://www.sociablekit.com/tutorials/embed-" + slugify_string + "-website/";
        }
        if (user_info.type == 9) {
            tutorial_link = "https://www.sociablekit.com/sync-facebook-page-events-to-google-calendar/";
        } else if (user_info.type == 26) {
            tutorial_link = "https://www.sociablekit.com/how-to-sync-facebook-group-events-to-google-calendar-on-website/";
        }
        var sk_error_message = "";
        if (user_info.show_feed == false && user_info.trial_ended == true && detectedSKDashboard()) {
            sk_error_message = getSKDashboardPremiumTrialMessage();
        } else if (user_info.show_feed == false) {
            if (!user_info.message || user_info.message == "") {
                var sk_error_message = "<ul class='sk_error_message'>";
                sk_error_message += "<li><a href='" + tutorial_link + "' target='_blank'>" + user_info.solution_name + " powered by SociableKIT</a></li>";
                sk_error_message += "<li>If youâ€™re the owner of this website or SociableKIT account used, we found some errors with your account.</li>";
                sk_error_message += "<li>Please login your SociableKIT account to fix it.</li>";
                sk_error_message += "</ul>";
                user_info.message = sk_error_message;
            }
            sk_error_message = user_info.message;
        } else if (user_info.solution_name == null && user_info.type == null && user_info.start_date == null) {
            sk_error_message = "<p class='sk_error_message'>";
            sk_error_message += "The SociableKIT solution does not exist. If you think this is a mistake, please contact support.";
            sk_error_message += "</p>";
        } else if (user_info.to_encode == 1 && user_info.encoded == false) {
            var learn_more_element = "<a style='color:#fff;' href='https://help.sociablekit.com/en-us/article/why-is-my-feed-not-working-19cw6zw/' target='_blank'><u>Learn more</u></a>."
            var styles = "style='background-color: #1972f5; text-align: center !important; margin-top: 50px; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 30px; padding: 20px 45px; border-radius: 3px; color: white !important;'";
            sk_error_message = "<div " + styles + ">";
            sk_error_message += "<div style='width: auto; display: inline-block;'><i class='fa fa-spinner fa-pulse'></i></div> <div style='width: auto; display: inline-block;'>Your " + user_info.solution_name + " will appear soon. Please check back later! " + learn_more_element + "</div>";
            sk_error_message += "</div>";
        } else {
            sk_error_message = "<div class='sk_error_message'>";
            sk_error_message += "<div style='display: inline-flex;width:100%;'>";
            sk_error_message += "<div>";
            sk_error_message += "<ul>";
            sk_error_message += "<li><a href='" + tutorial_link + "' target='_blank'>Customized " + user_info.solution_name + " feed by SociableKIT</a></li>";
            sk_error_message += "<li>Our system is syncing with your " + user_info.solution_name + " feed, please check back later.</li>";
            if (user_info.type == 5) {
                var username = getDsmSetting(_sk, 'username');
                sk_error_message += "<li>Make sure your instagram account <a target='_blank' href='https://www.instagram.com/" + username + "' target='_blank'><b>@" + username + "</b></a> is connected.</li>";
            }
            sk_error_message += "<li>It usually takes only a few minutes, but might take up to 24 hours. We appreciate your patience.</li>";
            sk_error_message += "<li>We will notify you via email once your " + user_info.solution_name + " feed is ready.</li>";
            sk_error_message += "<li>If you think there is a problem, <a target='_blank' href='https://go.crisp.chat/chat/embed/?website_id=2e3a484e-b418-4643-8dd2-2355d8eddc6b'>chat with support here</a>. We will solve it for you.</li>";
            sk_error_message += "</ul>";
            sk_error_message += "</div>";
            sk_error_message += "</div>";
            sk_error_message += "</div>";
        }
        return sk_error_message;
    }

    function generateSolutionMessage(_sk, embed_id) {
        var json_url = sk_api_url + "api/user_embed/info/" + embed_id;
        var sk_error_message = "";
        jQuery.getJSON(json_url, function(data) {
            if (data.type == 44 && data.encoded == true) {
                loadFeed(_sk);
            } else if (data.type == 67 && data.encoded == true) {
                loadEvents(_sk);
            } else {
                var sk_error_message = generateBlueMessage(_sk, data);
                _sk.find(".first_loading_animation").hide();
                _sk.html(sk_error_message);
            }
        }).fail(function(e) {
            console.log(e);
        });
    }

    function copyInput(copy_button, copy_input) {
        var copy_button_orig_html = copy_button.html();
        copy_input.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            if (msg == 'successful') {
                copy_button.html("<i class='fa fa-clipboard'></i> Copied!");
                setTimeout(function() {
                    copy_button.html(copy_button_orig_html);
                }, 3000);
            } else {
                alert('Copying text command was ' + msg + '.');
            }
        } catch (err) {
            alert('Oops, unable to copy.');
        }
    }

    function getDefaultLinkedInPageProfilePicture(profile_picture) {
        if (profile_picture && profile_picture.indexOf("data:image/gif") != -1) {
            profile_picture = "https://gmalcilk.sirv.com/iamge.JPG";
        }
        return profile_picture;
    }

    function detectedSKDashboard() {
        let parent_url = (window.location != window.parent.location) ? document.referrer : document.location.href;
        if (parent_url && (parent_url.indexOf("sociablekit.com") != -1 || parent_url.indexOf("local") != -1)) {
            return true;
        }
        return false;
    }

    function getSKDashboardPremiumTrialMessage() {
        var sk_error_message = "";
        sk_error_message += "<ul class='sk_error_message'>";
        sk_error_message += "<li>Your 7-days premium trial has ended.</li>";
        sk_error_message += "<li>Please purchase a <a href='https://www.sociablekit.com/app/users/subscription/subscription?action=subscribe_now'>SociableKIT subscription plan</a> ";
        sk_error_message += "to save your widget customizations, save time with automatic sync, enjoy priority support, and get a 50% discount on any annual plans. Donâ€™t miss out!</li>";
        sk_error_message += "<li>You may also choose to <a href='https://help.sociablekit.com/en-us/article/how-to-activate-the-free-plan-1l3o0nt/'>activate the free plan</a> if you don't need our premium features.</li>";
        sk_error_message += "</ul>";
        return sk_error_message;
    }

    function getSocialIcon(category) {
        var post_items = '';
        if (category.indexOf("Facebook") != -1) {
            post_items += "<i class='fab fa-facebook' aria-hidden='true'></i>";
        } else if (category.indexOf("Instagram") != -1) {
            post_items += "<i class='fab fa-instagram' aria-hidden='true'></i>";
        } else if (category.indexOf("Linkedin") != -1) {
            post_items += "<i class='fab fa-linkedin' aria-hidden='true'></i>";
        } else if (category.indexOf("Youtube") != -1) {
            post_items += "<i class='fab fa-youtube' aria-hidden='true'></i>";
        } else if (category.indexOf("Google") != -1) {
            post_items += "<i class='fab fa-google' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitter") != -1) {
            post_items += "<i class='fab fa-twitter' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitch") != -1) {
            post_items += "<i class='fab fa-twitch' aria-hidden='true'></i>";
        } else if (category.indexOf("Yelp") != -1) {
            post_items += "<i class='fab fa-yelp' aria-hidden='true'></i>";
        } else if (category.indexOf("Vimeo") != -1) {
            post_items += "<i class='fab fa-vimeo' aria-hidden='true'></i>";
        } else if (category.indexOf("Twitch") != -1) {
            post_items += "<i class='fab fa-twitch' aria-hidden='true'></i>";
        } else if (category.indexOf("Trust") != -1) {
            post_items += "<i class='fab fa-trustpilot' aria-hidden='true'></i>";
        } else if (category.indexOf("Spot") != -1) {
            post_items += "<i class='fab fa-spotify' aria-hidden='true'></i>";
        }
        return post_items;
    }

    function isFontAwesomeLoaded() {
        var span = document.createElement('span');
        span.className = 'fa';
        span.style.display = 'none';
        document.body.insertBefore(span, document.body.firstChild);
        var font = css(span, 'font-family');
        if (font.indexOf("fontawesome") == -1) {
            return false;
        }
        document.body.removeChild(span);
        return true;
    }

    function css(element, property) {
        let font = window.getComputedStyle(element, null).getPropertyValue(property);
        if (font) {
            font = font.toLowerCase();
            return font.replace(/' '/g, "");
        }
        return 'na';
    }

    function main() {
        function loadSettingsData(sk_facebook_feed, json_settings_url, json_feed_url) {
            fetch(json_feed_url, {
                method: 'get'
            }).then(function(response) {
                if (!response.ok) {
                    loadSettingsData(sk_facebook_feed, json_settings_url, json_settings_url)
                    return;
                }
                response.json().then(function(data) {
                    var settings_data = data;
                    original_data = data;
                    if (data.settings) {
                        settings_data = data.settings;
                        settings_data.type = 4;
                    }
                    loadCssFile(app_url + "facebook-page-posts/styles.css?nocache=" + (new Date().getTime()));
                    if (!settings_data.type) {
                        loadSettingsData(sk_facebook_feed, json_settings_url, json_settings_url)
                        return;
                    }
                    settings_data.type = 4;
                    var web_safe_fonts = ["Inherit", "Impact, Charcoal, sans-serif", "'Palatino Linotype', 'Book Antiqua', Palatino, serif", "Century Gothic, sans-serif", "'Lucida Sans Unicode', 'Lucida Grande', sans-serif", "Verdana, Geneva, sans-serif", "Copperplate, 'Copperplate Gothic Light', fantasy", "'Courier New', Courier, monospace", "Georgia, Serif"];
                    var is_font_included = web_safe_fonts.indexOf(settings_data.font_family);
                    if (is_font_included < 0) {
                        loadCssFile("https://fonts.googleapis.com/css?family=" + settings_data.font_family);
                    }
                    if (settings_data.show_feed == false) {
                        sk_facebook_feed.prepend(settings_data.message);
                        sk_facebook_feed.find('.loading-img').hide();
                        sk_facebook_feed.find('.first_loading_animation').hide();
                    } else {
                        var settings_html = "";
                        settings_data.post_height = settings_data.post_height && settings_data.post_height > 0 ? settings_data.post_height : 300;
                        settings_html += "<div style='display:none;' class='display-none sk-settings'>";
                        jQuery.each(settings_data, function(key, value) {
                            settings_html += "<div class='" + key + "'>" + value + "</div>";
                        });
                        settings_html += "</div>";
                        if (sk_facebook_feed.find('.sk-settings').length) {} else {
                            sk_facebook_feed.prepend(settings_html);
                        }
                        settings_html = "";
                        if (data.settings) {
                            loadFeed(sk_facebook_feed);
                        } else {
                            requestFeedData(sk_facebook_feed)
                        }
                    }
                });
            }).catch(function(err) {
                loadSettingsData(sk_facebook_feed, json_settings_url, json_settings_url);
            });
        }
        jQuery(document).ready(function($) {
            jQuery('.sk-ww-facebook-page-posts').each(function() {
                var sk_facebook_feed = jQuery(this);
                var embed_id = getDsmEmbedId(sk_facebook_feed);
                var new_sk_facebook_feed_width = jQuery(window).height() + 100;
                sk_facebook_feed.height(new_sk_facebook_feed_width);
                var json_settings_url = app_file_server_url.replace('feed', '') + "settings/" + embed_id + "/settings.json?nocache=" + (new Date()).getTime();
                var json_feed_url = app_file_server_url + embed_id + ".json?nocache=" + (new Date()).getTime();
                loadSettingsData(sk_facebook_feed, json_settings_url, json_feed_url);
            });
            jQuery(window).resize(function() {
                jQuery('.sk-ww-facebook-page-posts').each(function() {
                    var sk_facebook_feed = jQuery(this);
                    sk_facebook_feed.css({
                        'width': '100%'
                    });
                    var new_inner_width = sk_facebook_feed.innerWidth();
                    jQuery('.sk_facebook_feed_width').text(new_inner_width);
                    applyCustomUi(jQuery, sk_facebook_feed);
                });
            });
            jQuery(document).on('click', '.device_btn, #expand', function() {
                applyMasonry(jQuery('.sk-ww-facebook-page-posts'));
                applyCustomUi(jQuery, jQuery('.sk-ww-facebook-page-posts'));
            });
            jQuery(document).on('click', '.sk-ww-facebook-page-posts .sk_video_holder', function() {
                var clicked_element = jQuery(this);
                var sk_facebook_feed = clicked_element.closest('.sk-ww-facebook-page-posts');
                var content_src = clicked_element.closest(".grid-item-facebook-page-posts").find(".white-popup");
                if (getDsmSetting(sk_facebook_feed, 'show_post_on_new_tab') == 1) {
                    var post_id = clicked_element.closest('.grid-item-facebook-page-posts').attr('data-id');
                    window.open('https://www.facebook.com/' + post_id, '_blank');
                } else if (content_src.length > 0) {
                    showPopUp(jQuery, content_src, clicked_element, sk_facebook_feed);
                }
            });
            $(window).on('resize', function() {
                jQuery('.white-popup').css({
                    'max-width': '100%'
                })
                jQuery('.mfp-close').css({
                    'right': '0'
                })
            });
            jQuery(document).on('click', '.share-action', function() {
                var clicked_element = jQuery(this);
                var sk_facebook_feed = jQuery('.sk-ww-facebook-page-posts');
                showSharePopup(jQuery, clicked_element, sk_facebook_feed);
            });
            jQuery(document).on('click', '.sk-ww-facebook-page-posts .sk_click_to_pop_content', function() {
                var clicked_element = jQuery(this);
                var sk_facebook_feed = clicked_element.closest('.sk-ww-facebook-page-posts');
                var content_src = clicked_element.closest(".grid-item-facebook-page-posts").find(".sk-pop-facebook-page-posts-post");
                if (getDsmSetting(sk_facebook_feed, 'show_post_on_new_tab') == 1) {
                    var post_id = clicked_element.closest('.grid-item-facebook-page-posts').attr('data-id');
                    window.open('https://www.facebook.com/' + post_id, '_blank');
                } else if (content_src.length > 0) {
                    showPopUp(jQuery, content_src, clicked_element, sk_facebook_feed);
                }
            });
            jQuery(document).on('click', '.sk-ww-facebook-page-posts .sk-facebook-page-posts-load-more-posts', function() {
                if (jQuery(this).attr('disabled') == "disabled") {
                    return false;
                }
                jQuery(this).attr('disabled', 'disabled');
                var current_btn = jQuery(this);
                var current_btn_text = jQuery(this).html();
                var sk_facebook_feed = jQuery(this).closest('.sk-ww-facebook-page-posts');
                var embed_id = getDsmEmbedId(sk_facebook_feed);
                var next_page = sk_facebook_feed.find('.sk-facebook-page-posts-next-page').text();
                var json_url = app_url + "embed/facebook-page-posts/widget_feed_json.php?embed_id=" +
                    embed_id + "&next_page=" + next_page;
                jQuery(this).html("<i class='fa fa-spinner fa-pulse' aria-hidden='true'></i>");
                setTimeout(function() {
                    current_btn.hide();
                    setTimeout(function() {
                        var post_items = "";
                        var enable_button = false;
                        var old_last_key = last_key;
                        last_key = old_last_key + 6;
                        for (var i = old_last_key; i < last_key; i++) {
                            if (typeof data_storage[i] != 'undefined') {
                                post_items += getFeedItem(data_storage[i], sk_facebook_feed);
                            }
                        }
                        if (data_storage.length > last_key) {
                            enable_button = true;
                        }
                        sk_facebook_feed.find('.grid-facebook-page-posts').append(post_items);
                        current_btn.html(current_btn_text);
                        if (enable_button) {
                            current_btn.show();
                        }
                        showSharedPosts(sk_facebook_feed, true);
                        current_btn.removeAttr('disabled');
                        applyReadmore(sk_facebook_feed, data_storage);
                        applyCustomUi(jQuery, sk_facebook_feed);
                        applyMasonry();
                        setTimeout(function() {
                            FB.XFBML.parse();
                        }, 300);
                    }, 300);
                }, 500);
            });
            jQuery(document).on('submit', '.sk-ww-facebook-page-posts .sk_ww_search_facebook_videos_form', function(e) {
                e.preventDefault();
                var sk_facebook_feed = jQuery(this).closest('.sk-ww-facebook-page-posts');
                sk_facebook_feed.find('.loading-img').show();
                sk_facebook_feed.find('.sk-solution-holder').hide();
                var sk_facebook_feed = jQuery(this).closest('.sk-ww-facebook-page-posts');
                loadFeed(sk_facebook_feed);
                return false;
            });
            jQuery(document).on('input', 'input.sk_ww_search_facebook_feed_keyword', function() {
                var value = jQuery(this).val();
                if (value) {
                    jQuery(this).closest('div').find('.sk_ww_search_icon').removeClass('fa-search');
                    jQuery(this).closest('div').find('.sk_ww_search_icon').addClass('fa-times');
                } else {
                    jQuery(this).closest('div').find('.sk_ww_search_icon').addClass('fa-search');
                    jQuery(this).closest('div').find('.sk_ww_search_icon').removeClass('fa-times');
                }
            });
            jQuery(document).on('click touchstart', 'i.sk_ww_search_icon.fa-times', function() {
                jQuery(this).closest('form').find('.sk_ww_search_facebook_feed_keyword').val('');
                var sk_facebook_feed = jQuery(this).closest('.sk-ww-facebook-page-posts');
                loadFeed(sk_facebook_feed);
                return false;
            });
            jQuery('.mfp-container .white-popup-sk-fb-feed-video').bind('resize', function() {
                fixPopupHeight();
            });
            jQuery(document).on('click', '.sk-tooltip', function() {
                var id = jQuery(this).attr('data-id');
                var tooltip = jQuery(this).parent().find('.sk-tooltip-' + id);
                if (tooltip.css('visibility') == 'hidden') {
                    jQuery('.sk-tooltiptext').css('visibility', 'hidden');
                    tooltip.css({
                        'visibility': 'visible'
                    });
                } else {
                    jQuery('.sk-tooltiptext').css('visibility', 'hidden');
                }
            });
            jQuery(document).on('click', '.swiper-button-next-single, .swiper-button-prev-single', function() {
                if ($(document).width() > 450) {
                    var images = jQuery('.mfp-content').find('.white-popup').find('img').not(".sk_post_img");
                    var container_height = 0;
                    if (images.length > 0)
                        container_height = images[0].height;
                    images.css('height', container_height + 'px');
                    images.css('float', "left !important");
                    images.css('margin', "0px");
                    setTimeout(function() {
                        var media_content = jQuery('.mfp-content').find('.white-popup').find('.sk_media_content');
                        if (media_content.length > 0) {
                            jQuery('.mfp-content').find('.swiper-container').css('height', media_content[0].offsetHeight + 'px');
                        }
                    }, 50);
                    var container_width = 0;
                    var new_width;
                    if (jQuery(".mfp-content").find(".white-popup").find(".swiper-slide").length > 0) {
                        new_width = jQuery(".mfp-content").find(".white-popup").find(".swiper-slide")[0].offsetWidth;
                    }
                    var images = jQuery(".mfp-content").find(".white-popup").find(".swiper-slide").find("img");
                    for (var imgs_ctr = 0; imgs_ctr < images.length; imgs_ctr++) {
                        if (images[imgs_ctr].naturalWidth > container_width) {
                            container_width = images[imgs_ctr].naturalWidth;
                        }
                        jQuery(jQuery(".mfp-content").find(".white-popup").find(".swiper-slide")[imgs_ctr]).css({
                            "transform": "translate3d(" + (imgs_ctr * new_width) * -1 + "px, 0px, 0px)"
                        });
                    }
                } else {
                    setTimeout(function() {
                        var container_width = 0;
                        var new_width;
                        if (jQuery(".mfp-content").find(".white-popup").find(".swiper-slide").length > 0) {
                            new_width = jQuery(".mfp-content").find(".white-popup").find(".swiper-slide")[0].offsetWidth;
                        }
                        var images = jQuery(".mfp-content").find(".white-popup").find(".swiper-slide").find("img");
                        for (var imgs_ctr = 0; imgs_ctr < images.length; imgs_ctr++) {
                            if (images[imgs_ctr].naturalWidth > container_width) {
                                container_width = images[imgs_ctr].naturalWidth;
                            }
                            jQuery(jQuery(".mfp-content").find(".white-popup").find(".swiper-slide")[imgs_ctr]).css({
                                "transform": "translate3d(" + (imgs_ctr * new_width) * -1 + "px, 0px, 0px)"
                            });
                        }
                    }, 300);
                    setTimeout(function() {
                        var media_content = jQuery('.mfp-content').find('.white-popup').find('.sk_media_content').find('.swiper-slide-active').find('img');
                        if (media_content.length > 0) {
                            jQuery('.mfp-content').find('.swiper-container, .sk_media_content').css('height', media_content[0].offsetHeight + 'px');
                        }
                    }, 350);
                }
            });
        });
    }
}(window, document));