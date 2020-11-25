const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')
const wwwUrl = 'https://wap.7kzw.com';
const dirUrl = 'https://wap.7kzw.com/15/15867/all.html';  // 目录地址
let start = 0;
let subChapterIndex = 1;  // 子小节索引
let subChapterMaxIndex = 3; // 子小节最大索引
let chapters = [];  // 全部章节标题
let chaptersUrl = [];  // 全部章节地址

axios.get(dirUrl)
    .then((html) => {
        // 利用 cheerio 来分析网页内容
        const $ = cheerio.load(html.data)
        let links = $('#chapterlist').find("a[href^='/15']")  //$("a[target!='_blank']")
        $(links).each((index, ele) => {
            chapters.push($(ele).text())
            chaptersUrl.push(wwwUrl + $(ele).attr('href'))
        })

        console.log('html >>>>', chapters)
        // console.log('html >>>>', chaptersUrl )
        loadPage(start)
    })

function loadPage(index) {
    let url = '';
    let cur = chaptersUrl[index];

    console.log('加载第', index + '-' + subChapterIndex, chapters[index])
    if (subChapterIndex <= subChapterMaxIndex) {
        url = subChapterIndex === 1 ? cur : cur.replace(/(.html)/, '_' + subChapterIndex + '$1')
    }
    console.log('request url:', url)
    axios.get(url)
        .then((html) => {
            const $ = cheerio.load(html.data)
            let content = $('#chaptercontent').text()

            fs.appendFile('./data.txt', content, function (err) {
                if (err) {
                    throw new Error('写文件失败' + err)
                }
                console.log(chapters[index] + '成功写入文件')
                
                if (subChapterIndex < subChapterMaxIndex) {
                    // 加载本章节子小节
                    subChapterIndex++;
                    loadPage(start)
                } else {
                    // 加载下章节
                    start++;
                    subChapterIndex = 1;
                    if (start < chaptersUrl.length) {
                        loadPage(start)
                    }
                }

            })
        })
}