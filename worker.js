// Cloudflare Worker a DPlayer hls.js lejátszóval
// By: Claude @ Anthropic & ChatGPT @ OpenAI

export default {
  async fetch(request) {
    // 1. 从请求URL中获取视频链接参数
    const requestUrl = new URL(request.url);
    const videoUrl = requestUrl.searchParams.get('url');

    // 2. 如果没有提供 'url' 参数，返回一个引导页面
    if (!videoUrl) {
      return new Response(getHomepage(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // 3. 如果提供了 'url' 参数，返回嵌入了播放器的页面
    // 我们需要对 videoUrl 进行解码，因为URL参数可能是编码过的
    const decodedVideoUrl = decodeURIComponent(videoUrl);
    const playerPage = getPlayerPage(decodedVideoUrl);
    
    return new Response(playerPage, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};

/**
 * 生成播放器页面的HTML
 * @param {string} videoUrl - m3u8 视频链接
 */
function getPlayerPage(videoUrl) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>视频播放器</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      background-color: #000;
    }
    #dplayer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  </style>
  <!-- 引入 DPlayer 的 CSS 和 JS 文件 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dplayer@latest/dist/DPlayer.min.css" />
</head>
<body>
  <div id="dplayer"></div>

  <!-- 引入 HLS.js 用于播放 m3u8 -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <!-- 引入 DPlayer.js -->
  <script src="https://cdn.jsdelivr.net/npm/dplayer@latest/dist/DPlayer.min.js"></script>

  <script>
    const dp = new DPlayer({
      container: document.getElementById('dplayer'),
      autoplay: true, // 自动播放
      video: {
        url: '${videoUrl.replace(/'/g, "\\'")}', // 使用模板字符串并转义单引号
        type: 'hls', // 明确指定视频类型为 hls
      },
    });
  </script>
</body>
</html>
`;
}

/**
 * 生成引导页面的HTML
 */
function getHomepage() {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>M3U8 播放器</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
        .container { text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        p { color: #666; }
        code { background: #eee; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>M3U8 视频播放器</h1>
        <p>请在URL后面添加 <code>?url=</code> 参数来指定要播放的 M3U8 链接。</p>
        <p><strong>示例:</strong></p>
        <code>https://your-worker-name.your-subdomain.workers.dev/?url=https://.../video.m3u8</code>
    </div>
</body>
</html>
  `;
}
