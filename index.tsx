import { Context, Schema, h } from 'koishi'
import { } from 'koishi-plugin-puppeteer'
const axios = require('axios');
const path = require('path');


export const inject = ['puppeteer']

export const name = 'maxim'

export const usage = `
<style>
.card {
  width: 60%;
  height: 120px;
  margin: auto;
  background: url('https://gitee.com/logier/logier/raw/master/img/ina-min.webp') no-repeat center center / cover;
  border-radius: 15px;
  box-shadow: 0px 0px 10px rgba(0,0,0,0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  text-decoration: none;
}
.card:hover {
  box-shadow: 0px 0px 20px rgba(0,0,0,0.5);
}
.card img {
  width: 220px;
  height: 100px;
  object-fit: contain;
}
svg {
  width: 60%;
  height: 100px;
}
svg text {
  text-transform: uppercase;
  animation: stroke 5s infinite alternate;
  letter-spacing: 10px;
  font-size: 100px;
}
@keyframes stroke {
  0% {
    fill: rgba(72, 138, 20, 0);
    stroke: rgba(54, 95, 160, 1);
    stroke-dashoffset: 25%;
    stroke-dasharray: 0 50%;
    stroke-width: 0.8;
  }
  50% {
    fill: rgba(72, 138, 20, 0);
    stroke: rgba(54, 95, 160, 1);
    stroke-width: 1.2;
  }
  70% {
    fill: rgba(72, 138, 20, 0);
    stroke: rgba(54, 95, 160, 1);
    stroke-width: 1.5;
  }
  90%,
  100% {
    fill: rgba(72, 138, 204, 1);
    stroke: rgba(54, 95, 160, 0);
    stroke-dashoffset: -25%;
    stroke-dasharray: 50% 0;
    stroke-width: 0;
  }
}
</style>
<a class="card" href="https://www.logier.icu" target="_blank">
  <img src="https://gitee.com/logier/logier/raw/master/img/logo.webp" alt="Your Image">
  <svg viewBox="0 0 800 200">
    <rect x="230" y="20%" width="440" height="120" fill="#f0f0f0" rx="15" ry="15" />
    <text x="250" y="70%"> logier </text>
  </svg>
</a>
`

export interface Config {
  图片渲染: boolean;
  等待提示: boolean;
  图片api: string[];
  保底图片: string;
  文案选择: string[];
}


export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    文案选择: Schema.array(Schema.union(['一言', '人间', '十宗罪', '发病']))
      .default(['一言', '人间', '十宗罪', '发病'])
      .role('checkbox')
      .description('请勾选你希望加载的文案'),
  }).description('启用设置'),
  Schema.object({
    等待提示: Schema.boolean().default(true).description('是否开启发送消息等待提示'),
    图片渲染: Schema.boolean().default(true).description('是否启用图片渲染文案'),
    保底图片: Schema.string().default('ina-min.webp').description('获取图片失败后将使用此图片发送'),
    图片api: Schema.array(Schema.string()).default(['https://t.mwm.moe/pc', 'https://t.mwm.moe/mp']).description('渲染所用的图片地址'),
  }).description('消息设置'),
]);



