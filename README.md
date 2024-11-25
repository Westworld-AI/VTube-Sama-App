# VTube-Sama Beta

VTube-Sama-App 是一个超低上手成本的 AI Vtube项目，支持OpenAI、Ollama、智谱，可在Mac、Windows 安装使用。

# 模块说明

```text 
├── binary          # 视觉模块
├── gui             # GUI
├── mods            # 关联的游戏模组

```
# 功能点

![demo_01.png](docs/demo_01.png)

# 安装文档

## GUI

- 安装依赖
```bash
cd gui
yarn install  && npm run electron-rebuild 
```

- 启动程序
```bash
yarn start
```

- 打包成桌面程序
```bash
yarn package
```