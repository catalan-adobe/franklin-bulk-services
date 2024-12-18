import { JSDOM } from 'jsdom';
import { fromDom } from 'hast-util-from-dom';
import { fromHtml } from 'hast-util-from-html';
import { rehype } from 'rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeRemoveComments from 'rehype-remove-comments';
import rehypeSortAttributes from 'rehype-sort-attributes';
import rehypeSortAttributeValues from 'rehype-sort-attribute-values';
import rehypeFormat from 'rehype-format';
import rehypePresetMinify from 'rehype-preset-minify';
import rehypeTruncate from "rehype-truncate";
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';
import rehypeStringify from 'rehype-stringify'
import rehypeRewrite from 'rehype-rewrite';
// import objectHash from 'object-hash';

export async function main(context, req) {
    const htmlString = `
<section class="risk-understand">
        <!-- Here is a comment -->
        <div class="common-menu">
          <script>
            console.log('Hello, world!');
          </script>
          <div id="section-1">
            <span class="common-menu-image">
              <img src="\images\person-in-a-circle-icon.png" alt="Click to see how you may help protect yourself" title="person" class="help-icon">
            </span>
            <span class="common-menu-text green-dual-arrow color-dual-arrow">
              <a href="/help-protect-yourself">Help protect <span class="last">yourself</span></a>
            </span>
          </div>
          <hr>
          <div id="section-2">
            <div class="common-menu-image">
              <style>
                .common-menu-image img {
                    width: 100px;
                    height: 100px;
                }
              </style>
              <img src="\images\whats-kp\green-icons\bandage-icon.png" alt="See how a vaccine option may help prevent you from contracting pneumococcal pneumonia.">
            </div>
            <div class="common-menu-text purple-dual-arrow color-dual-arrow">
              <a class="dialog__open" target="_blank" data-mfp-src="#dialog__external" href="https://adult.prevnar20.com/">Find out about a vaccine <span class="last">option</span></a>
            </div>
          </div>
          <hr>
          <div id="section-3">
            <div class="common-menu-image">
              <img src="\images\chat-icon.png" alt="See how you can talk to your doctor about pneumococcal pneumonia">
            </div>
            <div class="common-menu-text blue-dual-arrow color-dual-arrow">
              <a href="/take-action" class="talk-to-dr">Talk to your doctor or <span class="last">pharmacist</span></a>
            </div>
          </div>
        </div>
        <div>
            <ol class="this-is-my-list">
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
            </ol>
        </div>
</section>
`;

    console.log(defaultSchema);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // const element = JSDOM.fragment(htmlString);
    // // const element = dom.window.document.querySelector('#main'); // This is our DOM Element input

    // console.log(element);

    // 2. Convert the selected element to HAST
    const hastTree = fromHtml(htmlString, {fragment: true})

    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // // `hastTree` is now a HAST tree (an object), not a string.
    // console.log('hastTree');
    // console.log(hastTree);

    // await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Normalize/Preprocess the HAST tree
    //    We: 
    //    - Sanitize to remove unwanted elements/attributes
    //    - Remove comments
    //    - Sort attributes to ensure consistent ordering
    //    - Format the tree so that whitespace and structure are consistent

    const schema = {
        ...defaultSchema,
        attributes: {
            // ...defaultSchema.attributes,
            // The `language-*` regex is allowed by default.
            // 'section': ['class', 'className'],
            '*': [...defaultSchema.attributes['*'], 'class', 'className'],
        },
        tagNames: [...defaultSchema.tagNames.filter((t) => !['li', 'img', 'p', 'span', 'a', 'hr'].includes(t))],
    };

    console.log(JSON.stringify(schema, null, 2));
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const processed = await unified()
    .use(rehypeParse, { fragment: true, verbose: true })
    // .data('settings', { fragment: true })
    // .use(rehypeTruncate, { maxChars: 10 })
    .use(rehypeSanitize, schema)
    .use(rehypeRewrite, {
        rewrite: (node, index, parent) => {
            if(node.type == 'text') {
                node.value = ''
            }
        }
    })
    .use(rehypeStringify)
    .use(rehypePresetMinify)
    // // .use(rehypeRemoveComments)
    .use(rehypeFormat)
    .use(rehypeSortAttributes)
    .use(rehypeSortAttributeValues)
    .process(htmlString);
    // .toString();
    
    console.log(String(processed));
    
    // const processed = processor.processSync(htmlString).result;
    
    // `processed` is now a normalized HAST tree ready for hashing.
    // Note: `processed` is a HAST tree (an object), not a string.
    // If you need to see the intermediate result, you can log it:
    // console.log('Normalized HAST:', processed);
    
    // // 4. Compute a stable hash
    // const fingerprint = objectHash(processed);
    // console.log('Fingerprint:', fingerprint);
};
