ARG SPLUNK_VERSION=8.2.9

#####################################################################
# DEPENDENCY STAGE - get root config
#####################################################################
FROM ghcr.io/marcusschiesser/splunk-gitops-builder:v1.2.9 as dependency
# add app configurations to the /tmp/apps folder
COPY ./config/apps /tmp/apps
RUN create-tarballs.sh

##################################################################
# BUILD STAGE
##################################################################
FROM node:16 AS builder
RUN apt update && apt-get install python3-pip -y
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN yarn setup
RUN tar czf kv-editor.tgz --directory /app/packages/kv-editor --transform s/^stage/kv-editor/ stage 

#####################################################################
# BASE STAGE - prepares dependencies and used for dev and prod layers
#####################################################################
FROM splunk/splunk:${SPLUNK_VERSION} as base

USER splunk
# copy apps from dependency stage
COPY --from=dependency /tmp/apps /tmp/apps

#####################################################################
# DEV STAGE - used for local development - no apps precopied
#####################################################################
FROM base AS dev
ENV SPLUNK_APPS_URL="/tmp/apps/splunk-config-dev.tgz"
USER ansible
ENTRYPOINT ["/sbin/entrypoint.sh"]
CMD ["start-service"]

#####################################################################
# STAGING STAGE - used for local staging environments
#####################################################################
FROM base
# Apps that will be generated and added to the Splunk instance
ENV SPLUNK_APPS_URL="/tmp/apps/splunk-config.tgz,/tmp/apps/kv-editor.tgz"
USER ansible
# Copy kv-editor app
COPY --from=builder /app/kv-editor.tgz /tmp/apps/
ENTRYPOINT ["/sbin/entrypoint.sh"]
CMD ["start-service"]
