#!/bin/bash

# 跨平台文件传输应用 - 环境设置脚本

set -e

echo "🚀 开始设置跨平台文件传输应用开发环境..."

# 检查Node.js版本
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 16+ 版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "❌ Node.js 版本过低，需要 16+ 版本，当前版本: $(node -v)"
        exit 1
    fi
    
    echo "✅ Node.js 版本检查通过: $(node -v)"
}

# 检查npm版本
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装"
        exit 1
    fi
    
    echo "✅ npm 版本: $(npm -v)"
}

# 安装根项目依赖
install_root_deps() {
    echo "📦 安装根项目依赖..."
    npm install
    echo "✅ 根项目依赖安装完成"
}

# 安装各模块依赖
install_module_deps() {
    echo "📦 安装各模块依赖..."
    
    # 安装共享模块依赖
    echo "  - 安装共享模块依赖..."
    cd shared && npm install && cd ..
    
    # 安装后端依赖
    echo "  - 安装后端依赖..."
    cd server && npm install && cd ..
    
    # 安装PC端依赖
    echo "  - 安装PC端依赖..."
    cd desktop && npm install && cd ..
    
    # 安装移动端依赖
    echo "  - 安装移动端依赖..."
    cd mobile && npm install && cd ..
    
    echo "✅ 所有模块依赖安装完成"
}

# 构建共享模块
build_shared() {
    echo "🔨 构建共享模块..."
    cd shared && npm run build && cd ..
    echo "✅ 共享模块构建完成"
}

# 创建必要的目录
create_directories() {
    echo "📁 创建必要的目录..."
    
    # 创建日志目录
    mkdir -p server/logs
    mkdir -p desktop/logs
    
    # 创建上传目录
    mkdir -p server/uploads
    
    # 创建构建目录
    mkdir -p server/dist
    mkdir -p desktop/dist
    mkdir -p shared/dist
    
    echo "✅ 目录创建完成"
}

# 设置环境变量文件
setup_env_files() {
    echo "⚙️ 设置环境变量文件..."
    
    # 复制服务器环境变量文件
    if [ ! -f "server/.env" ]; then
        cp server/.env.example server/.env
        echo "  - 已创建 server/.env 文件，请根据需要修改配置"
    else
        echo "  - server/.env 文件已存在"
    fi
    
    echo "✅ 环境变量文件设置完成"
}

# 检查可选依赖
check_optional_deps() {
    echo "🔍 检查可选依赖..."
    
    # 检查MongoDB
    if command -v mongod &> /dev/null; then
        echo "  ✅ MongoDB 已安装: $(mongod --version | head -n1)"
    else
        echo "  ⚠️ MongoDB 未安装，建议安装用于本地开发"
    fi
    
    # 检查Redis
    if command -v redis-server &> /dev/null; then
        echo "  ✅ Redis 已安装: $(redis-server --version)"
    else
        echo "  ⚠️ Redis 未安装，建议安装用于本地开发"
    fi
    
    # 检查Docker
    if command -v docker &> /dev/null; then
        echo "  ✅ Docker 已安装: $(docker --version)"
    else
        echo "  ⚠️ Docker 未安装，建议安装用于容器化部署"
    fi
    
    # 检查React Native CLI
    if command -v react-native &> /dev/null; then
        echo "  ✅ React Native CLI 已安装"
    else
        echo "  ⚠️ React Native CLI 未安装，移动端开发需要安装"
        echo "     运行: npm install -g react-native-cli"
    fi
}

# 运行健康检查
run_health_check() {
    echo "🏥 运行健康检查..."
    
    # 检查TypeScript编译
    echo "  - 检查TypeScript编译..."
    cd shared && npm run build > /dev/null 2>&1 && echo "    ✅ 共享模块编译成功" || echo "    ❌ 共享模块编译失败"
    cd ../server && npx tsc --noEmit > /dev/null 2>&1 && echo "    ✅ 服务器代码编译成功" || echo "    ❌ 服务器代码编译失败"
    cd ../desktop && npx tsc --noEmit > /dev/null 2>&1 && echo "    ✅ PC端代码编译成功" || echo "    ❌ PC端代码编译失败"
    cd ../mobile && npx tsc --noEmit > /dev/null 2>&1 && echo "    ✅ 移动端代码编译成功" || echo "    ❌ 移动端代码编译失败"
    cd ..
    
    echo "✅ 健康检查完成"
}

# 显示下一步操作
show_next_steps() {
    echo ""
    echo "🎉 环境设置完成！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 配置环境变量："
    echo "   - 编辑 server/.env 文件，设置数据库连接等配置"
    echo ""
    echo "2. 启动开发服务："
    echo "   - 后端服务: npm run dev:server"
    echo "   - PC端应用: npm run dev:desktop"
    echo "   - 移动端应用: npm run dev:mobile"
    echo ""
    echo "3. 可选：启动数据库服务"
    echo "   - MongoDB: mongod"
    echo "   - Redis: redis-server"
    echo ""
    echo "4. 或者使用Docker启动所有服务："
    echo "   - docker-compose up -d"
    echo ""
    echo "📚 更多信息请查看各模块的 README.md 文件"
}

# 主函数
main() {
    check_node
    check_npm
    install_root_deps
    install_module_deps
    build_shared
    create_directories
    setup_env_files
    check_optional_deps
    run_health_check
    show_next_steps
}

# 运行主函数
main
