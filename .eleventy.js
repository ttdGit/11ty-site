const { DateTime } = require('luxon')
const navigationPlugin = require('@11ty/eleventy-navigation')
const rssPlugin = require('@11ty/eleventy-plugin-rss')
const pluginImages = require('./eleventy.config.images.js');
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
//const pluginBundle = require("@11ty/eleventy-plugin-bundle");

module.exports = (config) => {
  config.addPlugin(navigationPlugin);
  config.addPlugin(rssPlugin);
  config.addPlugin(pluginImages);
  config.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
  //config.addPlugin(pluginBundle);
  config.addPassthroughCopy('css');
  config.addPassthroughCopy('static');
  config.addPassthroughCopy('posts/post-image');
  // Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	config.addPassthroughCopy({
		"./public/": "/",
		//"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
	});

  	// Watch content images for the image pipeline.
	config.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

  config.setDataDeepMerge(true);

  config.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  config.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL, yyyy");
  });

  config.addCollection("tagList", collection => {
    const tagsObject = {}
    collection.getAll().forEach(item => {
      if (!item.data.tags) return;
      item.data.tags
        .filter(tag => !['post', 'all'].includes(tag))
        .forEach(tag => {
          if(typeof tagsObject[tag] === 'undefined') {
            tagsObject[tag] = 1
          } else {
            tagsObject[tag] += 1
          }
        });
    });

    const tagList = []
    Object.keys(tagsObject).forEach(tag => {
      tagList.push({ tagName: tag, tagCount: tagsObject[tag] })
    })
    return tagList.sort((a, b) => b.tagCount - a.tagCount)

  });

}