export async function apply(ctx: Context, config: Config) {

  let spaces = ' '.repeat(50); // Adjust the number of spaces as needed


  if (config.文案选择.includes('一言')) {
    ctx.command('一言', '随机发送一言，可发送不同类别的一言')
      .usage('参数包含十一种，一言+参数即可发送')
      .example('一言 网易云 “发送网易云类一言”')
      .option('动画', '动画类一言')
      .option('漫画', '漫画类一言')
      .option('游戏', '游戏类一言')
      .option('文学', '文学类一言')
      .option('原创', '原创类一言')
      .option('来自网络', '来自网络类一言')
      .option('其他', '其他类一言')
      .option('影视', '影视类一言')
      .option('网易云', '网易云类一言')
      .option('哲学', '哲学类一言')
      .option('抖机灵', '抖机灵类一言')
      .action(async ({ session }, ...args) => {
        let 链接 = 'https://v1.hitokoto.cn/';

        const categories = {
          '': ' ',
          '动画': '?c=a',
          '漫画': '?c=b',
          '游戏': '?c=c',
          '文学': '?c=d',
          '原创': '?c=e',
          '来自网络': '?c=f',
          '其他': '?c=g',
          '影视': '?c=h',
          '诗词': '?c=i',
          '网易云': '?c=j',
          '哲学': '?c=k',
          '抖机灵': '?c=l',
        };
        let 分类 = categories[args[0] || '']; if (!分类) {
          return '请输入正确的参数。';
        }


        let response = await ctx.http.get(String(链接) + String(分类), { responseType: "text" }); 
        let content, source;
        // 假设你已经获取到了source的值
        
        

        if (response) {
          let data = JSON.parse(response); content = data.hitokoto; source = "——" + data.from; 
        }

        if (config.图片渲染) {
          if (config.等待提示) {
          await session.send('正在为您获取“一言”。。。请稍后'); let imageUrl = await getImageUrl(config); await session.send(await renderContent(content, source, imageUrl, ctx));
        }
        } else {
          await session.send(('『' + String(content) + '』\n' + String(spaces) +  String(source)))
        }
      });
  }



  if (config.文案选择.includes('人间')) {
    ctx.command('人间', '随机发送散文集《我在人间凑数的日子》').action(async ({ session }, ...args) => {


      let response = await ctx.http.get('https://v2.api-m.com/api/renjian', { responseType: "text" });
      let jsonResponse = JSON.parse(response);
      let quote = jsonResponse.data;
      let parts = quote.split("——选自散文集");
      let content = parts[0]; // 不使用trim()
      let source = "——选自散文集《我在人间凑数的日子》"; // 不使用trim()

        if (config.图片渲染) {
          if (config.等待提示) {
          await session.send('正在为您获取《人间》。。。请稍后'); let imageUrl = await getImageUrl(config); await session.send(await renderContent(content, source, imageUrl, ctx));
        }
        } else {
          await session.send(('『' + String(content) + '』\n' + String(spaces) + String(source)))
        }
      }
    )};
  

  if (config.文案选择.includes('十宗罪')) {
    ctx.command('十宗罪', '随机发送《十宗罪》').action(async ({ session }, ...args) => {


      let response = await ctx.http.get('https://api.8uid.cn/api/szz.php?type=text', { responseType: "text" });

      let content = response.split("——")[0]; let source = "——《十宗罪》"; // 不使用trim()


      if (config.图片渲染) {
        if (config.等待提示) {
        await session.send('正在为您获取《十宗罪》。。。请稍后'); let imageUrl = await getImageUrl(config); await session.send(await renderContent(content, source, imageUrl, ctx));
      } 
      } else {
        await session.send(('『' + String(content) + '』\n' + String(spaces) + String(source)))
      }

    });
  }

  if (config.文案选择.includes('发病')) {
    ctx.command('发病', '发送发病语录').action(async ({ session }, ...args) => {


      let response = await ctx.http.get(`https://api.lolimi.cn/API/fabing/fb.php?name=${session.username}`, { responseType: "text" });

      let jsonResponse = JSON.parse(response); let content = jsonResponse.data; let source = "——《发病语录》"; // 不使用trim()


      if (config.图片渲染) {
        if (config.等待提示) {
        await session.send('正在为您获取《发病》。。。请稍后'); let imageUrl = await getImageUrl(config); await session.send(await renderContent(content, source, imageUrl, ctx));
        }
      } else {
        await session.send(('『' + String(content) + '』\n' + String(spaces) + String(source)))
      }

    });
  }

  if (config.文案选择.includes('点阵字')) {
    ctx.command('点阵字', '发送点阵字').action(async ({ session }, ...args) => {


      let response = await ctx.http.get(`https://api.lolimi.cn/API/dzz/?msg=${session.username}&fill=桑`, { responseType: "text" });

      let jsonResponse = JSON.parse(response); let content = jsonResponse.data; let source = "——《发病语录》"; // 不使用trim()


      if (config.图片渲染) {
        if (config.等待提示) {
        await session.send('正在为您获取《发病》。。。请稍后'); let imageUrl = await getImageUrl(config); await session.send(await renderContent(content, source, imageUrl, ctx));
        }
      } else {
        await session.send(('『' + String(content) + '』\n' + String(spaces) + String(source)))
      }

    });
  }





  async function getImageUrl(config: Config): Promise<string> {
    // 定义 imagePath
    let imagePath; if (/^https?:\/\//.test(config.保底图片)) {
      imagePath = config.保底图片;
    } else {
      imagePath = path.resolve(__dirname, config.保底图片);
    }

    const timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id); resolve(imagePath);  // 使用 imagePath 作为保底图片
      }, 5000); // 设置超时时间，例如8秒
    });

    const requests = config.图片api.map(api => axios.get(api));

    let imageUrl; try {
      let response = await Promise.race([...requests, timeout]); imageUrl = response.request.res.responseUrl;
    } catch (error) {
      // 检查 imagePath 是否已经是一个 HTTP 或 HTTPS URL
      if (/^https?:\/\//.test(imagePath)) {
        imageUrl = imagePath;
      } else {

        imageUrl = 'file:///' + imagePath.replace(/\\/g, '/');  // 在错误处理中使用 imagePath
      }
    }
    console.log(imageUrl)
    return imageUrl;
  }






  function getStyleByContentLength(contentLength: number) {
    let fontSize, lineHeight;
    if (contentLength <= 30) {
      fontSize = '45px';
      lineHeight = '1.5';
    } else if (contentLength <= 60) {
      fontSize = '40px';
      lineHeight = '2';
    } else {
      fontSize = '30px';
      lineHeight = '2.5';
    }
    return { fontSize, lineHeight };
  }
  
  async function renderContent(content: string, source: string, imageUrl: string, ctx: Context): Promise<string> {
    const html_style = `width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;background-image:url(${imageUrl});background-size: cover;background-repeat: no-repeat`;
    const { fontSize, lineHeight } = getStyleByContentLength(content.length);
    
    return <html style={html_style}>{
      <div class="quote" style={`color: white;background-color: rgba(0, 0, 0, 0.7);padding: 20px;border-radius: 15px;box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8);text-align: left;width: 70%;display: flex;flex-direction: column;justify-content: center;font-size: ${fontSize};`}>
        <div class="content" style={`margin-bottom: 10px; line-height: ${lineHeight};`}>『{content}』</div>
        <div class="source" style={`text-align: right;font-size: 30px;color: rgba(255, 255, 255, 0.7);transform: skewX(-15deg);`}>{source}</div>
      </div>}
    </html>
  }
  
    


}
