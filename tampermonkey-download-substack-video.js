// ==UserScript==
// @name         Computer Enhance Video Downloader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Download video from Computer Enhance substack course (right click > save target as...)
// @author       You
// @match        https://www.computerenhance.com/p/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=computerenhance.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract UUID and construct URL
    function extractAndCreateLink(parent) {
        const videoTag = document.querySelector('video[controlslist="nodownload"]');
        let videoUrl = ""
        if (videoTag) {
            const posterUrl = videoTag.getAttribute('poster');
            const uuidMatch = posterUrl.match(/post\/\d+\/([a-f0-9-]+)\//);
            if (uuidMatch && uuidMatch[1]) {
                const uuid = uuidMatch[1];
                videoUrl = `https://www.computerenhance.com/api/v1/video/upload/${uuid}/src`;
            }
        }
        const link = document.createElement('a');
        link.href = videoUrl;
        if (videoUrl.length > 0) {
            link.innerText = 'Download Video';
        } else {
            link.innerText = 'No video found';
        }
        link.style.position = 'absolute';
        link.style.top = '20px';
        link.style.left = '100px';
        link.style.zIndex = 1000;
        parent.appendChild(link);
    }

    // Append the link inside the video player
    const navBar = document.querySelector('.main-menu');
    if (!navBar) {
        navBar = document.body;
    }
    extractAndCreateLink(navBar);
})();