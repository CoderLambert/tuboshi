### 基础构建镜像
ARG BASE_IMAGE
# BASE_IMAGE  需要配置为 reg.yl.com/basic/node:22-bookworm-slim-tools
FROM reg.yl.com/${BASE_IMAGE} AS builder
MAINTAINER ylops
ENV  NODE_ENV dev
WORKDIR /app

#COPY package.json .
#COPY pnpm-lock.yaml .
ARG APP
ADD ${APP}.tar.gz .

# if you located in China, you can use taobao registry to speed up
RUN pnpm install --frozen-lockfile --registry  https://maven.jtexpress.com.cn/nexus3/repository/npm-group-2/

#COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm build

# production stage
FROM reg.yl.com/${BASE_IMAGE}

ARG APP
ARG  LOGDIR

ENV NODE_ENV=production
ENV PM2_INSTANCES=2
ENV PORT=8080

# 禁用遥测并构建
ENV NEXT_TELEMETRY_DISABLED=1

# 阶段 2: 构建应用
WORKDIR /app
COPY --from=builder /app/public ./public
RUN mkdir .next
COPY --from=builder  /app/.next/standalone ./
COPY --from=builder  /app/.next/static ./.next/static
COPY --from=builder /app/docker/entrypoint.sh ./entrypoint.sh


# global runtime packages
RUN  mkdir /.pm2 \
    && chown -R 1000:1000 /.pm2 /app/ ./entrypoint.sh \
    && chmod -R g=u /.pm2 /app/

ARG COMMIT_ID
ENV COMMIT_SHA=${COMMIT_ID}

USER 1000
EXPOSE 8080
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
