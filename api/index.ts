#!/usr/bin/env DENO_DIR=/tmp PUPPETEER_PRODUCT=chrome deno run --unstable https://deno.land/x/puppeteer@16.2.0/install.ts

import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ServerRequest } from "https://deno.land/std@0.58.0/http/server.ts";




async function scrape(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
        //headless: false
    });
    let page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
    await page.setRequestInterception(true);
        page.on('request', (req) => {
            if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'script' || req.resourceType() == 'media'){
                req.abort();
            }
            else {
                req.continue();
            }
        });
    await page.goto(url);

    await page.waitForSelector('some-selector');
    let text = await page.$eval('some-selector', el => el.value);
    let json = JSON.parse(text);
    
    await page.close();
    await browser.close();
    return await json;
}


export default async (req: ServerRequest) => {
    req.respond({ body: JSON.stringify(await scrape("some-url")) });
  }
