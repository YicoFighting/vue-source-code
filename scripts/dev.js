// 打包 packages 下的模块
// node dev.js 要打包的名字 -f 打包的格式
import minimist from "minimist";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from "esbuild";

// args = 要打包的名字 -f 打包的格式
const args = minimist(process.argv.slice(2));
const __filename = fileURLToPath(import.meta.url); // 获取文件的绝对路径
const __dirname = dirname(__filename); // 获取文件的目录
const require = createRequire(import.meta.url); // cjs 写法
const target = args._[0] || "reactivity"; // 打包的项目
const format = args.f || "esm"; // 模块化规范

// esm 模块无 __dirname
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

// 根据需要进行打包
esbuild
  .context({
    // 入口
    entryPoints: [entry],
    //  reactivity 依赖 shard
    bundle: true,
    // 出口
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    // 打包给浏览器使用
    platform: "browser",
    // 打包格式 iife 全局 global 使用
    format,
    // 可以调试源代码
    sourcemap: true,
    // 全局 name
    globalName: pkg.buildOptions?.name,
  })
  .then((ctx) => {
    console.log("start dev");

    // 监控入口文件持续进行打包处理
    return ctx.watch();
  });
