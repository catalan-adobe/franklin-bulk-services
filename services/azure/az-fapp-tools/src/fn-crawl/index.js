import * as frkBulk from 'franklin-bulk-shared';

const DEFAULT_CRAWL_OPTIONS = {
    timeout: 10000,
    inclusionPatterns: [],
    exclusionPatterns: [],
    limit: -1,
    sameDomain: true,
    keepHash: false,
};

export async function main(context, req) {
    
    try {
        if (!req.body?.url) {
            throw new Error("Missing 'url' in the request body");
        }
        
        context.log("Request: ", req);
        
        const options = {
            ...DEFAULT_CRAWL_OPTIONS,
            ...req.body?.options,
        };
        
        // logger
        options.logger = {
            debug: context.log.verbose,
            info: context.log.info,
            warn: context.log.warn,
            error: context.log.error,
            silly: context.log.verbose,
        };
        
        const urls = [];

        options.urlStreamFn = async (newCrawl) => {
            if (newCrawl.length > 0) {
                urls.push(...newCrawl.map((u) => u.url));
            }
        };

        if (req.method === 'GET') {
            context.res = {
                body: USAGE_MESSAGE,
                headers: {
                    "content-type": "text/plain",
                }
            };
            context.done();
            return new Promise(() => {}).resolve();
        }
        
        const result = await frkBulk.Web.crawl(req.body.url, options);
        
        result.urls.all = urls;

        context.log(`All done. ✨`);
        
        context.res = {
            status: 200,
            body: result,
            headers: {
                "content-type": "application/json"
            }
        };      
    } catch(e) {
        context.log.error(e);
        context.res = {
            headers: {
                'x-error': e.cause || e.message,
            },
            body: e.cause || e.message,
        };
    }
};

const USAGE_MESSAGE = `
Crawl a domain
===

It will only look at robots.txt and sitemaps, no http crawling on the webpages of the domain


## Method:

POST


## JSON Input Body:

    {
        url:                    "<url>",                        // required - The origin URL to start the crawl
        options: {
            timeout:            <ms>,                           // timeout (in ms.) for the HTTP requests to the domain
                                                                // default: 10000
            inclusionPatterns:  ["pattern1", "pattern2", ...],  // array of inclusion patterns
                                                                // default: [] (none)
            exclusionPatterns:  ["pattern1", "pattern2", ...],  // array of exclusion patterns
                                                                // default: [] (none)
            limit:              <max_urls>                      // maximum number of URLs to collect
                                                                // default: -1 (no limit)
            sameDomain:         true|false,                     // only crawl URLs from the same domain
                                                                // default: true
        }
    }


## Examples

### Crawl a domain with filters and limiting to first 100 URLs

    {
        url:                    "https://www.adobe.com",
        options: {
            timeout:            10000,
            inclusionPatterns:  ["*/cc/*", "*/products/*"],
            exclusionPatterns:  ["*/blog/*"],
            limit:              100
        }
    }

### Crawl only a specific sitemap

    {
        url:            "https://www.my-domain.com/my-custom-sitemap.xml",
        options: {
            timeout:    30000,
        }
    }

### Response

    {
        "originURL": "https://www.adobe.com",
        "crawlOptions": {
            "timeout": 10000,
            "inclusionPatterns": ["*/creativecloud/business/*"],
            "exclusionPatterns": [],
            "limit": 5,
            "sameDomain": true,
        },
        "errors": [],
        "urls": [
            {
                "url": "https://www.adobe.com/creativecloud/business/teams/for-admins.html",
                "origin": "https://www.adobe.com/creativecloud/business.sitemap.xml",
                "status": "valid",
                "level1": "creativecloud",
                "level2": "business",
                "level3": "teams",
                "filename": "for-admins.html",
                "search": "",
                "message": ""
            },
            {
                "url": "https://www.adobe.com/creativecloud/business/proedition.html",
                "origin": "https://www.adobe.com/creativecloud/business.sitemap.xml",
                "status": "valid",
                "level1": "creativecloud",
                "level2": "business",
                "level3": "",
                "filename": "proedition.html",
                "search": "",
                "message": ""
            },
            {
                "url": "https://www.adobe.com/creativecloud/business/teams/photoshop.html",
                "origin": "https://www.adobe.com/creativecloud/business.sitemap.xml",
                "status": "valid",
                "level1": "creativecloud",
                "level2": "business",
                "level3": "teams",
                "filename": "photoshop.html",
                "search": "",
                "message": ""
            },
            {
                "url": "https://www.adobe.com/creativecloud/business/acrobat-pro.html",
                "origin": "https://www.adobe.com/creativecloud/business.sitemap.xml",
                "status": "valid",
                "level1": "creativecloud",
                "level2": "business",
                "level3": "",
                "filename": "acrobat-pro.html",
                "search": "",
                "message": ""
            },
            {
                "url": "https://www.adobe.com/creativecloud/business/teams/plans.html",
                "origin": "https://www.adobe.com/creativecloud/business.sitemap.xml",
                "status": "valid",
                "level1": "creativecloud",
                "level2": "business",
                "level3": "teams",
                "filename": "plans.html",
                "search": "",
                "message": ""
            }
        ],
        "invalidURLs": [],
        "robotstxt": "# The use of robots or other automated means to access the Adobe site\r\n# without the express permission of Adobe is strictly prohibited.\r\n# Notwithstanding the [...] agent: Googlebot\r\nAllow: /?promoid=RTQCN3LX\r\nDisallow: /*promoid=\r\nDisallow: /*trackingid=\r\n\r\n# XML sitemaps\r\nSitemap: https://www.adobe.com/home-sitemap.xml\r\nSitemap: https://www.adobe.com/creativecloud/sitemap-index.xml\r\nSitemap: https://www.adobe.com/cc-creativecloud.index.xml\r\nSitemap: https://www.adobe.com/cc-product.index.xml\r\nSitemap: https://www.adobe.com/cc-business.index.xml\r\nSitemap: https://www.adobe.com/dc.index.xml\r\nSitemap: https://www.adobe.com/dc.milo.sitemap-index.xml\r\nSitemap: https://www.adobe.com/ppbu-product-sitemap.xml\r\nSitemap: https://www.adobe.com/acom-temp.xml\r\nSitemap: https://www.adobe.com/firefly-sitemap-temp.xml\r\n\r\n# CC Express \r\nSitemap: https://www.adobe.com/express/sitemap-index.xml\r\n\r\n#Naver\r\nSitemap: https://www.adobe.com/naver.index.xml",
        "sitemaps": [
            "https://www.adobe.com/home-sitemap.xml",
            "https://www.adobe.com/creativecloud/sitemap-index.xml",
            "https://www.adobe.com/cc-creativecloud.index.xml",
            "https://www.adobe.com/cc-product.index.xml",
            "https://www.adobe.com/cc-business.index.xml",
            [...]
        ]
    }
`;