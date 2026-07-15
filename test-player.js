const vimeoRegex = /(?:<iframe[^>]*src=")?(?:https?:)?(?:\/\/)?(?:www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
console.log(vimeoRegex.test("https://vimeo.com/1199309399?share=copy&fl=sv&fe=ci"));
