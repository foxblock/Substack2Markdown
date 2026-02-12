// ==UserScript==
// @name         Computer Enhance Video Downloader
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Download video from Computer Enhance substack course (right click > save target as...)
// @author       You
// @match        https://www.computerenhance.com/p/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=computerenhance.com
// @grant        GM_download
// ==/UserScript==

window.addEventListener('load', function() {
    'use strict';

    // Function to extract UUID and construct URL
    // returns empty string, if no video could be found
    function extractVideoLink() {
        const videoTag = document.querySelector('video[controlslist="nodownload"]');
        if (!videoTag) {
            return "";
        }
        const posterUrl = videoTag.getAttribute('poster');
        const uuidMatch = posterUrl.match(/post\/\d+\/([a-f0-9-]+)\//);
        if (!uuidMatch || !uuidMatch[1]) {
            return "";
        }
        const uuid = uuidMatch[1];
        return `https://www.computerenhance.com/api/v1/video/upload/${uuid}/src`;
    }

    function extractTitle() {
        let element = document.querySelector('meta[property="og:title"]');
        if (!element) {
            // Use title element as fallback, could also use h2
            element = document.querySelector('title');
            // element = document.querySelector('h2');
            return element.innerText;
        }
        return element.getAttribute('content');
    }

    function sanitizeFilename(input) {
        // Remove invalid characters
        const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
        // optinally could define replacement character
        const sanitized = input.replace(invalidChars, '');
        // Remove leading/trailing spaces and dots (for Windows)
        return sanitized.trim().replace(/^\.+|\.+$/g, '');
    }

    function createDownloadLink(parent, url) {
        const link = document.createElement('a');
        link.href = url;
        if (url.length > 0) {
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

    let button = undefined;
    let downloadRequest = undefined;

    function onProgress(progress) {
        const percent = progress.loaded / progress.total * 100;
        const megabytes = progress.total / 1000000;
        // not perfect, but helps against race condition between this and abortDownload to update the text
        if (downloadRequest) {
            button.textContent = `Downloading... ${percent.toFixed(0)}% of ${megabytes.toFixed(2)} MB`;
        }
    }

    function downloadVideo(btn, url, title) {
        const prefix = document.querySelector("#prefixInput").value;
        const filename = prefix + title + ".mp4";
        downloadRequest = GM_download({
            url: url,
            name: filename,
            // saveAs: true,
            onprogress: onProgress
        });
        if (downloadRequest) {
            btn.textContent = 'Downloading...';
            btn.onclick = () => abortDownload(btn, url, title);
        }
    }

    function abortDownload(btn, url, title) {
        downloadRequest.abort();
        downloadRequest = undefined;
        btn.textContent = 'Download Video';
        btn.onclick = () => downloadVideo(btn, url, title);
    }

    function createDownloadButton(parent, url, title) {
        const button = document.createElement('button');
        if (url.length > 0) {
            button.textContent = 'Download Video';
            button.onclick = () => downloadVideo(button, url, title);
            // button.addEventListener('click', () => downloadVideo(button, url));
        } else {
            button.textContent = 'No video found';
        }
        button.style.position = 'absolute';
        button.style.top = '20px';
        button.style.left = '100px';
        button.style.zIndex = 1000;
        parent.appendChild(button);

        const label = document.createElement('label');
        label.setAttribute('for', 'prefixInput');
        label.textContent = 'Prefix: ';
        label.style.position = 'absolute';
        label.style.top = '40px';
        label.style.left = '100px';
        label.style.zIndex = 1000;
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('id', 'prefixInput');
        input.style.position = 'absolute';
        input.style.top = '40px';
        input.style.left = '170px';
        input.style.zIndex = 1000;
        input.style.width = '50px';

        parent.appendChild(label);
        parent.appendChild(input);

        return button;
    }

    // Append the link inside the video player
    const navBar = document.querySelector('.main-menu');
    if (!navBar) {
        navBar = document.body;
    }
    const url = extractVideoLink();
    const title = extractTitle();
    const titleSan = sanitizeFilename(title);
    button = createDownloadButton(navBar, url, titleSan);
}, false);